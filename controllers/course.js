const {
  sendError,
  formatInstructor,
  relatedCourseAggregation,
  getAverageRatings,
  topRatedCoursesPipeline,
} = require("../utils/helper");
const cloudinary = require("../cloud");
const Course = require("../models/course");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;
const { findById } = require("../models/course");



//......................................    Upload Trailer   .................................................

exports.uploadTrailer = async (req, res) => {
  const { file } = req;
  if (!file) return sendError(res, "Video file is missing");
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: "video",
    }
  );
  res.status(201).json({ url, public_id });
};

//......................................    Update Course   ..................................................

exports.updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { file } = req;

  if (!isValidObjectId(courseId)) return sendError(res, "Invalid Course ID!");


 // Searching The Course inside DB
  const course = await Course.findById(courseId);
  if (!course) return sendError(res, "Course  Not Found!", 404);

  const {
    title,
    overView,
    donor,
    releseDate,
    status,
    type,
    genres,
    tags,
    team,
    language,
  } = req.body;

  course.title = title;
  course.overView = overView;
  course.tags = tags;
  course.releseDate = releseDate;
  course.status = status;
  course.type = type;
  course.genres = genres;
  course.team = team;
  course.language = language;

  if (donor) {
    if (!isValidObjectId(donor)) return sendError(res, "Invalid donor id!");
    course.donor = donor;
  }

  // update poster.
  if (file) {
    // removing poster from cloud if there is any.
    const posterID = course.poster?.public_id;
    if (posterID) {
      const { result } = await cloudinary.uploader.destroy(posterID);
      if (result !== "ok") {
        return sendError(res, "Could not update poster at the moment!");
      }
    }

    // uploading poster to the cloud
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(req.file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });

    const finalPoster = { url, public_id, responsive: [] };

    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalPoster.responsive.push(secure_url);
      }
    }

    course.poster = finalPoster;
  }

  await course.save();

  res.json({
    message: "Course is updated",
    course: {
      id: course._id,
      title: course.title,
      poster: course.poster?.url,
      genres: course.genres,
      status: course.status,
    },
  });
};

//......................................    Create Course   ..................................................

exports.createCourse = async (req, res) => {
  const { file, body } = req;

  const {
    title, overView,  donor,  releseDate,  status, type,
      genres, tags, team,  trailer,   language,  poster,
  } = body;


  // Creating New Course 
  const newCourse = new Course({
    title, overView, donor, releseDate, status,
    type, genres, tags, team, poster, trailer,  language,
  });


  if (donor) {
    if (!isValidObjectId(donor)) return sendError(res, "Invalid donor id!");
    newCourse.donor = donor;
  }

  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(file.path, {
    transformation: {
      width: 1280,
      height: 720,
    },
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      //max_images (Integer - Optional) The maximum number of breakpoints to find, between 3 and 200.
      max_images: 3,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];
  if (breakpoints.length) {
    for (let imgObj of breakpoints) {
      const { secure_url } = imgObj;
      finalPoster.responsive.push(secure_url);
    }
  }
  newCourse.poster = finalPoster;

  // saving course in database
  await newCourse.save();

  res.status(201).json({
    course: {
      id: newCourse._id,
      title,
    },
  });
};
       
//......................................   Update Course  without poster  ..................................................

exports.updateCourseWP = async (req, res) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) return sendError(res, "Invalid Course ID!");
  const course = await Course.findById(courseId);
  if (!course) return sendError(res, "Course Not found", 404);
  // if there is course

  const {
    title, overView, donor, releseDate, status,
    type, genres, tags,team, trailer, language,
  } = req.body;

  course.title = title;
  course.overView = overView;
  course.donor = donor;
  course.releseDate = releseDate;
  course.status = status;
  course.genres = genres;
  course.type = type;
  course.tags = tags;
  course.team = team;
  course.trailer = trailer;
  course.language = language;

  if (donor) {
    if (!isValidObjectId(donor)) return sendError(res, "Invalid donor id!");
    course.donor = donor;
  }

  await course.save();

  res.json({
    message: "Course Updated Succesfully ",
    course,
  });
};

//......................................  Remove Course    ..................................................


exports.removeCourse = async (req, res) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) return sendError(res, "Invalid Course ID!");

  const course = await Course.findById(courseId);
  if (!course) return sendError(res, "Course Not Found!", 404);

  // check if there is poster or not.
  // if yes then we need to remove that from the cloud.

  const posterId = course.poster?.public_id;
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== "ok")
      return sendError(res, "Could not remove poster from cloud!");
  }

  // removing trailer

  const trailerId = course.trailer?.public_id;
  if (!trailerId) return sendError(res, "Could not find trailer in the cloud!");
  const { result } = await cloudinary.uploader.destroy(trailerId, {
    resource_type: "video",
  });

  if (result !== "ok")
    return sendError(res, "Could not remove trailer from cloud!");

  // Remove Course
  await Course.findByIdAndDelete(courseId);

  res.json({ message: "Course removed successfully." });
};


//......................................  Get Courses    .....................................................


exports.getCourses = async (req, res) => {
  const { pageNo = 0, limit = 5 } = req.query;

  const courses = await Course.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  const results = courses.map((course) => ({
    id: course._id,
    title: course.title,
    poster: course.poster?.url,
    responsivePosters: course.poster?.responsive,
    genres: course.genres,
    status: course.status,
  }));

  res.json({ courses: results });
};

//......................................  get Course For Update     .....................................................

exports.getCourseForUpdate = async (req, res) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) return sendError(res, "Id is invalid!");

// populate  lets you reference documents in other collections.
  const course = await Course.findById(courseId).populate("donor team.instructor");

  res.json({
    course: {
      id: course._id,
      title: course.title,
      overView: course.overView,
      poster: course.poster?.url,
      releseDate: course.releseDate,
      status: course.status,
      type: course.type,
      language: course.language,
      genres: course.genres,
      tags: course.tags,
      donor: formatInstructor(course.donor),
      team: course.team.map((t) => {
        return {
          id: t.id,
          profile: formatInstructor(t.instructor),

          leadInstructor: t.leadInstructor,
        };
      }),
    },
  });
};

//......................................  Search Courses     .....................................................


exports.searchCourses = async (req, res) => {
  const { title } = req.query;

  if (!title.trim()) return sendError(res, "Invalid request!");

  const courses = await Course.find({
    title: { $regex: title, $options: "i" },
  });
  res.json({
    results: courses.map((c) => {
      return {
        id: c._id,
        title: c.title,
        poster: c.poster?.url,
        genres: c.genres,
        status: c.status,
      };
    }),
  });
};

//...................................... Get Latest Uploads     .....................................................

exports.getLatestUploads = async (req, res) => {
  const { limit = 5 } = req.query;

  const results = await Course.find({ status: "public" })
    .sort("-createdAt")
    .limit(parseInt(limit));

  const courses = results.map((c) => {
    return {
      id: c._id,
      title: c.title,
      overView: c.overView,
      poster: c.poster?.url,
      responsivePosters: c.poster.responsive,
      trailer: c.trailer?.url,
    };
  });
  res.json({ courses });
};

//...................................... Get Single  Course     .....................................................


exports.getSingleCourse = async (req, res) => {
  //Get information for singl course
  const { courseId } = req.params;
  if (!isValidObjectId(courseId))
    return sendError(res, "Course id is not valid!");

  const course = await Course.findById(courseId).populate("donor team.instructor");


  const reviews = await getAverageRatings(course._id);

  const {
    _id: id, title, overView, team, donor, releseDate,
     genres, tags, language, poster, trailer, type,
  } = course;

  res.json({
    course: {
      id, title, overView, releseDate, genres,
      tags, language, type, poster: poster?.url,
      trailer: trailer?.url,

      team: team.map((t) => ({
        id: t._id,
        profile: {
          id: t.instructor._id,
          name: t.instructor.name,
          avatar: t.instructor?.avatar?.url,
        },
        leadInstructor: t.leadInstructor,
        roleAs: t.roleAs,
      })),

      donor: {
        id: donor._id,
        name: donor.name,
      },
      reviews: { ...reviews },
    },
  });
};

//...................................... Get Related Courses     .....................................................


exports.getRelatedCourses = async (req, res) => {
  const { courseId } = req.params;
  if (!isValidObjectId(courseId)) return sendError(res, "Invalid course id!");

  const course = await Course.findById(courseId);
  const courses = await Course.aggregate(
    relatedCourseAggregation(course.tags, courseId)
  );
  const mapCourses = async (c) => {
    const reviews = await getAverageRatings(c._id);

    return {
      id: c._id,
      title: c.title,
      poster: c.poster,
      responsivePosters: c.responsivePosters,
      reviews: { ...reviews },
    };
  };

  const relatedCourses = await Promise.all(courses.map(mapCourses));
  res.json({ courses: relatedCourses });
};

//......................................  Get Top Rated Courses     .....................................................

exports.getTopRatedCourses = async (req, res) => {
  const { type = "Course" } = req.query;

  const courses = await Course.aggregate(topRatedCoursesPipeline(type));

  const mapCourses = async (c) => {
    const reviews = await getAverageRatings(c._id);

    return {
      id: c._id,
      title: c.title,
      poster: c.poster,
      responsivePosters: c.responsivePosters,
      reviews: { ...reviews },
    };
  };
  const topRatedCourses = await Promise.all(courses.map(mapCourses));
  res.json({ courses: topRatedCourses });
};

//......................................  Search Public Courses     .....................................................

exports.searchPublicCourses = async (req, res) => {
  const { title } = req.query;

  if (!title.trim()) return sendError(res, "Invalid request!");

  const courses = await Course.find({
    title: { $regex: title, $options: "i" },
    status: "public",
  });

  const mapCourses = async (c) => {
    const reviews = await getAverageRatings(c._id);

    return {
      id: c._id,
      title: c.title,
      poster: c.poster?.url,
      responsivePosters: c.poster?.responsive,
      reviews: { ...reviews },
    };
  };
  const results = await Promise.all(courses.map(mapCourses));
  res.json({ results });
};
