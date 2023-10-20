const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }
        ],
       
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                required: true,
            }
        ],
        notifications: [  // Initialize notifications as an empty array
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",  
                },
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

module.exports = mongoose.model("Conversation", conversationSchema);
