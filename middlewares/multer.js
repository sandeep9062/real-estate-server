import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    try {
      const allowedFormats = ["jpg", "jpeg", "png", "mp4", "mov", "avi"];
      const fileExtension = file.originalname.split(".").pop().toLowerCase();

      if (!allowedFormats.includes(fileExtension)) {
        return cb(new Error("Unsupported file type."));
      }

      const isVideo = ["mp4", "mov", "avi"].includes(fileExtension);

      const options = {
        folder: "RealEstate",
        resource_type: isVideo ? "video" : "image",
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      };

      // Convert file stream to buffer
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
    // Remove file from Cloudinary if needed
    if (file.public_id) {
      cloudinary.uploader.destroy(file.public_id, (error, result) => {
        if (error) {
          console.error("Error removing file from Cloudinary:", error);
        }
        cb(null);
      });
    } else {
      cb(null);
    }
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
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed."));
    }
  },
});

export default upload;