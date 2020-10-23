const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    post: {
        type: String,
        trim: true,
    },
    activity:{
        type: String,
        trim: true,
    },
    posttype:{
        type:String,
        default:"general"
    },
    group:{
        status:{type:Boolean,default:false},
        name:{ type:mongoose.Schema.Types.ObjectId,ref:"Group"},
        category:{type:String,default:""}       
    },
    link:{
        status:{type:Boolean,default:false},
        name:{ type:String,default:""}
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