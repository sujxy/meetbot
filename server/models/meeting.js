import mongoose from "mongoose";
import Transcript from "./transcript.js";
import Summary from "./summary.js";

const MeetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      required: false,
    },
    transcript_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Transcript",
      default: null,
    },
    summary_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Summary",
      default: null,
    },
    duration: {
      type: String,
      default: "00:00",
    },
  },
  { timestamps: true }
);

MeetingSchema.pre("save", async function (next) {
  if (!this.transcript_id) {
    const transcript = new Transcript({ meeting_id: this._id });
    await transcript.save();
    this.transcript_id = transcript._id;
  }

  if (!this.summary_id) {
    const summary = new Summary({
      meeting_id: this._id,
      transcript_id: this.transcript_id,
    });
    await summary.save();
    this.summary_id = summary._id;
  }

  next();
});

const Meeting = mongoose.model("Meeting", MeetingSchema);
export default Meeting;
