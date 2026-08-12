const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer directly to Cloudinary inside a specific sub-folder of 'abels_by_lincy'
 * @param {Buffer} fileBuffer - File buffer from Multer memoryStorage
 * @param {string} subFolder - Folder path, e.g. 'products', 'categories', 'users/profiles'
 * @returns {Promise<object>} Upload result containing secure_url and public_id
 */
const uploadFromBuffer = (fileBuffer, subFolder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `abels_by_lincy/${subFolder}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a file from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary asset public ID
 */
const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadFromBuffer,
  deleteFile
};
