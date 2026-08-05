import { AppAction, AppRole, hasPermission } from '../models/PermissionMatrix';

export interface UserContext {
  userId: string;
  organisationId: string;
  roles: AppRole[];
}

export class AuthorizationService {
  /**
   * Evaluates if a user has permission to perform a specific action globally
   * based on the union of all their roles.
   */
  public canPerformAction(user: UserContext, action: AppAction): boolean {
    return user.roles.some((role) => hasPermission(role, action));
  }

  /**
   * FR-1.9 — Separation of duties
   * An installer cannot approve an override on their own work, regardless of what other roles they hold.
   * This evaluates whether the user can approve a specific override request.
   */
  public canApproveOverride(user: UserContext, targetWorkerUserId: string): boolean {
    if (!this.canPerformAction(user, AppAction.APPROVE_OVERRIDES)) {
      return false; // Does not have the supervisor capability
    }
    
    // Separation of duties check: cannot approve own work
    if (user.userId === targetWorkerUserId) {
      return false;
    }

    return true;
  }
}
