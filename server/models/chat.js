import mongoose from "mongoose";
const ChatSchema = new mongoose.Schema({
  meeting_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meeting",
    required: true,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new mongoose.Schema({
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  sender: { type: String, enum: ["AI", "USER"], required: true }, // "user" or "ai"
  content: { type: String, required: true },
  hasFile: { type: Boolean, required: false, default: false },
  fileURL: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);
export const Chat = mongoose.model("Chat", ChatSchema);
