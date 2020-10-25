const express = require('express')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();
const app = express()
const cors = require('cors')
app.use(cors())
const server = require('http').createServer(app)
// const io = require("socket.io")(server, {
//     handlePreflightRequest: (req, res) => {
//         const headers = {
//             "Access-Control-Allow-Headers": "Content-Type, Authorization",
//             "Access-Control-Allow-Origin": 'http://localhost:5000', //or the specific origin you want to give access to,
//             "Access-Control-Allow-Credentials": true
//         };
//         res.writeHead(200, headers);
//         res.end();
//     }
// });


const path = require('path')
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET
  });
   
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use('/user', require('./routes/auth'))
app.use('/post', require('./routes/post'))
app.use('/comment', require('./routes/comment'))
app.use('/group', require('./routes/group'))

app.get('/',(req,res)=>{
    res.json({message:"workss"})
})
mongoose.connect(process.env.DB_URL,{useCreateIndex: true, useNewUrlParser: true ,useUnifiedTopology: true },()=>{
    console.log('DB connected');
})

// io.on('connection',(socket)=>{
//     console.log('user connected');

//     socket.on('disconnect',()=>{
//         console.log('user disconnected');
//     })
// })

server.listen(process.env.PORT || 5000,(req,res)=>{
    console.log('server started');
})