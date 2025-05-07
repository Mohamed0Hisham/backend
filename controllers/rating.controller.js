import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";
import RATING from "../models/ratingModel.js";
import USER from "../models/userModel.js";

export const store = async (req, res, next) => {
	const userId = req.body.userId;
	const rate = Number(req.body.rate);

	// Validate inputs
	if (!userId) {
		return next(errorHandler(400, "User ID is required"));
	}
	const user = await USER.findById(userId);
	if (user.role != "Doctor" && user.role != "Hospital") {
		return next(errorHandler(400, "You can rate only doctor or hospital"));
	}
	if (isNaN(rate)) {
		return next(errorHandler(400, "Rate must be a valid number"));
	}
	if (rate < 1 || rate > 5) {
		return next(errorHandler(400, "Rate must be between 1 and 5"));
	}

	try {
		// Create and save the new rating
		const newRate = new RATING({
			userId,
			rate: rate,
		});
		await newRate.save();

		// Retrieve all ratings for the user
		const userRatings = await RATING.find({ userId });

		// Ensure all ratings have valid numeric values
		if (userRatings.length > 0) {
			let totalRate = 0;
			let validRatingsCount = 0;

			for (const rating of userRatings) {
				if (!isNaN(rating.rate)) {
					totalRate += rating.rate;
					validRatingsCount++;
				}
			}

			// Calculate the average rate only if there are valid ratings
			if (validRatingsCount > 0) {
				const averageRate = Number((totalRate / validRatingsCount).toFixed(2));

				// Update the user's average rate
				await USER.findByIdAndUpdate(userId, { rate: averageRate });
			} else {
				// Handle the case where no valid ratings exist
				await USER.findByIdAndUpdate(userId, { rate: null });
			}

			return res.status(201).json({
				msg: "Rating has been successfully added",
				success: true,
			});
		}
	} catch (error) {
		// Handle errors gracefully
		return next(
			errorHandler(
				500,
				"An error occurred while processing the request. Please try again later." +
					error.message
			)
		);
	}
};
