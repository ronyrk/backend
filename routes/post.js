const express = require('express')
const route = express.Router()
const {usersignin} = require('../middleware/auth.middleware')
const Post = require('../model/post.model')
const Group = require('../model/group.model')
const User = require('../model/auth.model')
const Comment = require('../model/comment.model')
const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
var validate = require('url-validator')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fbpost',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) =>uuidv4()+"-"+file.originalname,
  },
});
   
  var upload = multer({ storage: storage })


  route.get('/mypost',usersignin,(req,res)=>{
        Post.find({user:req.user._id})
        .sort("-date")
        .populate('user', 'first last _id profileimg')
        .populate('group.name','name slug')
        .populate({
        path: "comment",
        populate:{
            path:"commentedby",
            model:"User",
            select:"_id first last email"
        }
        })
        .then(post=>{
            res.status(200).json({post,id:req.user._id})
        })
    })
route.post('/create',usersignin,upload.array('postimg'),(req,res)=>{
    const {post} = req.body
    let imagearray = []
    req.files.map(file=>{
        imagearray.push(file.path)
    })
    let newpost = new Post({
        post,user: req.user._id, image:imagearray
    })

    newpost.save()
    Post.populate(newpost,{path:"user",select:"first last _id profileimg"})
    .then(post=>{
        res.status(200).json({post})
    })
    .catch(err=>console.log(err))
})


route.post('/:groupid/general/create',usersignin,upload.array('postimg'),(req,res)=>{
    const {post,category} = req.body
    let imagearray = []
    // req.files.map(file=>{
    //     imagearray.push(file.path)
    // })
    let newpost = new Post({
        post,
        user: req.user._id,
         image:imagearray,
         group:{status:true,name:req.params.groupid,category:category}
    })


    Group.findOne({_id:req.params.groupid})
    .then(group=>{
        if(!group){
            return res.status(404).json({error:"Something went wrong"})
        }
        if(group.members.includes(req.user._id)){
            newpost.save()
            Post.populate(newpost,{path:"user",select:"first last _id profileimg"})
            .then(post=>{
                res.status(200).json({post})
            })
            .catch(err=>console.log(err))     
        }else{
            return res.status(404).json({error:"Not allowed"})
        }
    })
  
})


route.post('/:groupid/link/create',usersignin,(req,res)=>{
    const {post,link} = req.body

    var url = validate(link)

   if(url){

    Group.findOne({_id:req.params.groupid})
    .then(group=>{

        if(!group){
            return res.status(404).json({error:"Something went wrong"})
        }
        if(!group.members.includes(req.user._id)){
            return res.status(404).json({error:"Not allowed"})
        }


        let approvedlink = group.approvedlink
        let blockedlink = group.blockedlink
        
        let match=(str,expr)=>{
            let fullExp = new RegExp(expr
                .map(x=>x.replace("www.",""))
                .join("|")
                
                )
                return str.match(fullExp)
        }


        if(approvedlink.length > 0){
            if(match(url,approvedlink)){
                let newpost = new Post({
                    post,
                    user: req.user._id,
                    link:{status:true,name:link},
                    group:{status:true,name:req.params.groupid,category:''},
                    posttype:'link'
                })
                
                newpost.save()
                Post.populate(newpost,{path:"user",select:"first last _id profileimg"})
                .then(post=>{
                    res.status(200).json({post})
                })
                .catch(err=>console.log(err))
            }else{
                return res.status(400).json({error: 'Url blocked, try another'})
    
            } 
        }else{
            if(match(url,blockedlink) === null || (match(url,blockedlink)[0] === '')){
                let newpost = new Post({
                    post,
                    user: req.user._id,
                    link:{status:true,name:link},
                    group:{status:true,name:req.params.groupid,category:''},
                    posttype:'link'
                })
                
                newpost.save()
                Post.populate(newpost,{path:"user",select:"first last _id profileimg"})
                .then(post=>{
                    res.status(200).json({post})
                })
                .catch(err=>console.log(err))
            }else{
                return res.status(400).json({error: 'Url blocked, try another'})
    
            }
        }
          
        
   })
    
}else{
    return res.status(400).json({error: 'Invalid url, try http://www.example.com'})
}

})



route.post('/:groupid/picture/create',usersignin,upload.array('postimg'),(req,res)=>{
    const {post} = req.body
    let imagearray = []
     req.files.map(file=>{
         imagearray.push(file.path)
     })
    let newpost = new Post({
        post,
        user: req.user._id,
         image:imagearray,
         group:{status:true,name:req.params.groupid,category:''},
         posttype:'picture'
    })

    
    Group.findOne({_id:req.params.groupid})
    .then(group=>{

        if(!group){
            return res.status(404).json({error:"Something went wrong"})
        }
        if(group.members.includes(req.user._id)){
            newpost.save()
            Post.populate(newpost,{path:"user",select:"first last _id profileimg"})
            .then(post=>{
                res.status(200).json({post})
            })
            .catch(err=>console.log(err))
        }else{
            
            return res.status(404).json({error:"Not allowed"})
        }

       

    })
    
})





route.get('/get',(req, res)=>{
    Post.find()
    .sort("-date")
    .populate('user', 'first last _id profileimg')
    .populate('group.name')
    .populate({
        path: "comment",
        populate:{
            path:"commentedby",
            model:"User",
            select:"_id first last email profileimg"
        }
    })
    .then(post=>{
        res.status(200).json({post})
    })
})



route.get('/grouppost/:groupid',(req, res)=>{
    console.log(req.query.category);
    let query = {
        "group.status":true,
        "group.name":req.params.groupid
    }
    if(req.query.category == 'All'){
        query={...query}
    }else if(req.query.category){
        query["group.category"] = req.query.category
    }

    Post.find(query)
    .sort("-date")
    .populate('user', 'first last _id profileimg')
    .populate('group.name','name slug')
    .populate({
        path: "comment",
        populate:{
            path:"commentedby",
            model:"User",
            select:"_id first last email profileimg"
        }
    })
    .then(post=>{
        res.status(200).json({post})
    })
    .catch(err=>{
        console.log(err);
    })
})

// route.get('/mypost',usersignin,(req, res)=>{
//     Post.find({_id:req.user._id})
//     .then(post=>{
//         res.status(200).json({post})
//     })
// })

route.put('/:react/:id',usersignin,(req,res)=>{
if(req.params.react === 'like'){
    Post.findById(req.params.id)
    .then(post=>{
        let array = post.like
         let confirm =array.includes(req.user._id)
        if(confirm){
            return res.status(400).json({error:"user already liked"})
        }else{
            Post.findOneAndUpdate({_id:req.params.id},{$push:{like:req.user._id}},{new:true})
            .populate('group.name',"name slug")
            .then(post=>{
                res.status(200).json({post})
            })
        }
    })

    }else if(req.params.react === 'unlike'){
        Post.findById(req.params.id)
        .then(post=>{
            let array = post.like
             let confirm =array.includes(req.user._id)
            if(confirm){
                Post.findOneAndUpdate({_id:req.params.id},{$pull:{like:req.user._id}},{new:true})
                .populate('group.name',"name slug")
                .then(post=>{
                    res.status(200).json({post})
                })
                
            }else{
                return res.status(400).json({error:"You did't liked it"})
            }
        })
    }

})


route.patch('/delete/:postid',usersignin,(req,res)=>{
    Post.findById(req.params.postid)
    .populate('user',"_id")
    .then(post=>{
        if(post.user._id == req.user._id){
            let commentarray = post.comment
        Comment.deleteMany({_id:{$in:commentarray}})
        .then(data=>{
            Post.findByIdAndDelete(req.params.postid)
            .then(post=>{
                res.status(200).json({success:true})
            })
        })
        }else{
            res.status(400).json({error:"not authorized"})
        }
        
    })
})

route.get('/userprofile/:userid',(req,res)=>{
   User.findById(req.params.userid)
   .select('-password')
   .then(u=>{
       Post.find({user:req.params.userid})
       .sort("-date")
       .populate('user', 'first last _id profileimg')
       .populate('group.name','name slug')
       .populate({
        path: "comment",
        populate:{
            path:"commentedby",
            model:"User",
            select:"_id first last email profileimg"
        }
    })
       .then(post=>{
        res.status(200).json({user:u,post})
       })
    
   })
})




module.exports = route