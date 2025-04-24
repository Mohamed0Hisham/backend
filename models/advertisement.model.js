import mongoose from "mongoose";

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
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Advertisement", advertisementSchema);
