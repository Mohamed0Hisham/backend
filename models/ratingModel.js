import mongoose from "mongoose";

const rateSchema = mongoose.Schema(
	{
		rate: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},

		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Rating", rateSchema);
