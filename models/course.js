const mongoose = require("mongoose");
const genres = require("../utils/genres");

//......................................  Course Schema   .....................................................

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    overView: {
      type: String,
      trim: true,
      required: true,
    },
    donor: {
        // objectID to fetch the profile of the Donor
        type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    releseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      // one of these two
      //if the course is private only the admin can see it
      enum: ["public", "private"],
    },

    type: {
      type: String,
      required: true,
    },

    
    //  Genres

    genres: {
      type: [String],
      required: true,
      enum: genres,
    },
// to get similiar courses
    tags : {
      type: [String],
      required: true,
    },
    team: [
      {
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
        leadInstructor: Boolean,
      },
    ],
 
    poster: {
      type: Object,
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      responsive: [URL],
      required: true,
    },
    trailer: {
      type: Object,
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      required: true,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    language: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);


