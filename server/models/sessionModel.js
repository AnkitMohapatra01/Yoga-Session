import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["draft,published"] },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

export const sessionModel=mongoose.models.Session || mongoose.model('Session',sessionSchema);