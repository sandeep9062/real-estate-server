import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function sanitizePublicIdPart(name) {
  const base = (name || "file").split(".")[0];
  return base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "file";
}

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
};

// Custom storage engine for Cloudinary
const cloudinaryStorage = {
  _handleFile: async (req, file, cb) => {
    if (!hasCloudinaryConfig) {
      return cb(
        new Error(
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )
      );
    }
    try {
      const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "avi", "webm"];
      const fileExtension = file.originalname.split(".").pop().toLowerCase();

      if (!allowedFormats.includes(fileExtension)) {
        return cb(new Error("Unsupported file type."));
      }

      const isVideo = ["mp4", "mov", "avi", "webm"].includes(fileExtension);

      const options = {
        folder:
          file.fieldname === "floorPlan"
            ? "RealEstate/floor-plans"
            : "RealEstate/properties",
        resource_type: isVideo ? "video" : "image",
        public_id: `p_${Date.now()}_${sanitizePublicIdPart(file.originalname)}`,
      };

      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const result = await uploadToCloudinary(buffer, options);

      cb(null, {
        path: result.secure_url,
        filename: result.public_id,
        public_id: result.public_id,
        secure_url: result.secure_url,
        resource_type: result.resource_type,
      });
    } catch (error) {
      cb(error);
    }
  },
  _removeFile: (req, file, cb) => {
    if (!hasCloudinaryConfig || !file.public_id) {
      return cb(null);
    }
    cloudinary.uploader.destroy(file.public_id, (error) => {
      if (error) {
        console.error("Error removing file from Cloudinary:", error);
      }
      cb(null);
    });
  },
};

// Multer Upload Middleware
const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, WebP, GIF) and videos (MP4, MOV, AVI, WebM) are allowed."));
    }
  },
});

export default upload;