const express = require('express');
const router = express.Router();
const {
  googleLogin,
  createCheckoutSession,
} = require('../controllers/bookingController');

router.post('/google-login', googleLogin);
router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;