import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    meeting_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    addedToCalendar: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      enum: ["AI", "USER"],
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;
