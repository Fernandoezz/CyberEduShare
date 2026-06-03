const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    type: {
      type: String,
      enum: ["PDF", "Video", "ZIP", "Image", "Other"],
      default: "PDF",
    },
    tags: {
      type: [String],
      default: [],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    cloudinaryResourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "raw",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploaderName: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ── Moderation fields  [NEW — needed by moderator review workflow]
    isFlagged: {
      type: Boolean,
      default: false,
    },
    moderatorNotes: {
      type: String,
      default: "",
    },
    bookmarks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, min: 1, max: 5 },
      },
    ],
  },
  { timestamps: true },
);

// Virtual: average rating
contentSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  return (sum / this.ratings.length).toFixed(1);
});

contentSchema.set("toJSON", { virtuals: true });
contentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Content", contentSchema);
