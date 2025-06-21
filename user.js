const mongoose=require("mongoose");
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePhoto: {
        type: String, // store filename or path
        default: ""
      },      
    tasks:[
        {
        type:mongoose.Types.ObjectId,
        ref:"task"
        },
    ],
});
module.exports=mongoose.model("user", userSchema);