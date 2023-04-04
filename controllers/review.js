const { isValidObjectId } = require("mongoose");
const Course = require("../models/course");
const Review = require("../models/review");
const { sendError, getAverageRatings } = require("../utils/helper");



//......................................  Add Review  .....................................................

// The Review contain comment and rating
exports.addReview = async (req, res) => {
  const { courseId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;

  if(!req.user.isVerified) return sendError(res,"Please verify your email first!")
  if (!isValidObjectId(courseId)) return sendError(res, "Invalid Course!");

  const course = await Course.findOne({ _id: courseId, status: "public" });
  if (!course) return sendError(res, "Course not found!", 404);

  const isAlreadyReviewed = await Review.findOne({
    owner: userId,
    parentCourse: course._id,
  });
  if (isAlreadyReviewed)
    return sendError(res, "Invalid request, Your review has already been added!");

  // create review
  const newReview = new Review({
    owner: userId,
    parentCourse: course._id,
    content,
    rating,
  });

  // updating review for course.
  course.reviews.push(newReview._id);
  await course.save();

  // saving new review
  await newReview.save();
  const reviews = await getAverageRatings(course._id);

  res.json({ message: "Your review has been added.", reviews });
};

//......................................  Update Review  .....................................................

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid Review ID!");

  const review = await Review.findOne({ owner: userId, _id: reviewId });
  if (!review) return sendError(res, "Review not found!", 404);

  review.content = content;
  review.rating = rating;

  await review.save();

  res.json({ message: "Your review has been updated." });
};

//......................................  Remove Review  .....................................................

exports.removeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid review ID!");

  const review = await Review.findOne({ owner: userId, _id: reviewId });
  if (!review) return sendError(res, "Invalid request, review not found!");

  const course = await Course.findById(review.parentCourse).select("reviews");
  course.reviews = course.reviews.filter((rId) => rId.toString() !== reviewId);

  await Review.findByIdAndDelete(reviewId);

  await course.save();

  res.json({ message: "Review removed successfully." });
};

//...................................... Get Reviews By Course   .....................................................

exports.getReviewsByCourse = async (req, res) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) return sendError(res, "Invalid course ID!");

  const course = await Course.findById(courseId)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
        select: "name",
      },
    })
    .select("reviews title");

  const reviews = course.reviews.map((r) => {
    const { owner, content, rating, _id: reviewID } = r;
    const { name, _id: ownerId } = owner;

    return {
      id: reviewID,
      owner: {
        id: ownerId,
        name,
      },
      content,
      rating,
    };
  });
 
  res.json({ course: { title: course.title, reviews } });
};
