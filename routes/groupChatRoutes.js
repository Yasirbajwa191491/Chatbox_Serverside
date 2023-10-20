const express = require("express");
const router = express.Router();

const {
    createGroupChat,
    addMemberToGroup,
    leaveGroup,
    deleteGroup,
    remove_participant
} = require("../controllers/groupChat.controller");

const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});
const requireAuth = require("../middlewares/requireAuth");

const createGroupChatSchema = Joi.object({
    name: Joi.string().required(),
});

const addMemberSchema = Joi.object({
    friendIds: Joi.array().min(1).items(Joi.string()),
    groupChatId: Joi.string().required(),
});

const leaveGroupSchema = Joi.object({
    groupChatId: Joi.string().required(),
});

const deleteGroupSchema = Joi.object({
    groupChatId: Joi.string().required(),
});

// create a groupChat
router.post(
    "/",
    requireAuth,
    validator.body(createGroupChatSchema),
    createGroupChat
);

// add a friend to the group
router.post(
    "/add",
    requireAuth,
    validator.body(addMemberSchema),
    addMemberToGroup
);
router.delete("/remove_participant/:id/:groupId",remove_participant)
// leave a group
router.post(
    "/leave",
    requireAuth,
    validator.body(leaveGroupSchema),
    leaveGroup
);

// delete a group
router.post(
    "/delete",
    requireAuth,
    validator.body(deleteGroupSchema),
    deleteGroup
);


module.exports = router;
