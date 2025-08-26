const express = require("express");
const router = express.Router();
const {
  register_orginization,
  register_user,
  login,
  logout,
  updateProfile,
} = require("../controllers/auth2.controller");
const authMiddleware = require ("../middleware/Auth.middleware");

//User SignUp or Login
// router.post('/oauth/login', );

//For directing to the home page
// router.get('/home',userControllers.home);

//For scanning QR
// router.post('/scan_qr',);

//For directing to the dashboard
// router.get('/dashboard',authController.dashboard);

//For Viewing profile
// router.get('/view_profile',authController.viewprofile);

// organizationregister
router.post("/organization-register", register_orginization);

// new user register
router.post("/register-user", register_user);

// login
router.post("/login", login);

//For logging out
router.post("/logout", logout);

//For updating profile
router.put("/updateProfile",authMiddleware, updateProfile);

module.exports = router;
