import { Router } from 'express';
import { getComplaints, getComplaintById, createComplaint, updateComplaintStatus, deleteComplaint } from './controllers/complaintsController.js';
import { predictComplaint, getModelEvaluation } from './controllers/mlController.js';
import { getAnalytics } from './controllers/analyticsController.js';
import { login, register } from './controllers/authController.js';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicSense Backend API',
    timestamp: new Date().toISOString()
  });
});

// Auth
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/register', register);

// Complaints REST endpoints
apiRouter.get('/complaints', getComplaints);
apiRouter.post('/complaints', createComplaint);
apiRouter.get('/complaints/:id', getComplaintById);
apiRouter.patch('/complaints/:id/status', updateComplaintStatus);
apiRouter.delete('/complaints/:id', deleteComplaint);

// ML endpoints
apiRouter.post('/predict', predictComplaint);
apiRouter.get('/model-evaluation', getModelEvaluation);

// Analytics
apiRouter.get('/analytics', getAnalytics);
