const socket = require("socket.io");
const requireSocketAuth = require("../middlewares/requireSocketAuth");
const callRequestHandler = require("../socketControllers/callRequestHandler");
const callResponseHandler = require("../socketControllers/callResponseHandler");
const directChatHistoryHandler = require("../socketControllers/directChatHistoryHandler");
const directMessageHandler = require("../socketControllers/directMessageHandler");
const disconnectHandler = require("../socketControllers/disconnectHandler");
const groupMessageHandler = require("../socketControllers/groupMessageHandler");
const newConnectionHandler = require("../socketControllers/newConnectionHandler");
const notifyChatLeft = require("../socketControllers/notifyChatLeft");
const notifyTypingHandler = require("../socketControllers/notifyTypingHandler");
const { setServerSocketInstance, getOnlineUsers } = require("./connectedUsers");
const groupChatHistoryHandler = require("../socketControllers/groupChatHistoryHandler");
const roomJoinHandler = require("../socketControllers/room/roomJoinHandler");
const roomCreateHandler = require("../socketControllers/room/roomCreateHandler");
const roomLeaveHandler = require("../socketControllers/room/roomLeaveHandler");
const roomSignalingDataHandler = require("../socketControllers/room/roomSignalingDataHandler");
const roomInitializeConnectionHandler = require("../socketControllers/room/roomInitializeConnectionHandler");
const Conversation=require('../models/Conversation')
const GroupChat=require('../models/GroupChat')
const mongoose=require("mongoose")
const createSocketServer = (server) => {
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:3000", "https://talkhouse-tv.netlify.app"],
            methods: ["GET", "POST"],
        },
         reconnection: true,
        reconnectionAttempts: 3, // Example value
    });

    setServerSocketInstance(io);
let loggId=null;
    // check authentication of user
    io.use((socket, next) => {
        requireSocketAuth(socket, next);
    });

    io.on("connection", async(socket) => {
        console.log(socket.user.userId,'userId userId userId');
        //   await User.findOneAndUpdate({_id:socket?.user?.userId},{$set:{status:"online"}})
       loggId=socket?.user?.userId;
        console.log(`New socket connection connected: ${socket.id}`);
        newConnectionHandler(socket, io);


        socket.on("direct-message", (data) => {
            directMessageHandler(socket, data);
        })
        socket.on('send-department-list', async(departmentList) => {
            const senderUserId = socket.user.userId;
            async function getTotalMessages(userId) {
              const result = await Conversation.aggregate([
                  {
                      $match: {
                          "notifications.userId": userId
                      }
                  },
                  {
                      $unwind: "$notifications"
                  },
                  {
                      $match: {
                          "notifications.userId": userId
                      }
                  },
                  {
                      $project: {
                          totalMessages: {
                              $size: "$notifications.allmessages"
                          }
                      }
                  }
              ]);
          
              if (result.length > 0) {
                  return result[0].totalMessages;
              } else {
                  return 0; // User not found in any conversations or has no notifications
              }
          }
          getTotalMessages(senderUserId)
    .then(totalMessages => {
        // console.log(`Total messages for user ${senderUserId}: ${totalMessages}`);
    })
      
            // const results = await Promise.all(response);
            //  console.log(results,'resi');
            // socket.emit('departmentListResponse', results);
        })
        socket.on("send-user-id", async(data) => {
       loggId=socket?.user?.userId;
           const {userId}=data;
           let arr=[];
           const conversations = await Conversation.find({
            participants: { $all: [userId, loggId] }
          }).select("notifications")
          conversations.forEach(conversation => {
            conversation.notifications.forEach(notification => {
            //   console.log("User ID:", notification.userId);
            //   console.log("All Messages:", notification.allmessages);
              const newObj = {
                userId: notification.userId,       // Set your desired id value here
                messages: notification.allmessages  // Initialize the messages property as an empty array
              };
              arr.push(newObj)
            });
            // console.log(arr,'all data');
            socket.emit("notification-userList",arr)
          });
          
        //   const filteredConversations = conversations.filter((conversation) => {
        //     return conversation.notifications.some((notification) => notification.userId === loggId);
        //   });
          
        // //   const results = await Promise.all(notifications);
        //   console.log(filteredConversations,'user notifications');
        })
     
        socket.on("group-message", (data) => {
            groupMessageHandler(socket, data);
        });
        socket.on("group-chat-remove-notifications", async(data) => {
            const {groupChatId}=data;
            try {
              console.log("notification removed");
                loggId=socket?.user?.userId;
               await GroupChat.findOneAndUpdate(
                    {
                      _id: groupChatId,
                      'notifications.userId': loggId,
                    },
                    {
                      $set: {
                        'notifications.$.allmessages': [],
                      },
                    },
                    { new: true },
                    (err, updatedGroupChat) => {
                      if (err) {
                        console.error(err);
                        // Handle the error here
                      } else {
                        // The updatedGroupChat contains the updated document
                        // console.log(updatedGroupChat);
                      }
                    }
                  );
                     
            } catch (error) {
                
            }
        });
        socket.on("remove-message", async(data) => {
            const {messageid}=data;
            console.log(messageid,'delete messaging');
            await GroupChat.updateMany(
                { messages: messageid },
                { $pull: { messages: messageid } }
            )
         let response= await Conversation.updateMany(
                { messages: messageid },
                { $pull: { messages: messageid } }
            )
            return response;
           
        });
        socket.on("remove-user-notification", async(data) => {
        try {
            const {receiverUserId}=data
       loggId=socket?.user?.userId;

            const filter = {
              participants: { $all: [loggId, receiverUserId] },
              'notifications.userId': receiverUserId,
            };
            
            const update = {
              $set: { 'notifications.$[elem].allmessages': [] },
            };
            
            const options = {
              new: true,
              arrayFilters: [{ 'elem.userId': receiverUserId }],
            };
            
            const updatedConversation = await Conversation.findOneAndUpdate(
              filter,
              update,
              options
            );
            // console.log(updatedConversation,'remove notifications...');
        } catch (error) {
            
        }
        });

        socket.on("direct-chat-history", (data) => {
            directChatHistoryHandler(socket, data.receiverUserId);
        });

        socket.on("group-chat-history", (data) => {
            groupChatHistoryHandler(socket, data.groupChatId);
        });
        socket.on("group-chat-notifications", async(data) => {
            try {
                
               const {groupChatId} =data;
               loggId=socket?.user?.userId;
             console.log("fetching notifications");
 await GroupChat.aggregate([
    // Match the documents where the _id matches the groupId
    {
      $match: {
        _id: mongoose.Types.ObjectId(groupChatId)
      }
    },
    // Unwind the notifications array
    {
      $unwind: "$notifications"
    },
    // Match the documents where the userId in notifications matches the desired userId
    {
      $match: {
        "notifications.userId": mongoose.Types.ObjectId(loggId)
      }
    },
    // Project to reshape the data and count the allmessages
    {
      $project: {
        _id: 0,
        totalAllMessages: { $size: "$notifications.allmessages" }
      }
    }
  ])
  .exec((err, result) => {
    if (err) {
      console.error(err);
    } else {
      if (result.length > 0) {
        const totalAllMessages = result[0].totalAllMessages;
        let arr={
            notifications:totalAllMessages,
            groupChatId
        }
        socket.emit("group-chat-get-notifications",arr)
      } else {
        console.log(`No matching group found for groupId ${groupChatId} or userId ${loggId}`);
      }
    }
  });
              
            } catch (error) {
                
            }
        });


        socket.on("notify-typing", (data) => {
            notifyTypingHandler(socket, io, data);
        });

        socket.on("call-request", (data) => {
            callRequestHandler(socket, data);
        })

        socket.on("call-response", (data) => {
            callResponseHandler(socket, data);
        })

        socket.on("notify-chat-left", (data) => {
            notifyChatLeft(socket, data);
        });


        // rooms 

        socket.on("room-create", () => {
            roomCreateHandler(socket);
        });

        socket.on("room-join", (data) => {
            roomJoinHandler(socket, data);
        });

        socket.on("room-leave", (data) => {
            roomLeaveHandler(socket, data);
        });

        socket.on("conn-init", (data) => {
            roomInitializeConnectionHandler(socket, data);
        });

        socket.on("conn-signal", (data) => {
            roomSignalingDataHandler(socket, data);
        });

        socket.on("disconnect", async() => {
        //   await User.findOneAndUpdate({_id:loggId},{$set:{status:"offline"}})
            console.log(`Connected socket disconnected: ${socket.id}`);
            disconnectHandler(socket, io);
        });
    });

    // emit online users to all connected users every 10 seconds
    // setInterval(() => {
    //     io.emit("online-users", getOnlineUsers());
    // }, 10 * 1000)
};

module.exports = {
    createSocketServer,
}
