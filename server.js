const express = require('express')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();
const app = express()
const cors = require('cors')
const path = require('path')
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET
  });
   
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

app.use('/user', require('./routes/auth'))
app.use('/post', require('./routes/post'))
app.use('/comment', require('./routes/comment'))

app.get('/',(req,res)=>{
    res.json({message:"works"})
})
mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true ,useUnifiedTopology: true },()=>{
    console.log('DB connected');
})
app.listen(process.env.PORT || 5000,(req,res)=>{
    console.log('server started');
})