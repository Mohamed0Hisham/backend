
import Conversation from "../models/conversationModel.js"


export const store = async(req,res)=>{
    try {
        const newConversation = new Conversation ({
            members:[req.body.senderId,req.body.receiverId]
          })
          const savedConversation = await newConversation.save()
          res.status(200).json({message:"successful",data:savedConversation})
    } catch (error) {
        res.status(400).json({ success: false, message: "failed" });
    }
   
}
export const index = async (req,res)=>{
    try {
        const conversations = await Conversation.find({
            members:{$in:[req.params.userId]}
        })
        res.status(200).json(conversations)
 
    } catch (error) {
        res.status(400).json({ success: false, message: "failed" });
  
    }
}