const mongoose = require('mongoose')
const arrayUniquePlugin = require("mongoose-unique-array")

const postSchema = new mongoose.Schema({
    post: {
        type: String,
        trim: true,
    },
    activity:{
        type: String,
        trim: true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    image:[{type:String}] ,
    date:{
        type: Date,
        default: Date.now
    },
    like:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    comment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }]

})

const Post = mongoose.model('Post', postSchema)
module.exports = Post