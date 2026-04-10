const express = require('express');
const router  = express.Router();
const { getAllUsers,getUserDashboard,blockUser,unblockUser, blockAnnonce, unblockAnnonce, getDashboardStats} = require('../controllers/adminController');

const { auth } = require('../middlewares/auth.middleware');
const isAdmin     = require('../middlewares/admin.middle');
const isVerified     = require('../middlewares/isVerify');


// Protection globale : toutes les routes admin nécessitent protect + isAdmin
router.use(auth, isVerified);

router.get('/stats', getDashboardStats);
router.get('/users',  getAllUsers);
router.get('/users/:userId', getUserDashboard);
router.put('/users/:userId/block', blockUser);
router.put('/users/:userId/unblock', unblockUser);
router.put('/annonces/:annonceId/block', blockAnnonce);
router.put('/annonces/:annonceId/unblock', unblockAnnonce);

module.exports = router;