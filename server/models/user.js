import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    picture: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    refreshToken: {
      type: String,
    },
    googleAccessToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
    modelPreference: {
      type: String,
      default: "meta-llama/llama-4-scout-17b-16e-instruct",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
