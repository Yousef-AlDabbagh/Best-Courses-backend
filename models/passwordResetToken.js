const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


//...................................... Password Reset Schema  .....................................................

const PasswordResetSchema = mongoose.Schema({

owner:{
    type : mongoose.Schema.Types.ObjectId,
    // ref = the user i belongs to who
    ref : "User",
    required : true
},
token : {
type : String,
required: true
},
createdAt : {
    type : Date,
    expires : 3600, // 1 hour
    default : Date.now(),
   },
});

// bcrypt to hash token as well 
PasswordResetSchema.pre('save', async function(next){
    if(this.isModified('token')){
      this.token =  await bcrypt.hash(this.token,10);
    }
    next();
    });

    /**** comparing the hashed OTP with our db  *****/
    PasswordResetSchema.methods.compareToken = async function(token){

  const result = await bcrypt.compare(token,this.token)
  return result;

 }
   module.exports = mongoose.model("PasswordResetToken", PasswordResetSchema );