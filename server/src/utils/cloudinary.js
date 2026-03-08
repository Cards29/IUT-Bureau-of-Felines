const cloudinary = require("cloudinary").v2;

function setupCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary env vars.");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(new Error(err.message || "Cloudinary upload failed"));
      resolve(result);
    });
    stream.end(buffer);
  });
}


function deleteImageFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { setupCloudinary, uploadBufferToCloudinary, deleteImageFromCloudinary };