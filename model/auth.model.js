const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    first: {
        type: String,
        trim: true,
        required:true
    },
    last:{
        type: String,
        trim: true,
        required:true
    },
    email:{
        type:String,
        trim: true,
        unique: true,
        lowercase: true,
        required:true
        
    },
    password:{
        type: String,
        required:true
    },
    gender:{
        type: String,
        default:""
    },
    about:{
        type: String,
        default:""
    },
    city:{
        type: String,
        default:""
    },
    state:{
        type: String,
        default:""
    },
    zipcode:{
        type: String,
        default:""
    },
    country:{
        type: String,
        default:""
    },
    dateofbirth:{
        type: String,
        default:""
    },
    date:{
        type: Date,
        default: Date.now
    } 

})


const User = mongoose.model('User', userSchema)
module.exports = User