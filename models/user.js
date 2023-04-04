const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//...................................... User Schema  .....................................................

const userSchema = mongoose.Schema({
  name: {
    type: String,
    // white spaces will be removed from both sides of the string.
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    // email must be unique among users
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  role: {
    type: String,
    required: true,
    default: "user",
    // we want to accept one of these roles
    enum: ["admin", "user"],
  },
});
// before saving the file we will run this function
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) { 
    // 10 is the salt round
    // the higher the number => take long time to hack
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};
module.exports = mongoose.model("User", userSchema);
