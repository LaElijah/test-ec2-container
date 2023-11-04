import mongoose from "mongoose";

const { Schema } = mongoose;

const groupSchema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  requestedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  banned: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
