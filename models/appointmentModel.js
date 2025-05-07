import mongoose from "mongoose";

const appointmentSchema = mongoose.Schema(
	{
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Patient ID is required"],
		},
		patientName: {
			type: String,
			required: [true, "Patient name is required"],
		},
		doctorName: {
			type: String,
			required: [true, "doctor name is required"],
		},
		nurseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			//required: [true, "Nurse ID is required"],
		},
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Doctor ID is required"],
		},
		priority: {
			type: String,
			required: [true, "You MUST define priority for this appointment"],
			enum: ["critical", "important", "moderate", "low"],
			required: [true, "Appointment Priority is required"],
		},
		appointmentDate: {
			type: Date,
			required: [true, "This appointment MUST have a date"],
		},
		status: {
			type: String,
			enum: ["finished", "ongoing", "queued", "deleted"],
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Appointment", appointmentSchema);
