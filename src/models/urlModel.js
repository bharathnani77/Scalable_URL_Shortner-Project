const mongoose = require("mongoose");
const validUrl=require("valid-url");


const urlSchema = new mongoose.Schema(
    { 
    urlCode: {required:true,type:String,unique:true,trim:true,lowercase:true}, 
    longUrl: {required:true,type:String }, 
    shortUrl: {required:true, type:String,unique:true} 
},
   
  { timestamps: true }
);

module.exports = mongoose.model("url", urlSchema);
