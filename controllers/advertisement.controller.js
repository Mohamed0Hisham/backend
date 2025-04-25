import ADVERTISEMENT from "../models/advertisement.model.js";
import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";

export const index = async (req, res, next) => {
	try {
		const advertisement = await ADVERTISEMENT.find().lean();
		if (advertisement.length == 0) {
			return next(errorHandler(204, "There are no Advertisments"));
		}
		return res.status(200).json({
			data: advertisement,
			message: "advertisements fetched successfully",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error while fetching advertisements: " + error)
		);
	}
};

export const show = async (req, res, next) => {
	try {
		const id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid Advertisment ID"));
		}
		const advertisement = await ADVERTISEMENT.findById(id);
		if (!advertisement) {
			return next(errorHandler(404, "Can't found this Advertisment"));
		}
		res.status(200).json({
			data: advertisement,
			msg: "This Advertisment has been found",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the Advertisment. Please try again later." +
					error
			)
		);
	}
};

export const store = async (req, res, next) => {
	const creatorId = req.user._id;
	const { title, description } = req.body;
	if (description === null || title === null) {
		return next(errorHandler(400, "Please provide all required fields"));
	}
	if (title.length > 400) {
		return next(errorHandler(422, "Description is too long"));
	}
	if (description.length > 800) {
		return next(errorHandler(422, "Description is too long"));
	}
	try {
		const newadvertisement = await new ADVERTISEMENT({
			creatorId,
			title,
			description,
		});
		const result = await newadvertisement.save();
		return res.status(201).json({
			data: result,
			message: "successfully inserted",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error while inserting the advertisement:" + error)
		);
	}
};

export const update = async (req, res, next) => {
	const { id } = req.params;
	if (id == null) {
		return next(
			errorHandler(400, "please provide the ID of the advertisement")
		);
	}
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(errorHandler(400, "Invalid Advertisment ID"));
	}
	try {
		const result = await ADVERTISEMENT.findOneAndUpdate({ _id: id }, req.body, {
			new: true,
		}).lean();
		return res.status(200).json({
			data: result,
			message: "successfully updated",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"Error while updating the advertisement:" + error.message
			)
		);
	}
};

export const destroy = async (req, res, next) => {
	const { id } = req.params;
	try {
		if (id == null) {
			return next(
				errorHandler(400, "Please provide the ID of the advertisement")
			);
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid Advertisment ID"));
		}
		await ADVERTISEMENT.findOneAndDelete({ _id: id });
		return res.status(200).json({
			success: true,
			message: "deleted successfully",
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"Error while deleting the advertisement:" + error.message
			)
		);
	}
};
