import mongoose, { Schema } from "mongoose";

const saveSchema = new Schema(
  {
    saveId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
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

saveSchema.index({ userId: 1, saveId: 1 }, { unique: true });

export const SaveModel =
  mongoose.models.Save ?? mongoose.model("Save", saveSchema);
