import ww2 from "../models/WWII.js";

export const addWW2Data = async (req, res, next) => {
  try {
    const { country } = req.body;

    // Get client IP address (handles proxy scenarios)
    // const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // // Check for existing vote by IP or cookie
    // const existingVote = await ww2.findOne({
    //   $or: [{ ip }, { voterCookie: req.cookies.ww2Voted }],
    // });
    // if (existingVote || req.cookies.ww2Voted) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You have already voted!",
    //     redirect: false,
    //   });
    // }

    if (!country) {
      return res.status(400).json({
        success: false,
        message: "Country is required",
        redirect: false,
      });
    }

    // Create new vote with IP and cookie tracking
    const newWW2Data = await ww2.create({
      country,
      // ip,
      // voterCookie: `vote_${Date.now()}`, // Unique cookie value
    });

    // Set cookie that expires in 30 days
    // res.cookie("ww2Voted", newWW2Data.voterCookie, {
    //   maxAge: 30 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: true,
    // });

    return res.status(201).json({
      success: true,
      message: "Vote recorded successfully",
      redirect:
        "https://drive.google.com/file/d/1QTtIWpcxFnX7A6-cmQUn66ItuVXQmQw1/view?usp=sharing",
      data: newWW2Data,
    });
  } catch (error) {
    return next(error);
  }
};
