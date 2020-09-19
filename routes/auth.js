const express = require('express')
const route = express.Router()
const User = require('../model/auth.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {usersignin} = require('../middleware/auth.middleware')
const Post = require('../model/post.model')
const registerValidator = require('../validator/signupValidator')
const signinValidator = require('../validator/signinValidator')
const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
 
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fbpost',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) =>uuidv4()+"-"+file.originalname,
  },
});
   
  var upload = multer({ storage: storage })

route.post('/signup', (req, res)=>{
    const {first, last, email, password,confirm} = req.body
    const register = registerValidator(first,last, email, password, confirm)

    if(!register.isError){
        return res.status(404).json(error)
    }else{
        User.findOne({email})
        .then(user=>{
            
            if(user){
               return res.status(400).json({error: 'User already registered'})
            }

            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(password, salt, (err, hash)=>{
                    const newUser = new User({
                        first, last, email, password : hash
                    })
        
                    newUser.save()
                    .then(user=>{
                        res.status(200).json({
                            first: user.firstName,
                            last: user.lastName,
                            email: user.email,
                        })
                    })
                    .catch(err=>res.status(400).json({error:"something went wrong"}))
                
                })
            })
               
            
        })
        .catch(err=>console.log('no user')
        )
        
    }

   
    
    
})


route.post('/signin', (req,res)=>{
    const {email, password} = req.body
    const login = signinValidator(email, password)
    if(!login.isError){
        res.status(400).json(error)
    }else{
        User.findOne({email})
        .then(user=>{
            
            if(!user){
                return res.status(400).json({error: 'User not found'})
            }
            bcrypt.compare(password, user.password,(err, result)=>{
                if(err){
                   return res.status(400).json({error: 'Email or Password invalid'})
                }
                if(!result){
                   return res.status(400).json({ error: 'Password invalid' })
                }

                var userdetails = {
                    _id:user._id,
                    first: user.first,
                    last: user.last,
                    email: user.email,
                    
                    
                }
                jwt.sign(userdetails, process.env.JWT_SECRET,(err,token)=>{
                    if(err){
                        return res.status(400).json({error: 'server error'})
                    }
                    
                    res.status(200).json({token,user:userdetails,profileimg:user.profileimg,success: true})
                })
            })
        })
        
    }


})


route.put('/profileimg',usersignin,upload.single('profileimg'),(req,res)=>{
    const file = req.file
    User.findByIdAndUpdate(req.user._id,{$set:{profileimg:file.path}},{new:true})
    .select('-password')
    .then(user=>{
        let newpost = new Post({
            post:'',user: user._id, image:user.profileimg,activity:'Updated profile photo'
        })
        newpost.save()
        Post.populate(newpost,{path:"user",select:"_id first last email"})
        .then(post=>{
            res.status(200).json({post,user:user})
        })
    })
})


route.put('/coverimg',usersignin,upload.single('coverimg'),(req,res)=>{
    const file = req.file
    User.findByIdAndUpdate(req.user._id,{$set:{coverimg:file.path}},{new:true})
    .select('-password')
    .then(user=>{
        let newpost = new Post({
            post:'',user: user._id, image:user.coverimg,activity:'Updated cover photo'
        })
        newpost.save()
        Post.populate(newpost,{path:"user",select:"_id first last email"})
        .then(post=>{
            res.status(200).json({post,user:user})
        })
    })
})

route.get('/profile',usersignin,(req,res)=>{
    User.findById(req.user._id)
    .select('-password')
    .then(user=>{
        res.status(200).json({user})
    })
})


route.get('/get',usersignin,(req,res)=>{
    User.find({_id:{$ne:req.user._id},friends:{$ne:req.user._id},requests:{$ne:req.user._id}})
    .select('_id first last email profileimg')
    .then(user=>{

        User.findById(req.user._id)
        .populate('requests','_id first last email profileimg')
        .then(me=>{
            
               let userarray = [...user]
               let myarry = [...me.requests]
               const result = userarray.filter(({_id})=>!myarry.some(x=>x._id == _id))
               res.status(200).json({user})
        })
        
    })
})

route.put('/addfriend/:friendid',usersignin,(req,res)=>{
    User.findByIdAndUpdate(req.params.friendid,{$push:{requests:req.user._id}},{new:true})
    .select('_id first last email profileimg')
    .then(user=>{
        res.status(200).json({user})
    })
})

route.get('/getfriends',usersignin,(req, res)=>{
    User.findById(req.user._id)
    .populate('friends','_id first last email profileimg')
    .then(user=>{
        res.status(200).json({friends:user.friends})
    })
})

route.get('/getrequests',usersignin,(req, res)=>{
    User.findById(req.user._id)
    .populate('requests','_id first last email profileimg ')
    .then(user=>{
        res.status(200).json({requests:user.requests})
    })
})

route.get('/followings',usersignin,(req, res)=>{
    User.find({requests:{$in:[req.user._id]}})
    .select('_id first last email profileimg ')
    .then(user=>{
        res.status(200).json({followings:user})
    })
})

route.put('/confirmfriend/:friendid',usersignin,(req,res)=>{
    User.findByIdAndUpdate(req.params.friendid,{$push:{friends:req.user._id}},{new:true})
    .then(frnd=>{
        User.findByIdAndUpdate(req.user._id,{$push:{friends:frnd._id},$pull:{requests:frnd._id}},{new:true})
        .then(me=>{
            res.status(200).json({_id:frnd._id})
        })
    })
})

route.put('/unfriend/:friendid',usersignin,(req,res)=>{
    User.findByIdAndUpdate(req.params.friendid,{$pull:{friends:req.user._id}},{new:true})
    .then(frnd=>{
        User.findByIdAndUpdate(req.user._id,{$pull:{friends:frnd._id}},{new:true})
        .then(me=>{
            res.status(200).json({_id:frnd._id})
        })
    })
})

route.put('/cancelreq/:friendid',usersignin,(req,res)=>{
    User.findByIdAndUpdate(req.params.friendid,{$pull:{requests:req.user._id}},{new:true})
    .then(frnd=>{
        res.status(200).json({_id:frnd._id})
    })
})


module.exports = route