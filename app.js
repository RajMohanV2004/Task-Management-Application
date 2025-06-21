const express=require("express");
const app=express();
require("dotenv").config();
require('./conn/conn');
const cors = require('cors');
const UserAPI = require('./routes/user');
const TaskAPI = require('./routes/task');
const UploadPhotoAPI = require('./routes/uploadPhoto');


app.use(cors());
app.use(express.json());

app.use("/api/v1", UploadPhotoAPI);
app.use("/api/v1",UserAPI);
app.use("/api/v2",TaskAPI);

app.use('/uploads', express.static('uploads')); // Serve uploaded images publicly

//localhost:1000/api/v1/sign-in
//localhost:1000/api/v2/create-task

app.use("/",(req,res)=>{
    res.send("hello from backend side");
});

const PORT=1000;
 app.listen(PORT, ()=>{
    console.log(`server started at http://localhost:${PORT}`);
 });