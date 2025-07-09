import Conversation from "../models/conversationModel.js";
import messageModel from "../models/messageModel.js";
import User from "../models/userModel.js";

export const store = async (req, res) => {
	try {
		const newConversation = new Conversation({
			members: [req.body.senderId, req.body.receiverId],
		});
		const savedConversation = await newConversation.save();
		res.status(200).json({
			message: "successful",
			data: savedConversation,
		});
	} catch (error) {
		res.status(400).json({ success: false, message: "failed" });
	}
};

export const index = async (req, res) => {
	try {
	  const userId = req.params.userId;
	  if (!userId) {
		return res.status(400).json({ message: "Missing userId" });
	  }
  
	  const conversations = await Conversation.find({
		members: { $in: [userId] },
	  });
  
	  const enrichedConvs = await Promise.all(
		conversations.map(async (conv) => {
		  const otherUserId = conv.members.find(
			(id) =>
			  id != null &&
			  userId != null &&
			  id.toString() !== userId.toString()
		  );
  
		  const otherUser = otherUserId
			? await User.findById(otherUserId).select("name role ImgUrl")
			: null;
			const lastMessage = await messageModel
			.findOne({ conversationId: conv._id })
			.sort({ createdAt: -1 })
			.limit(1);
		  return {
			...conv.toObject(),
			otherUser,
			lastMessage
		  };
		})
	  );
  
	  res.status(200).json(enrichedConvs);
	} catch (error) {
	  console.error("Conversation fetch error:", error);
	  res.status(500).json({ message: "Failed to fetch conversations" });
	}
  };