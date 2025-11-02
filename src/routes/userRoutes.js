const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middlewares/auth');

router.get('/', auth, UserController.index);
router.post('/', auth, UserController.store);
router.put('/:id', auth, UserController.update);
router.delete('/:id', auth, UserController.destroy);

module.exports = router;
