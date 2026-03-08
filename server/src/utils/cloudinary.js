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

const UPLOAD_TIMEOUT_MS = 30_000;

function uploadBufferToCloudinary(buffer, options = {}) {
  const uploadPromise = new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { timeout: UPLOAD_TIMEOUT_MS, ...options },
      (err, result) => {
        if (err) return reject(new Error(err.message || "Cloudinary upload failed"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Cloudinary upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s`)),
      UPLOAD_TIMEOUT_MS
    )
  );

  return Promise.race([uploadPromise, timeoutPromise]);
}


function deleteImageFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { setupCloudinary, uploadBufferToCloudinary, deleteImageFromCloudinary };