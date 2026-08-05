import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { UserAdministrationService } from './modules/identity/services/UserAdministrationService';
import { AppRole, hasPermission, AppAction } from './modules/identity/models/PermissionMatrix';

import multer from 'multer';
import { OrderImportService } from './modules/orders/services/OrderImportService';
import { CsvOrderParserAdapter } from './modules/orders/adapters/CsvOrderParserAdapter';
import { OpeningAssignmentService } from './modules/orders/services/OpeningAssignmentService';

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();
const adminService = new UserAdministrationService(prisma);

const upload = multer({ storage: multer.memoryStorage() });
const orderImportService = new OrderImportService(prisma, new CsvOrderParserAdapter());
const openingAssignmentService = new OpeningAssignmentService(prisma);

app.use(cors());
app.use(express.json());

const mockRequireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'] as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing x-mock-role header' });
  }
  (req as any).user = {
    userId: 'mock-user-1',
    roles: [authHeader.replace('Bearer ', '') as AppRole],
    organisationId: 'mock-org-1'
  };
  next();
};

const requirePermission = (action: AppAction) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.roles.some((role: AppRole) => hasPermission(role, action))) {
      return res.status(403).json({ error: `Forbidden: requires ${action}` });
    }
    next();
  };
};

// --- Identity API Routes ---

app.get('/api/identity/me', mockRequireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

app.get('/api/identity/users', mockRequireAuth, requirePermission(AppAction.MANAGE_USERS_ROLES), async (req, res) => {
  const users = await prisma.user.findMany({
    include: { roleAssignments: { include: { role: true } } }
  });
  res.json({ users });
});

app.post('/api/identity/users', mockRequireAuth, requirePermission(AppAction.MANAGE_USERS_ROLES), async (req, res) => {
  const { email, name, roleName } = req.body;
  const actorId = (req as any).user.userId;
  
  try {
    const user = await adminService.createUser(actorId, email, name);
    if (roleName) {
      await adminService.assignRole(actorId, user.id, roleName, (req as any).user.organisationId);
    }
    res.json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/identity/audit', mockRequireAuth, requirePermission(AppAction.MANAGE_USERS_ROLES), async (req, res) => {
  const logs = await prisma.auditLogEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ logs });
});

// --- Orders API Routes ---

app.post('/api/orders/import/csv', mockRequireAuth, requirePermission(AppAction.IMPORT_ORDERS_CREATE_JOBS), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const list = await orderImportService.importOrder(req.file.buffer);
    res.json({ list });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders/lists', mockRequireAuth, requirePermission(AppAction.IMPORT_ORDERS_CREATE_JOBS), async (req, res) => {
  const lists = await prisma.installationList.findMany({
    include: { order: true, items: { include: { opening: true } } }
  });
  res.json({ lists });
});

app.post('/api/orders/openings', mockRequireAuth, requirePermission(AppAction.IMPORT_ORDERS_CREATE_JOBS), async (req, res) => {
  const { room, elevation, reference } = req.body;
  try {
    const opening = await openingAssignmentService.createOpening(room, elevation, reference);
    res.json({ opening });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/orders/items/:itemId/opening', mockRequireAuth, requirePermission(AppAction.IMPORT_ORDERS_CREATE_JOBS), async (req, res) => {
  const { itemId } = req.params;
  const { openingId } = req.body;
  try {
    const item = await openingAssignmentService.assignItemToOpening(itemId as string, openingId as string);
    res.json({ item });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

import { DeliveryService } from './modules/orders/services/DeliveryService';
const deliveryService = new DeliveryService(prisma);

app.get('/api/openings', mockRequireAuth, requirePermission(AppAction.GENERATE_QR_LABELS), async (req, res) => {
  try {
    const openings = await prisma.opening.findMany({
      include: {
        items: true
      }
    });
    res.json({ openings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/by-shipment/:shipmentNumber', mockRequireAuth, requirePermission(AppAction.RESOLVE_DISCREPANCIES), async (req, res) => {
  try {
    const list = await deliveryService.getInstallationListByShipment(req.params.shipmentNumber as string);
    res.json({ list });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/delivery/reconcile-item', mockRequireAuth, requirePermission(AppAction.RESOLVE_DISCREPANCIES), async (req, res) => {
  try {
    const { itemId, scannedBarcode, status } = req.body;
    const userId = (req as any).user.userId;
    const item = await deliveryService.reconcileItem(itemId, scannedBarcode, status, userId);
    res.json({ item });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/delivery/discrepancy', mockRequireAuth, requirePermission(AppAction.RESOLVE_DISCREPANCIES), async (req, res) => {
  try {
    const { itemId, type, reason, photoUrl } = req.body;
    const userId = (req as any).user.userId;
    const discrepancy = await deliveryService.logDiscrepancy(itemId, type, reason, photoUrl, userId);
    res.json({ discrepancy });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
