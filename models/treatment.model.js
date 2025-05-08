import mongoose from "mongoose";

const treatmentSchema = mongoose.Schema(
	{
		diseaseID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Diseases",
			required: [
				true,
				"A Treatment must be associated with a Disease ID",
			],
		},
		name: {
			type: String,
			required: [true, "This Treatment MUST have a name"],
			unique: true,
		},
		description: {
			type: String,
			required: [true, "This Treatment MUST have a description"],
			maxLength: [500, "Description MUST NOT exceed 500 characters"],
		},
		dosage: { type: String, required: true },
		instructions: { type: String, required: true },
		quantity: { type: String },
		refills: { type: Number, default: 0 },
		notes: { type: String },
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Treatment", treatmentSchema);
