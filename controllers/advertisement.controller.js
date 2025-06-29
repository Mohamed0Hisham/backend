import ADVERTISEMENT from "../models/advertisement.model.js";
import { errorHandler } from "../helpers/errorHandler.js";
import mongoose from "mongoose";
import { uploadImg, deleteImg } from "../helpers/images.js";
import { invalidateCache } from "../helpers/invalidateCache.js";

export const index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetch advertisements with creatorId populated (only name)
    const advertisements = await ADVERTISEMENT.find()
      .skip(skip)
      .limit(limit)
      .populate("creatorId", "name") // populate creator's name
      .sort({ createdAt: -1 }); // optional sorting by creation date descending

    if (advertisements.length === 0) {
      return next(errorHandler(204, "There are no Advertisements"));
    }

    const totalAdvertisements = await ADVERTISEMENT.countDocuments();
    const totalPages = Math.ceil(totalAdvertisements / limit);

    // Replace creatorId with creatorName in each advertisement
    const adsWithCreatorName = advertisements.map((ad) => {
      const adObj = ad.toObject(); // convert Mongoose doc to plain object
      adObj.creatorName = adObj.creatorId?.name || "Unknown";
      delete adObj.creatorId;
      return adObj;
    });

    return res.status(200).json({
      data: adsWithCreatorName,
      message: "Advertisements fetched successfully",
      success: true,
      totalAdvertisements,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return next(
      errorHandler(500, "Error while fetching advertisements: " + error.message)
    );
  }
};

export const show = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid Advertisement ID"));
    }

    // Populate creatorId to get the user's name
    const advertisement = await ADVERTISEMENT.findById(id).populate(
      "creatorId",
      "name"
    );

    if (!advertisement) {
      return next(errorHandler(404, "Can't find this Advertisement"));
    }

    // Convert to plain JS object to modify before sending
    const adObject = advertisement.toObject();

    // Replace creatorId with creator's name
    adObject.creatorName = adObject.creatorId?.name || "Unknown";
    delete adObject.creatorId;

    res.status(200).json({
      data: adObject,
      msg: "This Advertisement has been found",
      success: true,
    });
  } catch (error) {
    return next(
      errorHandler(
        500,
        "An error occurred while retrieving the Advertisement. Please try again later. " +
          error.message
      )
    );
  }
};

export const store = async (req, res, next) => {
  const result = { ...req.body };
  result.creatorId = req.user._id;
  result.creatorRole = req.user.role;
  if (result.creatorRole === "Patient" || result.creatorRole === "Nurse") {
    console.log(result.creatorRole);
    return next(errorHandler(401, "you are not authorized to do this"));
  }
  if (!result.description || !result.title || !req.file) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  if (result.title.length > 400) {
    return next(errorHandler(422, "Description is too long"));
  }
  if (result.description.length > 800) {
    return next(errorHandler(422, "Description is too long"));
  }
  try {
    const image = await uploadImg(req.file);
    result.ImgUrl = image.ImgUrl;
    result.ImgPublicId = image.ImgPublicId;
    const newadvertisement = await new ADVERTISEMENT(result);
    await newadvertisement.save();

    await invalidateCache([`/api/advertisements/`]);

    return res.status(201).json({
      data: newadvertisement,
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
  const id = req.params.id;
  if (!id) {
    return next(
      errorHandler(400, "please provide the ID of the advertisement")
    );
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisment ID"));
  }
  const result = { ...req.body };
  result.id = id;
  try {
    if (req.file) {
      try {
        const advertisement = await ADVERTISEMENT.findById(id);
        const image = await uploadImg(req.file);
        await deleteImg(advertisement.ImgPublicId);
        result.ImgUrl = image.ImgUrl;
        result.ImgPublicId = image.ImgPublicId;
      } catch (error) {
        return next(
          errorHandler(500, "Error while Upload or delete picture" + error)
        );
      }
    }
    const UpdatedAdvertisement = await ADVERTISEMENT.findByIdAndUpdate(
      id,
      { $set: result }, // Update only the fields provided in req.body
      { new: true } // Return the updated document
    ).lean();

    await invalidateCache([
      `/api/advertisements/${id}`,
      "/api/advertisements/",
    ]);

    return res.status(200).json({
      data: UpdatedAdvertisement,
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
  const id = req.params.id;
  try {
    if (!id) {
      return next(
        errorHandler(400, "Please provide the ID of the advertisement")
      );
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid Advertisment ID"));
    }
    const advertisement = await ADVERTISEMENT.findById(id);
    await deleteImg(advertisement.ImgPublicId);
    await ADVERTISEMENT.deleteOne({ _id: id });

    await invalidateCache([
      `/api/advertisements/${id}`,
      "/api/advertisements/",
    ]);

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
