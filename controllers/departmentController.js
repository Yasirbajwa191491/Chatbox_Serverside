const Department=require("../models/departmentModel")


const departmentController = (async (req, res) => {
    try {
        const {name}=req.body;
        if(!name){
            res.send(400);
    throw Error("All necessary input fields have not been filled");
        }else{
            const dept=await Department.create({
                name
            })
            if(dept){
                res.status(201).send({message:"Department Created"})
            }
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
const departmentList=(async (req, res) => {
    try {
       const departemnt=await Department.find({});
       res.status(200).send(departemnt) 
    } catch (error) {
        res.status(500).send(error)
    }
})
const deleteDepartment=(async (req, res) => {
    try {
        const {id}=req.params;
       const departemnt=await Department.findByIdAndDelete({_id:id});
       res.status(200).send({message:'Department Deleted'}) 
    } catch (error) {
        res.status(500).send(error)
    }
})
module.exports={
    departmentController,
    departmentList,
    deleteDepartment
}