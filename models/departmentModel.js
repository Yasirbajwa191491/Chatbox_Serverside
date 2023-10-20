const mongoose = require("mongoose");

const departmentModel = mongoose.Schema(
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


const Department = mongoose.model("Department", departmentModel);
module.exports = Department;
