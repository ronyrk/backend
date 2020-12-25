const express = require('express')
const route = express.Router()
const User = require('../model/auth.model')
const Article = require('../model/article.model')
const { usersignin, admin } = require('../middleware/auth.middleware')

route.get('/allarticles', usersignin,admin,(req, res) => {


    Article.find()
    .populate("category", "name slug _id")
    .populate("creator", "first last _id email username profileimg")
    .populate("blog")
    .sort("-createdAt")
    .then(articles => {
        res.status(200).json({ success: true, articles })

    })
    .catch(err => {

        res.status(400).json({ error: "something went wrong" })
    })
    
    
})


route.patch('/editarticle/:articleid',usersignin,admin,(req,res)=>{
    const {status} = req.body
    let articleId = req.params.articleid
    Article.findByIdAndUpdate(articleId,{$set:{isApproved:status === 'approve' ? true : false}},{new:true})
    .populate("category", "name slug _id")
    .populate("creator", "first last _id email username profileimg")
    .populate("blog")
    .then(article => {
        res.status(200).json({ success: true, article })

    })
    .catch(err => {

        res.status(400).json({ error: "something went wrong" })
    })
})

route.delete('/deletearticle/:articleid',usersignin,admin,(req,res)=>{
    
    let articleId = req.params.articleid
    Article.findByIdAndDelete(articleId)
    .then(article => {
        res.status(200).json({ success: true})

    })
    .catch(err => {

        res.status(400).json({ error: "something went wrong" })
    })
})
module.exports = route