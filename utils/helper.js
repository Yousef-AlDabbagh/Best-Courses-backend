//The crypto.randomBytes() method is used to generate a cryptographically well-built artificial random data and the number of bytes to be generated in the written code.

const crypto = require("crypto");
const cloudinary = require("../cloud");
const Review = require("../models/review");
exports.sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error });
};



//......................................  Generate Random Byte    .....................................................

exports.generateRandomByte = () => {
//This method accept two parameters
// size:  which indicates the number of bytes to be generated. and a callback function
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      // if there is no error
      const buffString = buff.toString("hex");
      console.log(buffString);
      resolve(buffString);
    });
  });
};

//......................................  Handle Not Found   .....................................................

exports.handleNotFound = (req, res) => {
  this.sendError(res, "Not Found", 404);
};

//......................................  Upload Image To Cloud   .....................................................

exports.uploadImageToCloud = async (file) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    { gravity: "face", height: 500, width: 500, crop: "thumb" }
  );

  return { url, public_id };
};

//......................................  Format Instructor    .....................................................

exports.formatInstructor = (instructor) => {
  const { name, about, gender, avatar, _id } = instructor;
  return {
    id: _id,
    name,
    about,
    gender,
    avatar: avatar?.url,
  };
};

//......................................  Average Rating    .....................................................

exports.averageRatingPipeline = (courseId) => {
  // calculate average rating for single course

  return [
    {
      $lookup: {
        from: "Review",
        localField: "rating",
        foreignField: "_id",
        as: "avgRat",
      },
    },
    {
      $match: { parentCourse: courseId },
    },
    {
      $group: {
        _id: null,
        ratingAvg: {
          $avg: "$rating",
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ];
};

//...................................... Related Course    .....................................................

exports.relatedCourseAggregation = (tags, courseId) => {
  return [
    {
      $lookup: {
        from: "Course",
        localField: "tags",
        foreignField: "_id",
        as: "relatedCourses",
      },
    },
    {
      $match: {
        tags: { $in: [...tags] },
        _id: { $ne: courseId },
      },
    },
    {
      $project: {
        title: 1,
        poster: "$poster.url",
        responsivePosters: "$poster.responsive",
      },
    },
    {
      $limit: 5,
    },
  ];
};

//......................................  Top Rated Courses    .....................................................

exports.topRatedCoursesPipeline = (type) => {
  const matchOptions = {
    reviews: { $exists: true },
    status: { $eq: "public" },
  };

  if (type) matchOptions.type = { $eq: type };
  return [
    {
      $lookup: {
        from: "Course",
        localField: "reviews",
        foreignField: "_id",
        as: "topRated",
      },
    },
    {
      $match: matchOptions
    },
    {
      $project: {
        title: 1,
        poster: "$poster.url",
        responsivePosters: "$poster.responsive",
        reviewCount: { $size: "$reviews" },
      },
    },
    {
      $sort: {
        reviewCount: -1,
      },
    },
    {
      $limit: 5,
    },
  ];
};

//......................................  Get Average Ratings    .....................................................

exports.getAverageRatings = async (courseId) => {
  const [aggregatedResponse] = await Review.aggregate(
    this.averageRatingPipeline(courseId)
  );
  const reviews = {};

  if (aggregatedResponse) {
    const { ratingAvg, reviewCount } = aggregatedResponse;
    reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1);
    reviews.reviewCount = reviewCount;
  }

  return reviews;
};
