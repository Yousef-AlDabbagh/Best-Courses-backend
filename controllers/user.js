//json web token
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");

const passwordResetToken = require("../models/passwordResetToken");

const { isValidObjectId } = require("mongoose");
const { generateOTP, generateTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/helper");



//......................................  Create  New User   .....................................................

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  // to handle duplicate user
  const oldUser = await User.findOne({ email });
  if (oldUser) return sendError(res, "This email is already in use!");
  // to save the user
  await newUser.save();
  // generate 6-digit OTP
  let OTP = generateOTP();
  //  store OTP  in our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  // send OTP to the user

  var transport = generateTransporter();
  transport.sendMail({
    from: "verification@thebestcourses.com",
    to: newUser.email,
    subject: "Email Verifacation",
    //Email body
    html: ` 
    <p>Your Verification OTP is : </p>
    <h1> ${OTP} </h1> `,
  });
  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

//......................................  Emal verification   .....................................................

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  //checking if the user exist in the db

  if (!isValidObjectId(userId)) return res.json({ error: "Invalid user!" });

  const user = await User.findById(userId);
  if (!user) return sendError(res, " User not found!", 404);

  if (user.isVerified) return sendError(res, "User is Already verified");

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found");

  /**** comparing the hashed OTP with our db  *****/

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Please Enter valid OTP");

  //otherwise user is matched
  user.isVerified = true;
  await user.save();
  // after verifying the user there is no need to save the token,so we're going to delete it
  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateTransporter();
  //sending welcome mail after verify the user
  transport.sendMail({
    from: "verification@thebestcourses.com",
    to: user.email,
    subject: "Welcome Email",
    //Email body
    html: "<h1>Welcome to the best courses, thanks for chosing us  </h1>",
  });

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: "Your email is verified.",
  });
};

//......................................  resend OTP   .....................................................

exports.resendOTP = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!");

  // the user is already logged in inside our app
  if (user.isVerified) return sendError(res, "This Email is already verified!");

  // check  verification token
  const tokenExist = await EmailVerificationToken.findOne({
    owner: userId,
  });
  // if there is a token
  if (tokenExist)
    return sendError(
      res,
      "Only after 1 hour you can request for another token!"
    );

  // generate 6 digit otp
  let OTP = generateOTP();

  //  store OTP  in our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();
  // send OTP to the user
  var transport = generateTransporter();

  transport.sendMail({
    from: "verification@thebestcourses.com",
    to: user.email,
    subject: "Email Verifacation",
    //Email body
    html: `<p>Your Verification OTP is : </p>
    <h1> ${OTP} </h1>`,
  });
  res.json({
    message: "New OTP has been send to your email.",
  });
};

//......................................  forget password   .....................................................

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  // if there is no email
  if (!email) return sendError(res, "Email is missing!");
  // if there is no user
  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found!", 404);

  const alreadyHasToken = await passwordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after 1 hour you can request for another token!"
    );
  //reset token
  const token = await generateRandomByte();
  const newPasswordResetToken = await passwordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  //send reset Password  link to  the user email
  const resetPasswordUrl = `http://localhost:3000/auth/reset-Password?token=${token}&id=${user._id}`;

  const transport = generateTransporter();
  transport.sendMail({
    from: "security@thebestcourses.com",
    to: user.email,
    subject: "Reset Password Link",
    //Email body
    html: `<p> Click her to reset password </p>
    <a href='${resetPasswordUrl}'> Change Password</a>`,
  });
  res.json({ message: "The link has been sent to your email!" });
};

//......................................  token status   .....................................................

exports.tokenStatus = (req, res) => {
  res.json({ valid: true });
};

//......................................  reset password   .....................................................

exports.resetpassword = async (req, res) => {
  const { newPassword, userId } = req.body;
  const user = await User.findById(userId);
  //compare Password method
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );

  user.password = newPassword;
  await user.save();

  await passwordResetToken.findByIdAndDelete(req.resetToken._id);

  // secces message

  const transport = generateTransporter();
  transport.sendMail({
    from: "security@thebestcourses.com",
    to: user.email,
    subject: "Password Reset Successfully",
    //Email body
    html: `<h1> Password Reset Successfully </h1>
          <p>Now you can use the new password.</p>`,
  });
  res.json({
    message: "Password reset successfully, now you can use new password.",
  });
};

//......................................  sign in    ...........................................................

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  //find user by email
  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email Or Password mismatch!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email / Password mismatch!");

  const { _id, name, isVerified, role } = user;
  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);
  res.json({
    user: { id: _id, name, email, role, token: jwtToken, isVerified },
  });
};
