import DISEASES from "../models/diseases.model.js";
import DiseasesCategory from "../models/diseasesCategory.model.js";
import mongoose from "mongoose";

import { errorHandler } from "../helpers/errorHandler.js";

export const index = async (req, res, next) => {
	try {
		// Fetch all diseases
		const diseases = await DISEASES.find().lean();
		if (diseases.length === 0) {
			return next(errorHandler(204, "There aren't any diseases"));
		}

		// Step 1: Extract diseaseCategoryIDs
		const diseaseCategoryIDs = diseases.map((item) => item.diseasecategoryId);

		// Step 2: Fetch disease categories from the database
		const diseaseCategories = await DiseasesCategory.find({
			_id: { $in: diseaseCategoryIDs },
		});
		// Step 3: Create a mapping for disease categories
		const diseaseCategoryMap = diseaseCategories.reduce((acc, category) => {
			acc[category._id.toString()] = category.name; // Map _id to name
			return acc;
		}, {});
		console.log(diseaseCategoryMap);
		// Step 4: Map the diseases list to include diseaseCategoryName
		const diseasesWithCategoryNames = diseases.map(
			({ diseasecategoryId, ...item }) => ({
				diseaseCategoryName:
					diseaseCategoryMap[diseasecategoryId?.toString()] || "unknown", // Add diseaseCategoryName
				...item,
			})
		);

		// Step 5: Return the response
		return res.status(200).json({
			data: diseasesWithCategoryNames,
			message: "All diseases retrieved successfully",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the diseases. Please try again later: " +
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
		const disease = await DISEASES.findById(id);
		if (!disease) {
			return next(errorHandler(404, "Can't found this Disease"));
		}
		return res.status(200).json({
			data: disease,
			msg: "This Disease has been found",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the Disease. Please try again later." +
					error
			)
		);
	}
};
export const store = async (req, res, next) => {
	const { name, description, rank, diseasecategoryId } = req.body;
	if (
		name == null ||
		description == null ||
		rank == null ||
		diseasecategoryId == null
	) {
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
		const newDiesases = await DISEASES({
			name,
			description,
			rank,
			diseasecategoryId,
		});
		const result = await newDiesases.save();
		return res.status(201).json({
			data: result,
			msg: "New Diesase has been created successfully",
			success: true,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				msg: "Duplicate Disease is not Allowed",
			});
		} else {
			return next(
				errorHandler(
					500,
					"An error occurred while creating the Disease. Please try again later." +
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
		const result = await DISEASES.findOneAndUpdate({ _id: id }, req.body, {
			new: true,
		});
		return res.status(200).json({
			data: result,
			msg: "The Disease has successfully updated",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while updating the Disease. Please try again later." +
					error
			)
		);
	}
};

export const destroy = async (req, res, next) => {
	const { id } = req.params;
	if (id == null) {
		return next(errorHandler(400, "The 'id' parameter is required."));
	}
	try {
		const diseases = await DISEASES.findById(id);
		if (!diseases) {
			return res.status(404).json({ message: "Diseases not found" });
		}
		const result = await DISEASES.findOneAndDelete({ _id: id });
		return res.status(204).json({
			msg: "The Disease has been successfully deleted",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while updating the Disease. Please try again later." +
					error
			)
		);
	}
};
