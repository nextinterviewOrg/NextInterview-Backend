const mongoose = require("mongoose");
 
const newCardSchema = new mongoose.Schema(
  {
    cardContent: String,
    sharedCount: Number,
    peopleInteractionCount: Number,
    cardKnown: Number,
    cardUnknown: Number,
    date:{
      type:Date
    },
    backgroundImage:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);
 
module.exports = mongoose.model("FlashCard", newCardSchema);