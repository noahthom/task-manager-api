require('../src/db/mongoose')

const Task = require('../src/models/task')

// Task.findByIdAndDelete('61721db63b6708d141cb3dc0').then((result) => {
//     console.log(result)
//     return Task.countDocuments({completed: false})
// }).then((result) => {
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })



const deleteTaskAndCount = async (id) =>{
    const result = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return count
}

deleteTaskAndCount("61721e113b6708d141cb3dc6").then((result)=>{
    console.log(result)
}).catch((e)=>{
    console.log(e)
})