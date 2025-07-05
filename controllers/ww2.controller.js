import ww2 from "../models/WWII.js";

export const addWW2Data = async (req, res, next) => {
  try {
    const { country } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Check if this IP has already voted
    const existingVote = await ww2.findOne({ ip });
    if (existingVote) {
      return res.status(400).json({
        message: "You have already voted",
        alreadyVoted: true,
      });
    }

    if (!country) {
      return res.status(400).json({ message: "Country is required" });
    }

    const newWW2Data = await ww2.create({ country, ip });

    // Set cookie as additional check
    res.cookie("voted", "true", {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json(newWW2Data);
  } catch (error) {
    return next(error);
  }
};
