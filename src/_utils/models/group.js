import mongoose from "mongoose";

const { Schema } = mongoose;

const groupSchema = new Schema({
  groupName: String,
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  requestedMembers: [
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
  messages: [],
  latestActive: String,
  latestAction: String
});

export default mongoose.models.Group || mongoose.model("Group", groupSchema);