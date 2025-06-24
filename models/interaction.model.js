 import mongoose from "mongoose";
import dotev from "dotenv"


dotev.config()

const interactionSchema = mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            required:[true,"User ID is required"]
        },
        adviceId:{
            type:mongoose.Schema.ObjectId,
            ref:"Advice",
            required:[true,"Advice ID is required"]
        },
        action:{
            type:String,
            enum:['like', 'dislike'],
            required: true
        }

},
{
    timestamps: true ,
}


);
export default mongoose.model("Interaction",interactionSchema)