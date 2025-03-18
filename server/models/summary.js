import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    meeting_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },
    transcript_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transcript",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: true }
);

const Summary = mongoose.model("Summary", summarySchema);

export default Summary;
