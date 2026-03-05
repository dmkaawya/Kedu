import express from 'express';
import { getSchoolAdminDashboard, getSuperAdminDashboard } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';

const router = express.Router();

router.get('/school-admin', authenticate, authorize('school_admin'), enforceDataIsolation, getSchoolAdminDashboard);
router.get('/super-admin', authenticate, authorize('super_admin'), getSuperAdminDashboard);

export default router;
