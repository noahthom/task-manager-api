const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, cancelationEmail} = require('../emails/account')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error('Please upload an appropriate image format.'))
        }
        cb(undefined, true)
    }
})

const router = new express.Router()

router.post('/users', async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req,res) =>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token  = await user.generateAuthToken()
        res.send({ user, token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) =>{
    try{
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth, async(req,res) => {
    
    res.send(req.user)
    
})


router.patch('/users/me', auth, async (req,res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidParam = updates.every((update) =>allowedUpdates.includes(update))

    if(!isValidParam){
        return res.status(400).send({error: "The parameters entered do not exist!"})
    }

    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async(req,res) =>{

    try{
        cancelationEmail(req.user.email, req.user.name)
        await req.user.remove()
        
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) =>{
    const buffer  = await sharp(req.file.buffer).resize({ width: 350, height: 250 }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


module.exports = router