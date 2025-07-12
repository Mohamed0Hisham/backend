import ADVICE from "../models/advice.model.js";
import USER from "../models/userModel.js";
import DiseasesCategory from "../models/diseasesCategory.model.js";
import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";
import { invalidateCache } from "../helpers/invalidateCache.js";

export const index = async (req, res, next) => {
	try {
		// Fetch all advice items
		// const page = parseInt(req.query.page) || 1;
		// const limit = 10;
		// const skip = (page - 1) * limit;
		const adviceList = await ADVICE.find().lean();
		if (adviceList.length === 0) {
			return next(errorHandler(200, "Advice list is empty"));
		}

		// Step 1: Extract diseasesCategoryIDs and doctorIds
		const diseasesCategoryIDs = adviceList.map(
			(item) => item.diseasesCategoryId
		);
		const doctorIDs = adviceList.map((item) => item.doctorId);

		// Step 2: Fetch diseases categories and doctors from the database
		const diseasesCategories = await DiseasesCategory.find({
			_id: { $in: diseasesCategoryIDs },
		});
		const doctors = await USER.find({ _id: { $in: doctorIDs } });

		// Step 3: Create mappings for diseases categories and doctors
		const diseasesCategoryMap = diseasesCategories.reduce(
			(acc, category) => {
				acc[category._id.toString()] = category.name;
				return acc;
			},
			{}
		);

		const doctorMap = doctors.reduce((acc, doctor) => {
			acc[doctor._id.toString()] = doctor.name; // Assuming the Doctor model has a 'name' field
			return acc;
		}, {});

		// Step 4: Map the adviceList to include diseasesCategoryName and doctorName
		const advice = adviceList.map(
			({ diseasesCategoryId, doctorId, ...item }) => ({
				diseasesCategoryName:
					diseasesCategoryMap[diseasesCategoryId?.toString()] ||
					"unknown",
				doctorName: doctorMap[doctorId?.toString()] || "unknown", // Add doctorName
				...item,
			})
		);
		const totalAdvices = await ADVICE.countDocuments();
		// const totalPages = Math.ceil(totalAdvices / limit);
		// Step 5: Return the response
		return res.status(200).json({
			data: advice,
			message: "Advices fetched successfully",
			success: true,
			totalAdvices: totalAdvices,
			//   totalPages: totalPages,
			//   currentPage: page,
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error while fetching advices: " + error)
		);
	}
};

export const store = async (req, res, next) => {
	try {
		if (req.user.role !== "Admin" && req.user.role !== "Doctor")
			return next(errorHandler(403, "un-authorized operation"));

		const result = { ...req.body };
		result.doctorId = req.user._id;

		if (
			!result.doctorId ||
			!result.diseasesCategoryId ||
			!result.description ||
			!result.title
		) {
			return next(
				errorHandler(400, "Please provide all required fields")
			);
		}
		if (result.description.length > 400) {
			return next(errorHandler(422, "Description is too long"));
		}
		if (result.title.length > 400) {
			return next(errorHandler(422, "Description is too long"));
		}
		const newAdvice = await new ADVICE(result);
		await newAdvice.save();

		await invalidateCache(["/api/advices/"]);

		return res.status(201).json({
			data: newAdvice,
			message: "successfully inserted",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error while inserting the advice:" + error)
		);
	}
};

export const update = async (req, res, next) => {
	try {
		if (req.user.role !== "Admin" && req.user.role !== "Doctor")
			return next(errorHandler(403, "un-authorized operation"));

		const id = req.params.id;
		if (!id) {
			return next(
				errorHandler(400, "please provide the ID of the advice")
			);
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid advice ID"));
		}

		const advice = await ADVICE.findById(id);
		if (!advice)
			return next(errorHandler(404, "this advice doesn't exist"));

		const result = { ...req.body };
		const UpdatedAdvice = await ADVICE.findByIdAndUpdate(
			id,
			{ $set: result },
			{ new: true }
		).lean();

		await invalidateCache(["/api/advices/", `api/advices/${id}`]);

		return res.status(200).json({
			data: UpdatedAdvice,
			message: "successfully updated",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"Error while updating the advice:" + error.message
			)
		);
	}
};

export const destroy = async (req, res, next) => {
	try {
		if (req.user.role !== "Admin" && req.user.role !== "Doctor")
			return next(errorHandler(403, "un-authorized operation"));

		const id = req.params.id;
		if (!id) {
			return next(
				errorHandler(400, "Please provide the ID of the advice")
			);
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid Advertisment ID"));
		}
		const advice = await ADVICE.findById(id);
		if (!advice)
			return next(errorHandler(404, "this advice doesn't exist"));

		await ADVICE.deleteOne({ _id: id });

		await invalidateCache(["/api/advices/", `api/advices/${id}`]);

		return res.status(200).json({
			success: true,
			message: "deleted successfully",
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"Error while deleting the advice:" + error.message
			)
		);
	}
};
