const express = require('express')
const route = express.Router()
const User = require('../model/auth.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const registerValidator = require('../validator/signupValidator')
const signinValidator = require('../validator/signinValidator')

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
                    
                    res.status(200).json({token,user:userdetails,success: true})
                })
            })
        })
        
    }


})

module.exports = route