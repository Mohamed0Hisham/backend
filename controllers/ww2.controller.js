import ww2 from "../models/WWII.js";

export const addWW2Data = async (req, res, next) => {
  try {
    const { country } = req.body;

    // Check for existing vote cookie
    if (req.cookies.ww2Voted) {
      return res.status(400).json({
        success: false,
        message: "You have already voted!",
        redirect: false,
      });
    }

    if (!country) {
      return res.status(400).json({
        success: false,
        message: "Country is required",
        redirect: false,
      });
    }

    const newWW2Data = await ww2.create({ country });

    // Set cookie that expires in 30 days
    res.cookie("ww2Voted", "true", {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      success: true,
      message: "Vote recorded successfully",
      redirect:
        "https://drive.google.com/file/d/1QTtIWpcxFnX7A6-cmQUn66ItuVXQmQw1/view?usp=sharing", // or your success page
      data: newWW2Data,
    });
  } catch (error) {
    return next(error);
  }
};
