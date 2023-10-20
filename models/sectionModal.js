const mongoose = require("mongoose");

const sectionModal = mongoose.Schema(
  {
    name: {
      type: String,
      requried: true,
    },
    department: {
      type: String,
      requried: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
  },
  {
    timeStamp: true,
  }
);


const Section = mongoose.model("Section", sectionModal);
module.exports = Section;
