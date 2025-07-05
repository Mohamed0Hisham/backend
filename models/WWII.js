import mongoose from "mongoose";
const ww2 = mongoose.Schema(
  {
    country: {
      type: String,
    },
    ip: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WW2", ww2);
