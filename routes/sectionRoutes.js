const express = require("express");
const { sectionController,
    sectionList,
    deleteSection,
    sectionListDept
}
=require("../controllers/sectionController")
const Router = express.Router();
Router.post("/submit_section",sectionController);
Router.get("/section_list",sectionList);
Router.get("/section_list/:dept",sectionListDept);
Router.delete("/deleteSection/:id",deleteSection);

module.exports = Router;