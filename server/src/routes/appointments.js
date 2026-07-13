const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createRules, updateRules, listRules, availabilityRules,
  validate, list, create, updateStatus, getAvailability,
} = require('../controllers/appointmentController');

const router = Router();

router.use(authenticate);

// Must be before /:id to avoid 'availability' being caught as a Mongo ID
router.get('/availability', availabilityRules, validate, getAvailability);
router.get('/',     listRules, validate, list);
router.post('/',    authorize(['admin', 'receptionist', 'patient']), createRules, validate, create);
router.put('/:id',  updateRules, validate, updateStatus);

module.exports = router;
