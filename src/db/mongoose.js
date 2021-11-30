const mongoose = require('mongoose')

const connectionURL_mongoose = 'mongodb://127.0.0.1:27017/task-manager-api'

mongoose.connect(process.env.DB_URL)




