const mongoose = require("mongoose");

const newCardSchema = new mongoose.Schema(
  {
    cardContent: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FlashCard", newCardSchema);
