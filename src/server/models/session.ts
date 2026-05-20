import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    collection: "sessions",
    timestamps: true,
  },
);

export const SessionModel =
  mongoose.models.Session ?? mongoose.model("Session", sessionSchema);

