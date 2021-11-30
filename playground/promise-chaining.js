require('../src/db/mongoose')

const User = require('../src/models/user')


// User.findOneAndUpdate({name: 'Noah'}, {age: 22}).then((user) => {
//     console.log(user)
//     return User.countDocuments({age : 22})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })


const updateAgeAndCount = async (name, age) =>{
    const user = await User.findOneAndUpdate({name},{age})
    const count = await User.countDocuments({age})
    return count
}

updateAgeAndCount('Noah', 23).then((result) =>{
    console.log(result)
}).catch((e)=>{
    console.log(e)
})