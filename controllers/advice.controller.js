import ADVICE from "../models/advice.model.js";
import USER from "../models/userModel.js";
import DiseasesCategory from "../models/diseasesCategory.model.js";
import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";
import { uploadImg, deleteImg } from "../helpers/images.js";

export const index = async (req, res, next) => {
	try {
		// Fetch all advice items
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
		const diseasesCategoryMap = diseasesCategories.reduce((acc, category) => {
			acc[category._id.toString()] = category.name;
			return acc;
		}, {});

		const doctorMap = doctors.reduce((acc, doctor) => {
			acc[doctor._id.toString()] = doctor.name; // Assuming the Doctor model has a 'name' field
			return acc;
		}, {});

		// Step 4: Map the adviceList to include diseasesCategoryName and doctorName
		const advice = adviceList.map(
			({ diseasesCategoryId, doctorId, ...item }) => ({
				diseasesCategoryName:
					diseasesCategoryMap[diseasesCategoryId?.toString()] || "unknown",
				doctorName: doctorMap[doctorId?.toString()] || "unknown", // Add doctorName
				...item,
			})
		);

		// Step 5: Return the response
		return res.status(200).json({
			data: advice,
			message: "Advices fetched successfully",
			success: true,
		});
	} catch (error) {
		return next(errorHandler(500, "Error while fetching advices: " + error));
	}
};

export const store = async (req, res, next) => {
	const result = { ...req.body };
	result.doctorId = req.user._id;
	if (
		!result.doctorId ||
		!result.diseasesCategoryId ||
		!result.description ||
		!result.title ||
		!req.file
	) {
		return next(errorHandler(400, "Please provide all required fields"));
	}
	if (result.description.length > 400) {
		return next(errorHandler(422, "Description is too long"));
	}
	if (result.title.length > 400) {
		return next(errorHandler(422, "Description is too long"));
	}
	try {
		const image = await uploadImg(req.file);
		result.ImgUrl = image.ImgUrl;
		result.ImgPublicId = image.ImgPublicId;
		const newAdvice = await new ADVICE(result);
		await newAdvice.save();
		return res.status(201).json({
			data: newAdvice,
			message: "successfully inserted",
			success: true,
		});
	} catch (error) {
		return next(errorHandler(500, "Error while inserting the advice:" + error));
	}
};

export const update = async (req, res, next) => {
	const id = req.params.id;
	if (!id) {
		return next(errorHandler(400, "please provide the ID of the advice"));
	}
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(errorHandler(400, "Invalid Advertisment ID"));
	}
	const result = { ...req.body };
	result.id = id;
	try {
		if (req.file) {
			try {
				const advice = await ADVICE.findById(id);
				const image = await uploadImg(req.file);
				await deleteImg(advice.ImgPublicId);
				result.ImgUrl = image.ImgUrl;
				result.ImgPublicId = image.ImgPublicId;
			} catch (error) {
				return next(
					errorHandler(500, "Error while Upload or delete picture" + error)
				);
			}
		}
		const UpdatedAdvice = await ADVICE.findByIdAndUpdate(
			id,
			{ $set: result }, // Update only the fields provided in req.body
			{ new: true } // Return the updated document
		).lean();
		return res.status(200).json({
			data: UpdatedAdvice,
			message: "successfully updated",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error while updating the advice:" + error.message)
		);
	}
};

export const destroy = async (req, res, next) => {
	const id = req.params.id;
	try {
		if (!id) {
			return next(errorHandler(400, "Please provide the ID of the advice"));
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(errorHandler(400, "Invalid Advertisment ID"));
		}
		const advice = await ADVICE.findById(id);
		await deleteImg(advice.ImgPublicId);
		await ADVICE.deleteOne({ _id: id });
		return res.status(200).json({
			success: true,
			message: "deleted successfully",
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error while deleting the advice:" + error.message)
		);
	}
};
