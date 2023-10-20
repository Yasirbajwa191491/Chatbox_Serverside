const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            requried: true,
            unique:true,
          },
          email: {
            type: String,
            requried: true,
          },
          password: {
            type: String,
            requried: true,
          },
          department: {
            type: String,
            requried: true,
          },
          section: {
            type: String,
            requried: true,
          },
          designation: {
            type: String,
            requried: true,
          },
         status:{
          type: String,
          default:"offline"
         },
           isAdmin:{
            type: Boolean,
            default:false
          },
          lang:{
           type:String,
           default:"english"
          },
        username: { type: String },
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
