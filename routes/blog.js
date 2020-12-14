const express = require('express')
const route = express.Router()
const {usersignin} = require('../middleware/auth.middleware')
const Blog = require('../model/blog.model')
const Article = require('../model/article.model')
const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const shortid = require('shortid')
const slugify = require('slugify')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {},
});
   
  var upload = multer({ storage: storage })


route.post("/create",usersignin,(req,res)=>{
    const {name, description} = req.body

    if(!name){
        return res.status(400).json({error:"Blog name is required"})
    }

    let _blog = new Blog({
        creator:req.user._id,
        name,
        description:description||'',
        slug:slugify(name+"-"+shortid.generate()),

    })

    _blog.save()
    .then(blog=>{
        res.status(201).json({sucess:true,blog})
    })
    .catch(err=>{
        res.status(400).json({error:"something went wrong"})
    })
})


route.get('/myblog',usersignin,(req,res)=>{
    Blog.find({creator:req.user._id})
    .then(blog=>{
        res.status(200).json({sucess:true,blog})
    })
    .catch(err=>{
        res.status(400).json({error:"something went wrong"})
    })
})

route.get('/single/:slug',(req,res)=>{
    Blog.findOne({slug:req.params.slug})
    .then(blog=>{
        Article.find({blog:blog._id})
        .populate("category","name slug _id")
        .sort("-createdAt")
        .limit(6)
        .then(article=>{
            Article.find({blog:blog._id})
                .populate("category", "name slug _id")
                .populate("creator", "first last _id email username profileimg")
                .sort("-views")
                .limit(8)
                .then(popular => {
                    res.status(200).json({sucess:true,blog,article,popular})
                })
          
        })
    })
    .catch(err=>{
        res.status(400).json({error:"something went wrong"})
    })
})

route.get('/allblogs',(req,res)=>{
    Blog.find()
    .then(blog=>{
        res.status(200).json({sucess:true,blog})
    })
    .catch(err=>{
        res.status(400).json({error:"something went wrong"})
    })
})

  module.exports = route