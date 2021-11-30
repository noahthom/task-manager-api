const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')


const router = new express.Router()

router.post('/tasks' , auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//GET /tasks?completed=true or false
//GET /tasks?limit=10&skip=10
//GET /tasks?sort=createdAt_asc
router.get('/tasks', auth, async (req,res) => {
    const match = {}
    const sort = {}

    if(req.query.sort){
        const parts = req.query.sort.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    try{
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        })
        res.send(req.user.tasks)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req,res) =>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({ _id: _id, owner: req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req,res) =>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidParam = updates.every((update) =>allowedUpdates.includes(update))

    if(!isValidParam){
        return res.status(400).send({error: "The parameters entered do not exist!"})
    }

    try{
        const task = await Task.findOne({_id: _id, owner: req.user._id})
        
        if(!task){
            res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e){

        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req,res) =>{
    const _id = req.params.id

    try{
        const task = await Task.findOneAndDelete({_id: _id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})




module.exports = router