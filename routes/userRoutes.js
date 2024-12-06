const express = require('express');
const { registerUser, loginUser, updateUser, updateAvatar, deleteAccount } = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update', authenticate, updateUser);
router.post('/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.delete('/delete-account', authenticate, deleteAccount);

module.exports = router;
