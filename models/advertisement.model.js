import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const advertisementSchema = mongoose.Schema(
	{
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Doctor or Hospital ID is required"],
		},
		title: {
			type: String,
			required: [true, "This Advertisement MUST have a title "],
			maxLength: [200, "Advertisement's title MUST NOT exceed 200 characters"],
		},
		description: {
			type: String,
			required: [true, "This Advertisement MUST have a description"],
			maxLength: [800, "Description MUST NOT exceed 800 characters"],
		},
		ImgUrl: {
			type: String,
			// default:
			// 	"https://res.cloudinary.com/dweffiohi/image/upload/v1745584263/zx9udpdtaj27pst8kkaf.jpg",
		},
		ImgPublicId: {
			type: String,
			// default: process.env.ADVERTISEMENT_DEFAULT_IMAGE_PUBLICID,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Advertisement", advertisementSchema);
