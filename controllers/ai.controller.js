import axios from "axios";

export const start_session = async (req, res) => {
  const aiData = await axios.post(
    "https://ai-production-068e.up.railway.app/start_session"
  );
  res.status(200).json({
    success: true,
    data: aiData.data,
  });
};
export const send_message = async (req, res) => {
  const aiData = await axios.post(
    "https://ai-production-068e.up.railway.app/send_message",
    req.body
  );
  res.status(200).json({
    success: true,
    data: aiData.data,
  });
};
export const symptoms = async (req, res) => {
  const aiData = await axios.get(
    "https://ai-production-068e.up.railway.app/symptoms"
  );
  res.status(200).json({
    success: true,
    data: aiData.data,
  });
};
