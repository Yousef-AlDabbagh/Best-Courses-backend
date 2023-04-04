const express = require("express");

const { isAuth } = require("../middlewares/auth");
const {
  createUser,
  verifyEmail,
  resendOTP,
  forgetPassword,
  tokenStatus,
  resetpassword,
  signIn,
} = require("../controllers/user");

const { isValidPassResetToken } = require("../middlewares/user");
const {
  userValidator,
  validate,
  validatePassword,
  signInValidator,
} = require("../middlewares/validator");

const router = express.Router();

//......................................  User Routes .....................................................


//validate is a middlware to validate email & password & name

router.post("/user-create", userValidator, validate, createUser);
router.post("/sign-in", signInValidator, validate, signIn);

router.post("/verify-email", verifyEmail);
// Resend OTP Route
router.post("/resend-otp", resendOTP);
router.post("/forgetPassword", forgetPassword);
router.post("/verify-pass-reset-token", isValidPassResetToken, tokenStatus);


router.post(
  "/reset-password",
  validatePassword,
  validate,
  isValidPassResetToken,
  resetpassword
);

//  isAuth Endpoint
router.get("/is-auth", isAuth, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
  });
});
module.exports = router;
