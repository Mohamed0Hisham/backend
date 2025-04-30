
import mongoose from "mongoose";
const conversationSchema = mongoose.Schema(
    {
       members:{
        type : Array,
       }
    },
    {timestamps:true}
);
export default mongoose.model("ConversationSchema",conversationSchema)