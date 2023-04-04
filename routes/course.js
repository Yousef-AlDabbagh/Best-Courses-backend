const express = require("express");
const {
      uploadTrailer,
      createCourse,
      removeCourse,
      getCourses,
      getCourseForUpdate,
      updateCourse,
      searchCourses,
      getLatestUploads,
      getSingleCourse,
      getRelatedCourses,
      getTopRatedCourses,
      searchPublicCourses,
     } = require("../controllers/course");
const { isAuth, isAdmin } = require("../middlewares/auth");
const { parseData } = require("../middlewares/helper");
 const { uploadVideo, uploadImage } = require("../middlewares/multer");

const { 
  validateCourse,
   validate ,
   validateTrailer,
  } = require("../middlewares/validator");

const router = express.Router();

//...................................... Uploading trailer   .....................................................

router.post(
  "/upload-trailer",
  isAuth,
  isAdmin,
  uploadVideo.single("video"),
  uploadTrailer
);

//...................................... Create Course  .....................................................

router.post(
  "/create",
  isAuth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  validateCourse,
  validateTrailer,
  validate,
  createCourse
);

// 
router.patch(
  "/update/:courseId",
  isAuth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  validateCourse,
  validate,
  updateCourse
);

// Course Routes for admin
router.delete('/:courseId',isAuth,isAdmin,removeCourse);
router.get("/courses", isAuth, isAdmin, getCourses);
router.get("/for-update/:courseId", isAuth, isAdmin, getCourseForUpdate);
router.get("/search", isAuth, isAdmin, searchCourses);

//Course Routes for normal users
router.get("/latest-uploads", getLatestUploads);
router.get("/single/:courseId", getSingleCourse);
router.get("/related/:courseId", getRelatedCourses);
router.get("/top-rated", getTopRatedCourses);
router.get("/search-public", searchPublicCourses);

module.exports = router;
