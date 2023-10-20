const Designation=require("../models/designationModel")


const designationController= (async (req, res) => {
    try {
        const {name}=req.body;
        if(!name){
            res.send(400);
    throw Error("All necessary input fields have not been filled");
        }else{
            const designation=await Designation.create({
                name
            })
            if(designation){
                res.status(201).send({message:"Designation Created"})
            }
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
const designationList=(async (req, res) => {
    try {
       const desi=await Designation.find({});
       res.status(200).send(desi) 
    } catch (error) {
        res.status(500).send(error)
    }
})
const deleteDesignation=(async (req, res) => {
    try {
        const {id}=req.params;
        await Designation.findByIdAndDelete({_id:id});
       res.status(200).send({message:'Designation Deleted'}) 
    } catch (error) {
        res.status(500).send(error)
    }
})
module.exports={
    designationController,
    designationList,
    deleteDesignation
}