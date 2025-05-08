import express from "express";
import { errorHandler } from "../helpers/errorHandler.js";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!id) return next(errorHandler(400, "missing patient ID"));

		const patient = await User.findById(id, {
			password: 0,
			createdAt: 0,
			updatedAt: 0,
			rate: 0,
			specialization: 0,
			otp: 0,
			otpExpiry: 0,
		});
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist at database"));

		return res.status(200).json({
			success: true,
			message: "Patient details are fetched",
			patient,
		});
	} catch (error) {
		return next(error);
	}
});

export default router;
