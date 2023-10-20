const express = require("express");
const {designationController,designationList,deleteDesignation}
=require("../controllers/designationController")
const Router = express.Router();
Router.post("/submit_designation",designationController);
Router.get("/designation_list",designationList);
Router.delete("/deleteDesignation/:id",deleteDesignation);

module.exports = Router;