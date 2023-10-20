const express = require("express");
const {departmentController,departmentList,deleteDepartment}=require("../Controllers/departmentController")
const Router = express.Router();
Router.post("/submit_department",departmentController);
Router.get("/department_list",departmentList);
Router.delete("/deleteDepartment/:id",deleteDepartment);

module.exports = Router;