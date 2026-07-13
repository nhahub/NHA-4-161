const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createRules, listRules, removeRules,
  validate, list, create, remove,
} = require('../controllers/blockTimeController');

const router = Router();

router.use(authenticate);
router.use(authorize(['doctor', 'admin']));

router.get('/',     listRules,   validate, list);
router.post('/',    createRules, validate, create);
router.delete('/:id', removeRules, validate, remove);

module.exports = router;
