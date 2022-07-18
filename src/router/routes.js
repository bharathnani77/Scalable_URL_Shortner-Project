const express=require("express")
const { model } = require("mongoose")
const router=express.Router()
const urlController=require("../controller/urlController")




router.post("/url/shorten",urlController.createUrl)



module.exports=router