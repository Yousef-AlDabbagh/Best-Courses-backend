const router = require("express").Router(); 
const { addReview, updateReview, removeReview, getReviewsByCourse } = require("../controllers/review");
const { isAuth } = require("../middlewares/auth");
const { validateRatings, validate } = require("../middlewares/validator");


//......................................  Review Routes .....................................................

router.post("/add/:courseId", isAuth, validateRatings, validate, addReview);
router.patch("/:reviewId", isAuth, validateRatings, validate, updateReview);
router.delete("/:reviewId", isAuth, removeReview);
router.get("/get-reviews-by-course/:courseId", getReviewsByCourse);

module.exports = router;
