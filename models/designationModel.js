const mongoose = require("mongoose");

const designationModel = mongoose.Schema(
  {
    name: {
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


const Designation = mongoose.model("Designation", designationModel);
module.exports = Designation;
