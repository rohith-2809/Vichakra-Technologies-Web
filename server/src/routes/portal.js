const express      = require('express');
const router       = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// All portal routes require authentication + client role
router.use(protect, requireRole('client'));

const portalController = require('../controllers/portalController');
const uploadMiddleware  = require('../middleware/upload');

// Projects & status
router.get('/projects',              asyncHandler(portalController.getMyProjects));
router.get('/status-updates',        asyncHandler(portalController.getStatusUpdates));
router.patch('/onboarding-complete', asyncHandler(portalController.completeOnboarding));

// Requirements
router.get('/requirements/:projectId',  asyncHandler(portalController.getRequirements));
router.post('/requirements',            asyncHandler(portalController.saveRequirements));
router.patch('/requirements/:id',       asyncHandler(portalController.updateRequirements));
router.post(
  '/requirements/:id/files',
  uploadMiddleware.array('files', 10),
  asyncHandler(portalController.uploadRequirementFiles)
);

// Files (public files shared by admin)
router.get('/files/:projectId', asyncHandler(portalController.getProjectFiles));

// Feedback
router.get('/feedback/:projectId', asyncHandler(portalController.getFeedback));
router.post('/feedback',           asyncHandler(portalController.submitFeedback));

// Support tickets
router.get('/support',  asyncHandler(portalController.getMyTickets));
router.post('/support', asyncHandler(portalController.createTicket));

module.exports = router;
