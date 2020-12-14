const express = require('express')
const route = express.Router()
const {usersignin} = require('../middleware/auth.middleware')
const slugify = require('slugify')

const { v4: uuidv4 } = require('uuid');
 
const blogCategory = require('../model/blogCategory.model');



route.post("/create",usersignin,(req,res)=>{
    const {name} = req.body
    let _category = new blogCategory({
        creator:req.user._id,
        name,
        slug:slugify(name),
    })

    _category.save()
    .then(category=>{
        res.status(201).json({
            success:true,
            blogCategory:category
        })
    })
    .catch(err=>{
        res.status(400).json({error:"Something went wrong"})
    })
})

route.get('/getcategory',(req,res)=>{
    blogCategory.find()
    .then(category=>{
        res.status(201).json({
            success:true,
            blogCategory:category
        }) 
    })
    .catch(err=>{
        res.status(400).json({error:"Something went wrong"})
    })
})

module.exports = route