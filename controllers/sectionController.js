const Section=require("../models/sectionModal")


const sectionController= (async (req, res) => {
    try {
        const {name,department}=req.body;
        if(!name || !department){
            res.send(400);
    throw Error("All necessary input fields have not been filled");
        }else{
            const designation=await Section.create({
                name,department
            })
            if(designation){
                res.status(201).send({message:"Section Created"})
            }
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
const sectionList=(async (req, res) => {
    try {
       const desi=await Section.find({});
       res.status(200).send(desi) 
    } catch (error) {
        res.status(500).send(error)
    }
})
const sectionListDept=(async (req, res) => {
    try {
        const {dept}=req.params
       const desi=await Section.find({department:dept});
       res.status(200).send(desi) 
    } catch (error) {
        res.status(500).send(error)
    }
})
const deleteSection=(async (req, res) => {
    try {
        const {id}=req.params;
        await Section.findByIdAndDelete({_id:id});
       res.status(200).send({message:'Section Deleted'}) 
    } catch (error) {
        res.status(500).send(error)
    }
})
module.exports={
    sectionController,
    sectionList,
    deleteSection,
    sectionListDept
}