const Instructor = require("../models/instructor");
const {
  sendError,
  uploadImageToCloud,
  formatInstructor,
} = require("../utils/helper");
//free cloud storage
const { isValidObjectId } = require("mongoose");
const cloudinary = require("../cloud");



//......................................  create Instructor   .....................................................

exports.createInstructor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const newInstructor = new Instructor({ name, about, gender });
  if (file) {
    // uploading image file to the cloud
    const { url, public_id } = await uploadImageToCloud(file.path);
    newInstructor.avatar = { url, public_id };
  }
  await newInstructor.save();
  res.status(201).json({ instructor: formatInstructor(newInstructor) });
};

//......................................  update Instructor  .....................................................

exports.updateInstructor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const { instructorId } = req.params;

  if (!isValidObjectId(instructorId)) return sendError(res, "Invalid request!");

  const instructor = await Instructor.findById(instructorId);
  if (!instructor) return sendError(res, "Invalid request, record not found!");

  const public_id = instructor.avatar?.public_id;

  // remove old image if there was one
  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Could not remove image from cloud!");
    }
  }

  // upload new avatar if there is one
  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    instructor.avatar = { url, public_id };
  }

  instructor.name = name;
  instructor.about = about;
  instructor.gender = gender;

  await instructor.save();

  res.status(201).json(formatInstructor(instructor));
};

//......................................  Remove Instructor  .....................................................

exports.removeInstructor = async (req, res) => {
  const { instructorId } = req.params;

  if (!isValidObjectId(instructorId)) return sendError(res, "Invalid request!");

  const instructor = await Instructor.findById(instructorId);
  if (!instructor) return sendError(res, "Invalid request, record not found!");

  const public_id = instructor.avatar?.public_id;

  // remove old image if there was one
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Could not remove image from cloud!");
    }
  }

  await Instructor.findByIdAndDelete(instructorId);
  res.json({ message: "Record removed succssfully." });
};

//......................................  Search Instructor   .....................................................

exports.searchInstructor = async (req, res) => {
  const { name } = req.query;
  if (!name.trim()) return sendError(res, "Invalid request!");
  const result = await Instructor.find({
    name: { $regex: name, $options: "i" },
  });

  const instructors = result.map((instructor) => formatInstructor(instructor));
  res.json({ results: instructors });
};

//......................................  Fetch Latest Instructors  .....................................................

exports.getLatestInstructors = async (req, res) => {
  const result = await Instructor.find().sort({ createdAt: "-1" }).limit(12);

 //Created At "-1" Descending Order |||| Created At "1" Ascending Order

  const instructors = result.map((instructor) => formatInstructor(instructor));
  res.json(instructors);
};

//......................................  Get Single Instructor .....................................................

exports.getSingleInstructor = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) return sendError(res, "Invalid request!");

  const instructor = await Instructor.findById(id);
  if (!instructor)
    return sendError(res, "Invalid request, instructor not found!", 404);
  res.json({ instructor: formatInstructor(instructor) });
};

//......................................  Get  Instructors .....................................................

exports.getInstructors = async (req, res) => {
  const { pageNo, limit } = req.query;

  const instructors = await Instructor.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  const profiles = instructors.map((instructor) =>
    formatInstructor(instructor)
  );
  res.json({
    profiles,
  });
};
