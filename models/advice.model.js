import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const adviceSchema = mongoose.Schema(
	{
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Doctor",
			required: [true, "Doctor ID is required"],
		},
		diseasesCategoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "DiseasesCategory",
			required: [true, "Diseases Category ID is required"],
		},
		title: {
			type: String,
			required: [true, "This Advice MUST have a title "],
			maxLength: [200, "Advice's title MUST NOT exceed 200 characters"],
		},
		description: {
			type: String,
			required: [true, "This Advice MUST have a description"],
			maxLength: [400, "Description MUST NOT exceed 400 characters"],
		},
		likesCount: {
			type: Number,
			default: 0,
		},
		dislikesCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Advice", adviceSchema);
