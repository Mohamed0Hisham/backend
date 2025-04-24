import TREATMENT from "../models/treatment.model.js";
import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";

export const index = async (req, res, next) => {
	try {
		const Treatments = await TREATMENT.find();
		if (Treatments.length === 0) {
			return next(errorHandler(204, "There aren't any Treatments"));
		}
		return res.status(200).json({
			data: Treatments,
			msg: "All Treatments are retrieved",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the Treatment. Please try again later." +
					error
			)
		);
	}
};
export const show = async (req, res, next) => {
	try {
		const id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid Treatment ID"));
		}
		const treatment = await TREATMENT.findById(id);
		if (!treatment) {
			return next(errorHandler(404, "Can't found this treatment"));
		}
		return res.status(200).json({
			data: treatment,
			msg: "This Treatment has been found",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the Treatment. Please try again later." +
					error
			)
		);
	}
};

export const store = async (req, res, next) => {
	const { diseaseID, name, description } = req.body;
	if (name == null || description == null || diseaseID == null) {
		return next(errorHandler(400, "All required fields must be provided."));
	}
	if (description.length > 500) {
		return next(
			errorHandler(
				422,
				'The field "description" exceeds the maximum length of 400 characters.'
			)
		);
	}

	try {
		const newTreatment = new TREATMENT({
			diseaseID,
			name,
			description,
		});
		const result = await newTreatment.save();

		return res.status(201).json({
			data: result,
			msg: "New Treatment has been created successfully",
			success: true,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				msg: "Duplicate treatment is not allowed! ",
			});
		} else {
			return next(
				errorHandler(
					500,
					"An error occurred while creating the Treatment. Please try again later." +
						error
				)
			);
		}
	}
};

export const update = async (req, res, next) => {
	const { id } = req.params;
	if (id == null) {
		return next(errorHandler(400, "The 'id' parameter is required."));
	}
	try {
		const result = await TREATMENT.findOneAndUpdate({ _id: id }, req.body, {
			new: true,
		});
		return res.status(200).json({
			data: result,
			msg: "The Treatment has successfully updated",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while updating the Treatment. Please try again later." +
					error
			)
		);
	}
};

export const destroy = async (req, res, next) => {
	const { id } = req.params;
	if (id == null) {
		return next(errorHandler(400, "All required fields must be provided."));
	}
	try {
		const treatment = await TREATMENT.findById(req.params.id);
		if (!treatment) {
			return res.status(404).json({ message: "Treatment not found" });
		}
		const result = await TREATMENT.findOneAndDelete({ _id: id });
		return res.status(204).json({
			msg: "The Treatment has been successfully deleted",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while updating the Treatment. Please try again later." +
					error
			)
		);
	}
};
