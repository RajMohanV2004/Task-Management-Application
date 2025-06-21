const mongoose=require("mongoose");
const conn= async()=>{
    try{
        const response=await mongoose.connect(`${process.env.MONGO_URI}`/* template literal, the value is evaluated to the string in the {} after the $ symbol*/);
        if(response){
            console.log("connected to db");
        }
    }
    catch(error){
        console.log(error);
    }
};
conn();