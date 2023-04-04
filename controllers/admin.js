const Course = require("../models/course");
const Review = require("../models/review");
const User = require("../models/user");
const {
  topRatedCoursesPipeline,
  getAverageRatings,
} = require("../utils/helper");


//......................................  Get App Info     .....................................................

// Fetching Number of courses & Revies & Users
exports.getAppInfo = async (req, res) => {
  const courseCount = await Course.countDocuments();
  const reviewCount = await Review.countDocuments();
  const userCount = await User.countDocuments();

  res.json({ appInfo: { courseCount, reviewCount, userCount } });
};

//......................................  Get Most Rated    .....................................................

// Fetching The Top Rated Courses
exports.getMostRated = async (req, res) => {
  const courses = await Course.aggregate(topRatedCoursesPipeline());

  const mapCourses = async (c) => {
    const reviews = await getAverageRatings(c._id);

    return {
      id: c._id,
      title: c.title,
      reviews: { ...reviews },
    };
  };
  const topRatedCourses = await Promise.all(courses.map(mapCourses));
  res.json({ courses: topRatedCourses });
};
