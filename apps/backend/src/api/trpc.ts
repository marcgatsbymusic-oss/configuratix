import { PrismaClient } from '@prisma/client';
import { SyncService } from '../modules/sync/routers/syncRouter';
import { WorkflowRouter } from '../modules/workflow/routers/workflowRouter';
import { OrderRouter } from '../modules/orders/routers/orderRouter';
import { WorkflowEngine } from '../modules/workflow/services/WorkflowEngine';
import { OverrideService } from '../modules/workflow/services/OverrideService';

// This file acts as the root entry point for the TRPC routers in our scaffold.
// In a full implementation, this would use @trpc/server.

export class AppRouter {
  public sync: SyncService;
  public workflow: WorkflowRouter;
  public orders: OrderRouter;

  constructor() {
    const prisma = new PrismaClient();
    const workflowEngine = new WorkflowEngine(prisma);
    const overrideService = new OverrideService(prisma);

    this.sync = new SyncService(prisma, workflowEngine);
    this.workflow = new WorkflowRouter(prisma, overrideService);
    this.orders = new OrderRouter(prisma);
  }
}

// Export a singleton instance for the app to consume
export const appRouter = new AppRouter();
