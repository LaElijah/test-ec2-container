import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: String,
  receiever: String,
  groupId: String,
  type: String,
  message: String,
  timestamp: String,
  metadata: {}
});


export default mongoose.models.Message ||
  mongoose.model("Resource", messageSchema);
