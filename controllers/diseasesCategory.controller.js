import DiseasesCategory from "../models/diseasesCategory.model.js";
import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";

export const index = async (req, res, next) => {
	try {
		const diseasesCategories = await DiseasesCategory.find();
		if (diseasesCategories.length === 0) {
			return next(errorHandler(204, "There aren't any diesasescategories"));
		}
		return res.status(200).json({
			data: diseasesCategories,
			msg: "All Dieseascescategories are retrieved ",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the DiseasesCategories. Please try again later." +
					error
			)
		);
	}
};

export const show = async (req, res, next) => {
	try {
		const id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid Disease Category ID"));
		}
		const disesesCategory = await DiseasesCategory.findById(id);
		if (!disesesCategory) {
			return next(errorHandler(404, "Can't found this Disease Category"));
		}
		return res.status(200).json({
			data: disesesCategory,
			msg: "This Disease Category has been found",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the Disease Category. Please try again later." +
					error
			)
		);
	}
};

export const store = async (req, res, next) => {
	const { name, description, rank } = req.body;
	if (name == null || description == null || rank == null) {
		return next(errorHandler(400, "All required fields must be provided."));
	}
	if (description.length > 400) {
		return next(
			errorHandler(
				422,
				'The field "description" exceeds the maximum length of 400 characters.'
			)
		);
	}
	try {
		const newDiesasesCategory = await new DiseasesCategory({
			name,
			description,
			rank,
		});
		const result = await newDiesasesCategory.save();
		return res.status(201).json({
			data: result,
			msg: "New Diesasescategory has been created successfully",
			success: true,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				msg: "Duplicate Disease Category is not Allowed",
			});
		} else {
			return next(
				errorHandler(
					500,
					"An error occurred while creating the DiseasesCategories. Please try again later." +
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
		const result = await DiseasesCategory.findOneAndUpdate(
			{
				_id: id,
			},
			req.body,
			{ new: true }
		);
		return res.status(200).json({
			data: result,
			msg: "The DiseasesCategories has successfully updated",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while updating the DiseasesCategories. Please try again later." +
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
		const diseasesCategories = await DiseasesCategory.findById(id);
		if (!diseasesCategories) {
			return res.status(404).json({ message: "DiseasesCategories not found" });
		}
		diesasescategory = await DiseasesCategory.findOneAndDelete({
			_id: id,
		});
		return res.status(204).json({
			msg: "The DiseasesCategory has been successfully deleted",
			success: true,
		});
	} catch (error) {
		return next(
			500,
			"An error occurred while deleteing the DiseasesCategories. Please try again later." +
				error
		);
	}
};
