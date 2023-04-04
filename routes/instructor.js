const express = require("express");
const {
  createInstructor,
  updateInstructor,
  removeInstructor,
  searchInstructor,
  getLatestInstructors,
  getSingleInstructor,
  getInstructors,
} = require("../controllers/instructor");
const { isAuth, isAdmin } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const {
  instructorInfoValidator,
  validate,
} = require("../middlewares/validator");

const router = express.Router();


//...................................... Create Instructor .....................................................

router.post(
  "/create",
  isAuth, 
  isAdmin,// to make the route private
  uploadImage.single("avatar"),
  instructorInfoValidator,
  validate,
  createInstructor
);

//...................................... Update Instructor .....................................................

router.post(
  "/update/:instructorId",
  isAuth,
  isAdmin,
  uploadImage.single("avatar"),
  instructorInfoValidator,
  validate,
  updateInstructor
);

//......................................  Instructor Routes .....................................................


router.delete("/:instructorId", isAuth, isAdmin, removeInstructor);
router.get("/search", isAuth, isAdmin, searchInstructor);
router.get("/latest-uploads", isAuth, isAdmin, getLatestInstructors);
router.get("/instructors", isAuth, isAdmin, getInstructors);
router.get("/single/:id", getSingleInstructor);
module.exports = router;
