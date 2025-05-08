import { model, Schema } from "mongoose";

const diagnosisSchema = new Schema(
	{
		patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
		doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
		date: { type: Date, default: Date.now },
		title: { type: String, required: true },
		description: { type: String, required: true },
		symptoms: [String],
		medications: { type: [Schema.Types.ObjectId], ref: "Treatment" },
		recommendations: { type: String },
		followUp: { type: String },
		notes: { type: String },
	},
	{ timestamps: true }
);

const Diagnosis = new model("Diagnosis", diagnosisSchema);
export default Diagnosis;
