const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const GroupChat = require("../models/GroupChat");
const multer = require('multer');
const path = require('path');
const express = require("express");
const mongoose=require("mongoose")
const router = express.Router();
const {sendNewDirectMessage,sendNewGroupMessage}=require("../socketControllers/notifyConnectedSockets")
const filefilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../client/public/image/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadimage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
   fileFilter: filefilter
});
const uploadfile = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5,
  // },
  // fileFilter: filefilter
});

router.post("/upload", uploadimage.single("image"), async (req, res) => {
  try {
    const { author,receiverUserId } = req.body;
    const arr = req.file.originalname;
    const newmmessage = new Message({ author, image: arr, content: "image", type: "DIRECT" });
    let newMessage=await newmmessage.save();

    const conversation = await Conversation.findOne({
      participants: { $all: [receiverUserId, author] },
  });

  // if conversation exists, append the message to the conversation
  if (conversation) {
      console.log("conversation already exists");

      conversation.messages = [...conversation.messages, newMessage._id];
      await conversation.save();

      // update the chat history of the participants
      // updateChatHistory(conversation._id.toString());

      // update the chat of the participants with newly sent message
      sendNewDirectMessage(conversation._id.toString(), newMessage,author,receiverUserId);
  } else {
      console.log("creating new conversation");
      // create conversation
      const newConversation = await Conversation.create({
          participants: [author, receiverUserId],
          messages: [newMessage._id],
      });

      // update the chat history of the participants
      // updateChatHistory(newConversation._id.toString());

      // update the chat of the participants with newly sent message
      sendNewDirectMessage(newConversation._id.toString(), newMessage,author,receiverUserId);
  }
    res.status(200).send({ message: "image uploaded" });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/uploadfile", uploadfile.single("image"), async (req, res) => {
  try {
    const { author,receiverUserId } = req.body;
    const arr = req.file.originalname;
    const newmmessage = new Message({ author, image: arr, content: "file", type: "DIRECT" });
    let newMessage=await newmmessage.save();

    const conversation = await Conversation.findOne({
      participants: { $all: [receiverUserId, author] },
  });

  // if conversation exists, append the message to the conversation
  if (conversation) {
      console.log("conversation already exists");

      conversation.messages = [...conversation.messages, newMessage._id];
      await conversation.save();

      // update the chat history of the participants
      // updateChatHistory(conversation._id.toString());

      // update the chat of the participants with newly sent message
      sendNewDirectMessage(conversation._id.toString(), newMessage,author,receiverUserId,author,receiverUserId);
  } else {
      console.log("creating new conversation");
      // create conversation
      const newConversation = await Conversation.create({
          participants: [author, receiverUserId],
          messages: [newMessage._id],
      });

      // update the chat history of the participants
      // updateChatHistory(newConversation._id.toString());

      // update the chat of the participants with newly sent message
      sendNewDirectMessage(newConversation._id.toString(), newMessage,author,receiverUserId);
  }
    res.status(200).send({ message: "image uploaded" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/uploadgroup", uploadimage.single("image"), async (req, res) => {
  try {
    const {author, groupId } = req.body;
    const arr = req.file.originalname;
    const newmmessage = new Message({ author, image: arr, content: "image", type: "GROUP" });
    let newMessage=await newmmessage.save();
    const groupChat = await GroupChat.findOne({ _id: groupId });

    if (!groupChat) {
      res.status(404).send({error:"Group Not Exist"});
    }

    // append the message to the conversation
    groupChat.messages = [...groupChat.messages, newMessage._id];
    await groupChat.save();

    // update the chat of the participants with newly sent message
    sendNewGroupMessage(groupChat._id.toString(), newMessage); 
       res.status(200).send({ message: "image uploaded" });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/uploadfilegroup", uploadfile.single("image"), async (req, res) => {
  try {
    const {author, groupId } = req.body;
    const arr = req.file.originalname;
    const newmmessage = new Message({ author, image: arr, content: "file", type: "GROUP" });
    let newMessage=await newmmessage.save();
    const groupChat = await GroupChat.findOne({ _id: groupId });

    if (!groupChat) {
      res.status(404).send({error:"Group Not Exist"});
    }

    // append the message to the conversation
    groupChat.messages = [...groupChat.messages, newMessage._id];
    await groupChat.save();

    // update the chat of the participants with newly sent message
    sendNewGroupMessage(groupChat._id.toString(), newMessage); 
       res.status(200).send({ message: "image uploaded" });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/get-notification/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const notifications = await Conversation.find({
      participants: { $all: [senderId, receiverId]},notifications:{$elemMatch:{
        userId:receiverId
      }}  // Use an array to match both values
    }).select("notifications")
    res.status(200).send(notifications);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/dept-notification/:dept/:id", async (req, res) => {
  try {
    const { dept, id } = req.params;

    let notifications = await Conversation.aggregate([
      {
        $lookup: {
          from: "users", // Name of the User collection
          localField: "participants",
          foreignField: "_id",
          as: "participantsInfo",
        },
      },
      {
        $match: {
          "participantsInfo.department": dept,
          "participantsInfo._id": mongoose.Types.ObjectId(id), // Convert id to ObjectId
        },
      },
      {
        $unwind: "$notifications",
      },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: { $size: "$notifications.messages" } }, // Calculate the total length of messages
        },
      },
    ]);
    
    // The 'notifications' variable now contains the totalNotifications count.
    
    
    res.status(200).send(notifications);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.patch("/remove-notification/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const filter = {
      participants: { $all: [senderId, receiverId] },
      'notifications.userId': receiverId,
    };
    
    const update = {
      $set: { 'notifications.$[elem].messages': [] },
    };
    
    const options = {
      new: true,
      arrayFilters: [{ 'elem.userId': receiverId }],
    };
    
    const updatedConversation = await Conversation.findOneAndUpdate(
      filter,
      update,
      options
    );
    res.status(200).send(updatedConversation);
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = {
  router
};
