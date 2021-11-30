const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(num){
            if(num<0){
                throw new Error('Age cannot be negative!')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.BCRYPT_SECRET)
    this.tokens = this.tokens.concat({ token: token})
    await this.save()
    return token
}

userSchema.methods.toJSON = function () {
    const userObj = this.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login, email does not exist!')
    }

    const isMatch = await bcryptjs.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login, incorrect password!')
    }

    return user
}




//hashing plain text password before saving
userSchema.pre('save', async function (next) {
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password, 8)
    }
    next()
})

//deleting user tasks before deleting user
userSchema.pre('remove', async function (next) {
    await Task.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User