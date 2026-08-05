import { describe, it, expect } from 'vitest';
import { AuthorizationService, UserContext } from '../services/AuthorizationService';
import { AppRole } from '../models/PermissionMatrix';

describe('AuthorizationService - Separation of Duties', () => {
  const authService = new AuthorizationService();

  it('should allow a SUPERVISOR to approve overrides for another worker', () => {
    const supervisor: UserContext = {
      userId: 'supervisor-123',
      organisationId: 'org-1',
      roles: [AppRole.SUPERVISOR],
    };

    const targetWorkerId = 'worker-456';
    const canApprove = authService.canApproveOverride(supervisor, targetWorkerId);
    
    expect(canApprove).toBe(true);
  });

  it('should DENY a SUPERVISOR from approving an override on their own work', () => {
    const supervisor: UserContext = {
      userId: 'supervisor-123',
      organisationId: 'org-1',
      roles: [AppRole.SUPERVISOR],
    };

    const targetWorkerId = 'supervisor-123'; // Same ID
    const canApprove = authService.canApproveOverride(supervisor, targetWorkerId);
    
    expect(canApprove).toBe(false); // Must be denied due to separation of duties
  });

  it('should DENY an INSTALLER from approving an override, even if it is not their work', () => {
    const installer: UserContext = {
      userId: 'installer-123',
      organisationId: 'org-1',
      roles: [AppRole.INSTALLER],
    };

    const targetWorkerId = 'worker-456';
    const canApprove = authService.canApproveOverride(installer, targetWorkerId);
    
    expect(canApprove).toBe(false);
  });

  it('should DENY a dual-roled INSTALLER+SUPERVISOR from approving an override on their own work', () => {
    const dualRoleUser: UserContext = {
      userId: 'dual-123',
      organisationId: 'org-1',
      roles: [AppRole.INSTALLER, AppRole.SUPERVISOR],
    };

    const targetWorkerId = 'dual-123'; // Their own work as an installer
    const canApprove = authService.canApproveOverride(dualRoleUser, targetWorkerId);
    
    expect(canApprove).toBe(false); // The separation of duties MUST override their supervisor role
  });

  it('should allow a dual-roled INSTALLER+SUPERVISOR to approve an override for someone else', () => {
    const dualRoleUser: UserContext = {
      userId: 'dual-123',
      organisationId: 'org-1',
      roles: [AppRole.INSTALLER, AppRole.SUPERVISOR],
    };

    const targetWorkerId = 'installer-456'; // Someone else's work
    const canApprove = authService.canApproveOverride(dualRoleUser, targetWorkerId);
    
    expect(canApprove).toBe(true);
  });
});
