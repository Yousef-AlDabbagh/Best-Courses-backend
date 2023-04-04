const { check, validationResult } = require("express-validator");
const genres = require("../utils/genres");
const { isValidObjectId } = require("mongoose");
//user middleware

//......................................  User Validator     .....................................................

exports.userValidator =
  // name check
  [
    check("name").trim().not().isEmpty().withMessage("Name is Missing"),
    // check  for email
    check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
    //password check
    check("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("password is missing")
      .isLength({ min: 8, max: 20 })
      .withMessage("password must be between 8 and 20 characters"),
  ];

//......................................  validate Password     .....................................................

exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("password must be between 8 and 20 characters"),
];

//......................................  sign In Validator   .....................................................

exports.signInValidator = [
  // check  for email
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  //password check
  check("password").trim().not().isEmpty().withMessage("password is missing"),
];

//......................................  Instructor Validator     .....................................................

exports.instructorInfoValidator = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Instructor name is missing!"),
  check("about")
    .trim()
    .not()
    .isEmpty()
    .withMessage("About is a required field!"),
  check("gender")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Gender is a required field!"),
];

//......................................  Course Validator    .....................................................

exports.validateCourse = [
  // title validate
  check("title").trim().not().isEmpty().withMessage("Course title is missing!"),
  // overview validate
  check("overView")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Overview is important!"),
  // language validate
  check("language").trim().not().isEmpty().withMessage("Language is missing!"),
  // release date validate
  check("releseDate").isDate().withMessage("Relese date is missing!"),
  // status validate
  check("status")
    .isIn(["public", "private"])
    .withMessage("Course status must be public or private!"),
  // type validate
  check("type").trim().not().isEmpty().withMessage("Course type is missing!"),
  // Genres validate

  check("genres")
    .isArray()
    .withMessage("Genres must be an array of strings!")
    .custom((value) => {
      for (let g of value) {
        if (!genres.includes(g)) throw Error("Invalid genres!");
      }

      return true;
    }),
  // tags validate
  check("tags")
    .isArray({ min: 1 })
    .withMessage("Tags must be an array of strings!")
    .custom((tags) => {
      for (let t of tags) {
        if (typeof t !== "string")
          throw Error("Tags must be an array of strings!");
      }

      return true;
    }),

  // team validate
  check("team")
    .isArray()
    .withMessage("Team must be an array of objects!")
    .custom((team) => {
      for (let t of team) {
        if (!isValidObjectId(t.instructor))
          throw Error("Invalid team id inside team!");

        if (typeof t.leadInstructor !== "boolean")
          throw Error(
            "Only accepted boolean value inside leadInstructor inside team!"
          );

        return true;
      }
    }),
 
];

//......................................  Trailer Validator   .....................................................

(exports.validateTrailer = check("trailer")
  .isObject()
  .withMessage("trailer must be an object with url and public_id")
  .custom(({ url, public_id }) => {
    try {
      const result = new URL(url);
      if (!result.protocol.includes("http"))
        throw Error("Trailer url is invalid!");

      const arr = url.split("/");
      const publicId = arr[arr.length - 1].split(".")[0];

      if (public_id !== publicId) throw Error("Trailer public_id is invalid!");

      return true;
    } catch (error) {
      throw Error("Trailer url is invalid!");
    }
  })),

  //...................................... validate Ratings    .....................................................

  (exports.validateRatings = check(
    "rating",
    "Rating must be a number between 0 and 10"
  ).isFloat({ min: 0, max: 10 }));



//......................................  validate    .....................................................
//validation Result store error if exist
exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }
  next();
};
