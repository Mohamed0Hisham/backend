import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Load environment variables from .env file
dotenv.config();

// Initialize Cloudinary with credentials from .env
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

/**
 * Uploads an image to Cloudinary after compressing it.
 * @param {Object} file - The file object (from multer's memory storage).
 * @returns {Promise<{url: string, publicId: string}>} - The uploaded image's URL and public ID.
 */
export const uploadImg = async function (file) {
	try {
		// Ensure the file buffer exists
		if (!file || !file.buffer) {
			throw new Error("File buffer is missing.");
		}

		// Compress the image using Sharp
		const compressedImageBuffer = await sharp(file.buffer)
			.resize(800, 600, { fit: "inside" }) // Resize to max 800x600
			.jpeg({ quality: 75 }) // Adjust JPEG quality
			.toBuffer();

		// Upload the compressed image to Cloudinary
		const result = await new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream((error, result) => {
				if (error) return reject(error);
				resolve(result);
			});
			stream.end(compressedImageBuffer);
		});

		// Return the URL and Public ID of the uploaded image
		return {
			ImgUrl: result.secure_url,
			ImgPublicId: result.public_id,
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param {string} publicId - The public ID of the image to delete.
 * @returns {Promise<void>}
 */
export const deleteImg = async function (publicId) {
	try {
		const result = await cloudinary.uploader.destroy(publicId);

		// Log the full result for debugging
		console.log(`Deletion Result: ${JSON.stringify(result)}`);

		if (result.result !== "ok") {
			throw new Error(
				`Failed to delete image with PublicId: ${publicId}. Details: ${JSON.stringify(
					result
				)}`
			);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
};
