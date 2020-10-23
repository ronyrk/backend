const express = require('express')
const route = express.Router()
const {usersignin} = require('../middleware/auth.middleware')
const slugify = require('slugify')

const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Group = require('../model/group.model');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'groups',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) =>uuidv4()+"-"+file.originalname,
  },
});

var upload = multer({ storage: storage })





route.post('/create',usersignin,(req,res)=>{
  const {name,description,privacy} = req.body
  let newGroup = new Group({
    name,
    description,
    privacy,
    slug:slugify(name+"-"+uuidv4()),
    creator:req.user._id,
    members:[req.user._id]
  })
  newGroup.save()
  .then(group=>{
    res.status(200).json({success:true,group})
  })
})

route.get('/getall',(req,res)=>{
  Group.find()
  .then(group=>{
    res.status(200).json({group})
  })
})

route.get('/:groupslug',(req,res)=>{
  Group.findOne({slug:req.params.groupslug})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"some thing went wrong"})
    }
    res.status(200).json({group})
  })
})


route.put('/groupimg/:slug',usersignin,upload.single('groupimg'),(req,res)=>{
  const file = req.file
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$set:{groupimg:file.path}},{new:true})
  .then(group=>{
      // let newpost = new Post({
      //     post:'',user: user._id, image:user.profileimg,activity:'Updated profile photo'
      // })
      // newpost.save()
      // Post.populate(newpost,{path:"user",select:"_id first last email"})
      // .then(post=>{
      //     res.status(200).json({post,user:user})
      // })
      res.status(200).json({group})
  })
})


route.put('/groupcover/:slug',usersignin,upload.single('groupcover'),(req,res)=>{
  const file = req.file
  console.log(file.path);
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$set:{groupcover:file.path}},{new:true})
  .then(group=>{
    console.log(group);
      // let newpost = new Post({
      //     post:'',user: user._id, image:user.coverimg,activity:'Updated cover photo'
      // })
      // newpost.save()
      // Post.populate(newpost,{path:"user",select:"_id first last email"})
      // .then(post=>{
      //     res.status(200).json({post,user:user})
      // })
      res.status(200).json({group})
  })
})


route.put('/edit/:slug',usersignin,(req,res)=>{
  let {name,slug,description,privacy,postpermission,memberapproval,postapproval,posttype,showcategory} = req.body
  let option = {name,slug,description,privacy,postpermission,memberapproval,postapproval,posttype,showcategory}

   Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$set:option},{new:true})
   .then(group=>{
     if(!group){
       return res.status(404).json({error:"something went wrong"})
     }
     res.status(200).json({group})


   })
})

route.put('/addrule/:slug',usersignin,(req,res)=>{
  let {title,description} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$push:{rules:{title:title,description:description}}},{new:true})
   .then(group=>{
     if(!group){
       return res.status(404).json({error:"something went wrong"})
     }
     res.status(200).json({rules:group.rules})


   })
})

route.patch('/deleterule/:slug',usersignin,(req,res)=>{
  let {ruleid} = req.body 
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$pull:{rules:{_id:ruleid}}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({rules:group.rules})


  })

})

route.patch('/editrule/:slug',usersignin,(req,res)=>{
  let {title, description,ruleid} = req.body
  console.log(title,description,ruleid)
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug,"rules._id":ruleid},{$set:{'rules.$':{title,description}}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({rules:group.rules})


  })

})

route.put('/addcategory/:slug',usersignin,(req,res)=>{
  let {name} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$push:{category:name}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({category:group.category})


  })

})

route.put('/deletecategory/:slug',usersignin,(req,res)=>{
  let {name} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$pull:{category:name}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({category:group.category})


  })

})





route.put('/addapprovedlink/:slug',usersignin,(req,res)=>{
  let {name} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$push:{approvedlink:name}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({approvedlink:group.approvedlink})


  })

})

route.put('/deleteapprovedlink/:slug',usersignin,(req,res)=>{
  let {name} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$pull:{approvedlink:name}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({approvedlink:group.approvedlink})


  })

})



route.put('/addblockedlink/:slug',usersignin,(req,res)=>{
  let {name} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$push:{blockedlink:name}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({blockedlink:group.blockedlink})


  })

})

route.put('/deleteblockedlink/:slug',usersignin,(req,res)=>{
  let {name} = req.body
  Group.findOneAndUpdate({creator:req.user._id,slug:req.params.slug},{$pull:{blockedlink:name}},{new:true})
  .then(group=>{
    if(!group){
      return res.status(404).json({error:"something went wrong"})
    }
    res.status(200).json({blockedlink:group.blockedlink})


  })

})



route.put('/join/:groupid',usersignin,(req,res)=>{
  Group.findById(req.params.groupid)
  .then(g=>{
    let members = g.members
    if(members.includes(req.user._id)){
      return res.status(404).json({error:"You already joined"})
    }else if(g.privacy === 'private'){
      return res.status(404).json({error:"This is a private group"})
    }else{
      Group.findOneAndUpdate({_id:g._id},{$push:{members:req.user._id}},{new:true})
      .then(group=>{
        res.status(200).json({group})
      })
    }
  })
})


route.put('/leave/:groupid',usersignin,(req,res)=>{
  Group.findById(req.params.groupid)
  .then(g=>{
    let members = g.members
    if(g.creator == req.user._id){
      return res.status(404).json({error:"Group creator can't leave"})
    }else if(members.includes(req.user._id)){
      Group.findOneAndUpdate({_id:g._id},{$pull:{members:req.user._id}},{new:true})
      .then(group=>{
        res.status(200).json({group})
      })

    }else{
      return res.status(404).json({error:"You already joined"})
      
    }
  })
})

module.exports = route