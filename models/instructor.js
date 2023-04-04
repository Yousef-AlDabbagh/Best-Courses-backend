const mongoose = require("mongoose");

//...................................... Instructor Schema  .....................................................

const instructorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    about: {
      type: String,
      trim: true,
      required: true,
    },
    gender: {
      type: String,
      trim: true,
      required: true,
    },
    avatar: {
      type: Object,
      url: String,
      public_id: String,
    },
  },
  //created At
  { timestamps: true }
);
// mongoose index
instructorSchema.index({ name: "text" });
module.exports = mongoose.model("Instructor", instructorSchema);
