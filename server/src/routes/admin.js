const express      = require('express');
const router       = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(protect, requireRole('admin'));

const adminController    = require('../controllers/adminController');
const documentController = require('../controllers/documentController');
const uploadMiddleware    = require('../middleware/upload');

// Dashboard
router.get('/stats', asyncHandler(adminController.getStats));

// Clients
router.get('/clients',        asyncHandler(adminController.getClients));
router.post('/clients',       asyncHandler(adminController.createClient));
router.get('/clients/:id',    asyncHandler(adminController.getClient));
router.put('/clients/:id',    asyncHandler(adminController.updateClient));
router.delete('/clients/:id', asyncHandler(adminController.deactivateClient));

// Projects
router.get('/projects',                      asyncHandler(adminController.getProjects));
router.post('/projects',                     asyncHandler(adminController.createProject));
router.get('/projects/:id',                  asyncHandler(adminController.getProject));
router.put('/projects/:id',                  asyncHandler(adminController.updateProject));
router.delete('/projects/:id',               asyncHandler(adminController.deleteProject));
router.get('/projects/:id/requirements',     asyncHandler(adminController.getProjectRequirements));

// Files
router.post('/files/upload', uploadMiddleware.single('file'), asyncHandler(adminController.uploadFile));
router.get('/files',                                           asyncHandler(adminController.getFiles));
router.patch('/files/:id',                                     asyncHandler(adminController.updateFile));
router.delete('/files/:id',                                    asyncHandler(adminController.deleteFile));

// Status updates
router.get('/status-updates',        asyncHandler(adminController.getStatusUpdates));
router.post('/status-updates',       asyncHandler(adminController.createStatusUpdate));
router.delete('/status-updates/:id', asyncHandler(adminController.deleteStatusUpdate));

// Feedback
router.get('/feedback',       asyncHandler(adminController.getAllFeedback));
router.patch('/feedback/:id', asyncHandler(adminController.updateFeedback));

// Support tickets
router.get('/support',       asyncHandler(adminController.getAllTickets));
router.patch('/support/:id', asyncHandler(adminController.respondToTicket));

// Documents
router.post('/document/send', asyncHandler(documentController.sendDocument));

// Messages (in-portal chat)
router.get('/messages',                   asyncHandler(adminController.getAllProjectMessages));
router.get('/messages/:projectId',        asyncHandler(adminController.getProjectMessages));
router.post('/messages',                  asyncHandler(adminController.sendAdminMessage));

// Email Composer
router.get('/email/clients',              asyncHandler(adminController.getClientsForEmail));
router.post('/email/send',                asyncHandler(adminController.sendEmailToClient));

module.exports = router;
