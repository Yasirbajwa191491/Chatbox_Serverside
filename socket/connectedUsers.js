const connectedUsers = new Map();
let io = null;
const User=require("../models/User")

var connectedUserId=null;
const addNewConnectedUser = async({ socketId, userId }) => {
    connectedUsers.set(socketId, { userId });
    if(userId !==null){
        connectedUserId=userId;
        // await User.findByIdAndUpdate({_id:userId},{status:"online"})
    }
};

const removeConnectedUser = async({ socketId }) => {
    if (connectedUsers.has(socketId)) {
        connectedUsers.delete(socketId);
        if(connectedUserId !==null){
            // await User.findByIdAndUpdate({_id:connectedUserId},{status:"offline"})

        }
    }
};

// get active connections of a particular user
const getActiveConnections = (userId) => {
    // get user's socket ids(active socket connections)
    const activeConnections = [];

    connectedUsers.forEach((value, key) => {
        if (value.userId === userId) {
            activeConnections.push(key);
        }
    });

    return activeConnections;
};

const getOnlineUsers = () => {
    const onlineUsers = [];

    connectedUsers.forEach((value, key) => {
        onlineUsers.push({
            userId: value.userId,
            socketId: key,
        });
    });

    return onlineUsers;
};

const setServerSocketInstance = (ioInstance) => {
    io = ioInstance;
};

const getServerSocketInstance = () => {
    return io;
};

module.exports = {
    addNewConnectedUser,
    removeConnectedUser,
    getActiveConnections,
    setServerSocketInstance,
    getServerSocketInstance,
    getOnlineUsers,
};
