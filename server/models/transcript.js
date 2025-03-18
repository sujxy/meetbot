import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema(
  {
    meeting_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },
    content: {
      type: [String],
      required: true,
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isSummarized: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Transcript = mongoose.model("Transcript", transcriptSchema);
export default Transcript;
