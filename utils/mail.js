

// generate 6-digit OTP
// otp_length = if we want to put more than 6 digit
const nodemailer= require("nodemailer");
exports.generateOTP =  (otp_length = 6) => {
let OTP = "";

for(let i = 1;i<= otp_length; i++){
  //  randomValue  generate number between 0 and 9
  const randomValue = Math.round( Math.random() * 9)
  OTP+= randomValue;
}
return OTP;
};


exports.generateTransporter = () =>
 nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS
    },
  });