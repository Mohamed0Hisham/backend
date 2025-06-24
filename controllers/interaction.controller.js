import user from "../models/userModel.js"
import Interaction from "../models/interaction.model.js"
import Advice from "../models/advice.model.js"
import dotenv from "dotenv";

dotenv.config()

export const like = async(req,res)=>{
    try {
    const userId = req.user._id
    const adviceId = req.params.id

    const exist = await Interaction.findOne({userId,adviceId})
   
    if(exist){
        if(exist.action === "like"){
            await Interaction.deleteOne({_id:exist._id})
            await Advice.findByIdAndUpdate(adviceId,{$inc:{likesCount:-1}})
        }
        else{
            await Interaction.updateOne({_id:exist._id},{action:"like"})
            await Advice.findByIdAndUpdate(adviceId,{$inc:{likesCount:1}})
        }
    } else{
        await Interaction.create({userId,adviceId,action:"like"})
        await Advice.findByIdAndUpdate(adviceId,{$inc:{likesCount:1}})
    }
    const likes = await Interaction.countDocuments({adviceId,action:"like"})
    res.status(200).json({likes, message: exist  ? 'Like removed' : 'Post liked'})
}catch (error) {
    console.error("Error in like controller:", error);
    res.status(500).json({
        error: "An error occurred while processing your like"
    });
}}
export const dislike = async(req,res)=>{
    try {
    const userId = req.user._id
    const adviceId = req.params.id

    const exist = await Interaction.findOne({userId,adviceId})
   
    if(exist){
        if(exist.action === "dislike"){
            await Interaction.deleteOne({_id:exist._id})
            await Advice.findByIdAndUpdate(adviceId,{$inc:{dislikesCount:-1}})
        }
        else{
            await Interaction.updateOne({_id:exist._id},{action:"dislike"})
            await Advice.findByIdAndUpdate(adviceId,{$inc:{dislikesCount:1}})
        }
    } else{
        await Interaction.create({userId,adviceId,action:"dislike"})
        await Advice.findByIdAndUpdate(adviceId,{$inc:{dislikesCount:1}})
    }
    const likes = await Interaction.countDocuments({adviceId,action:"dislike"})
    res.status(200).json({likes, message: exist  ? 'Dislike removed' : 'Post disliked'})
}catch (error) {
    console.error("Error in like controller:", error);
    res.status(500).json({
        error: "An error occurred while processing your dislike"
    });
}}