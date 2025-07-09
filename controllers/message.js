import Message from "../models/messageModel.js"


export const store = async (req,res)=>{
    try {
        const message = new Message(req.body)
        const savedMessage = await message.save()
        res.status(200).json(savedMessage)
    } catch (error) {
        res.status(400).json(error)
    }
}
export const index = async (req,res)=>{
    try {
        const messages = await Message.find({
            conversationId : req.params.conversationId
        }).sort({ createdAt: 1 });
        res.status(200).json(messages)
    } catch (error) {
        res.status(400).json(error)
    }
}