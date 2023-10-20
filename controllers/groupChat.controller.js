const User = require("../models/User");
const GroupChat = require("../models/GroupChat");
const {
    updateUsersGroupChatList,
} = require("../socketControllers/notifyConnectedSockets");
const mongoose = require("mongoose");

const createGroupChat = async (req, res) => {
    try {
        const { email, userId } = req.user;
        const { name } = req.body;

        // create group
        const chat = await GroupChat.create({
            name: name,
            participants: [userId],
            admin: userId,
        });

        const currentUser = await User.findById(userId);
        currentUser.groupChats.push(chat._id);
        await currentUser.save();

        updateUsersGroupChatList(userId.toString());

        return res.status(201).send("Group created successfully");
    } catch (err) {
        return res
            .status(500)
            .send("Sorry, something went wrong. Please try again later");
    }
};

const addMemberToGroup = async (req, res) => {
    try {
        const { email, userId } = req.user;
        const { friendIds, groupChatId } = req.body;

        // check if groupChat exists
        const groupChat = await GroupChat.findOne({ _id: groupChatId });

        if (!groupChat) {
            return res.status(404).send("Sorry, the group chat doesn't exist");
        }

        if (groupChat.admin.toString() !== userId) {
            return res
                .status(403)
                .send(
                    "Forbidden. Only group admin can add members to the group."
                );
        }

        // add friends to the group

        const friendsToAdd = [];

        friendIds.forEach((id) => {
            if (!groupChat.participants.includes(id)) {
                friendsToAdd.push(id);
            }
        });

        groupChat.participants = [...groupChat.participants, ...friendsToAdd];
        await groupChat.save();

        // update groupChat list of all the participants
        friendsToAdd.forEach(async (friendId) => {
            const participant = await User.findById(friendId);

            if (participant) {
                participant.groupChats.push(groupChatId);
                await participant.save();

                // update the user's(user who has been added to the group) chat list
                updateUsersGroupChatList(friendId.toString());
            }
        });

        // update the admin's chat list
        updateUsersGroupChatList(groupChat.admin.toString());

        return res.status(200).send("Members added successfully!");
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .send("Sorry, something went wrong. Please try again later");
    }
};

const leaveGroup = async (req, res) => {
    try {
        const { userId } = req.user;
        const { groupChatId } = req.body;

        // check if groupChat exists
        const groupChat = await GroupChat.findOne({ _id: groupChatId });

        if (!groupChat) {
            return res.status(404).send("Sorry, the group chat doesn't exist");
        }

        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res.status(404).send("User not found");
        }

        // remove user from the group
        groupChat.participants = groupChat.participants.filter(
            (participant) => {
                return participant.toString() !== currentUser._id.toString();
            }
        );
        await groupChat.save();

        // remove groupChat from the list of user's groupChats
        currentUser.groupChats = currentUser.groupChats.filter((chat) => {
            return chat.toString() !== groupChat._id.toString();
        });

        await currentUser.save();

        // update the chat list of user who left the chat.
        updateUsersGroupChatList(currentUser._id.toString());

        groupChat.participants.forEach((participant) => {
            // update the participants chat list
            updateUsersGroupChatList(participant.toString());
        });

        return res.status(200).send("You have left the group!");
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .send("Sorry, something went wrong. Please try again later");
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { userId } = req.user;
        const { groupChatId } = req.body;

        // check if groupChat exists
        const groupChat = await GroupChat.findOne({ _id: groupChatId });

        if (!groupChat) {
            return res.status(404).send("Sorry, the group chat doesn't exist");
        }

        if (groupChat.admin.toString() !== userId) {
            return res
                .status(403)
                .send("Forbidden. Only group admins can delete a group.");
        }

        // update groupChat list of all the participants
        groupChat.participants.forEach(async (friendId) => {
            const participant = await User.findById(friendId);

            if (participant) {
                participant.groupChats = participant.groupChats.filter(
                    (chat) => chat.toString() !== groupChat._id.toString()
                );
                await participant.save();

                // update the users group chat list
                updateUsersGroupChatList(friendId.toString());
            }
        });

        // lastly delete the groupChat
        groupChat.remove();

        return res.status(200).send("Group deleted successfully!");
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .send("Sorry, something went wrong. Please try again later");
    }
};
const remove_participant = async (req, res) => {
    try {
        const { id, groupId } = req.params;

        // Check if `id` and `groupId` are valid ObjectId strings
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(groupId)) {
          return res.status(400).send({ message: "Invalid ID format" });
        }
        
        // Check if the document with the specified `groupId` exists
        const groupExists = await GroupChat.exists({ _id: groupId });
        
        if (!groupExists) {
          return res.status(404).send({ message: "Group not found" });
        }
        
        // Use the $pull operator to remove the participant from the participants array
        const result = await GroupChat.updateOne(
          { _id: groupId },
          { $pull: { participants: id} }
        );
        
        if (result) {
          res.status(200).send({ message: "Participant removed" });
        } else {
          res.status(200).send({ message: "Participant not removed" });
        }
        
    } catch (error) {
        return res
            .status(500)
            .send("Sorry, something went wrong. Please try again later"+error);  
    }
}
module.exports = {
    createGroupChat,
    addMemberToGroup,
    leaveGroup,
    deleteGroup,
    remove_participant
};
