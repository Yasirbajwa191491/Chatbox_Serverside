const mongoose = require("mongoose");

const groupChatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: false,
            required: [true, "can't be blank"],
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        // creator of the group
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                required: true,
            },
        ],
        notifications: [  // Initialize notifications as an empty array
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",  
            }
        ,
            allmessages: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Message",
                }
            ]
        }
    ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("GroupChat", groupChatSchema);
