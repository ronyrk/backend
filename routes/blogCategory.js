const express = require('express')
const route = express.Router()
const {usersignin,admin} = require('../middleware/auth.middleware')
const slugify = require('slugify')

const { v4: uuidv4 } = require('uuid');
 
const blogCategory = require('../model/blogCategory.model');



route.post("/create",usersignin,admin,(req,res)=>{
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

route.post("/edit/:categoryid",usersignin,admin,(req,res)=>{
    const {name} = req.body
    let categoryId = req.params.categoryid
   if(!name || !categoryId){
    res.status(400).json({error:"id and name is required"})
   }

    blogCategory.findByIdAndUpdate(categoryId,{$set:{name:name}},{new:true})
    .then(category=>{
        res.status(200).json({
            success:true,
            blogCategory:category
        })
    })
    .catch(err=>{
        res.status(400).json({error:"Something went wrong"})
    })
})

route.delete('/delete/:categoryid',usersignin,admin,(req,res)=>{
    let categoryId = req.params.categoryid
   if(!categoryId){
    res.status(400).json({error:"id is required"})
   }

   blogCategory.findByIdAndDelete(categoryId)
   .then(category=>{
    res.status(200).json({
        success:true,
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