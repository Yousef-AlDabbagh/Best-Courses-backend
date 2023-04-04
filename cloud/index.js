const cloudinary = require("cloudinary").v2;

//cloudinary is an end-to-end image- and video-management solution for websites and mobile apps, covering everything from image and video uploads, storage.
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
