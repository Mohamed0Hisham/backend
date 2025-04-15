import ADVICE from "../models/advice.model.js";
import USER from "../models/userModel.js";
import DiseasesCategory from "../models/diseasesCategory.model.js";
import { errorHandler } from "../helpers/errorHandler.js";

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
	const doctorId = req.user._id;
	const { diseasesCategoryId, title, description } = req.body;
	if (
		doctorId === null ||
		diseasesCategoryId === null ||
		description === null ||
		title === null
	) {
		return next(errorHandler(400, "Please provide all required fields"));
	}
	if (description.length > 400) {
		return next(errorHandler(422, "Description is too long"));
	}
	if (title.length > 400) {
		return next(errorHandler(422, "Description is too long"));
	}
	try {
		const newAdvice = await new ADVICE({
			doctorId,
			diseasesCategoryId,
			title,
			description,
		});
		const result = await newAdvice.save();
		return res.status(201).json({
			data: result,
			message: "successfully inserted",
			success: true,
		});
	} catch (error) {
		return next(errorHandler(500, "Error while inserting the advice:" + error));
	}
};

export const update = async (req, res, next) => {
	const { id } = req.params;
	if (id == null) {
		return next(errorHandler(400, "please provide the ID of the advice"));
	}
	try {
		const result = await ADVICE.findOneAndUpdate({ _id: id }, req.body, {
			new: true,
		}).lean();
		return res.status(200).json({
			data: result,
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
	const { id } = req.params;
	try {
		if (id == null) {
			return next(errorHandler(400, "Please provide the ID of the advice"));
		}
		await ADVICE.findOneAndDelete({ _id: id });
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
