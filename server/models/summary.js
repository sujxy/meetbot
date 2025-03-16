import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      index: true,
    },
    transcript_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transcript",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Summary = mongoose.model("Summary", summarySchema);

export default Summary;
