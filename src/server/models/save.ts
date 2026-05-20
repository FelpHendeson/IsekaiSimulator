import mongoose, { Schema } from "mongoose";

const saveSchema = new Schema(
  {
    saveId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    gameState: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    collection: "saves",
    timestamps: true,
  },
);

export const SaveModel =
  mongoose.models.Save ?? mongoose.model("Save", saveSchema);

