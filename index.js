const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')
const { Schema } = mongoose

mongoose.connect(process.env.DB_URL)

const UserSchema = new Schema({
  username: String
})

const User = mongoose.model('User', UserSchema)

const ExerciseSchema = new Schema ({
  user_id: {type: String, required: true},
  description: String, 
  duration: Number, 
  date: Date
})

const Exercise = mongoose.model('Exercise', ExerciseSchema)

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended:true })) // middleware used in order to access request body

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Creating Endpoints 
// First Endpoint
app.post('/api/users', async (req, res) => {
  // getting username from request
  console.log(req.body)

  const userObj = new User({
    username: req.body.username
  })

  try {
    const user = await userObj.save() // error prone code
    console.log(user)
    res.json(user)
  } catch (err) {
    console.log(err)
  }
  return
})

// Second Endpoint
// app.post('/api/users/:_id/exercises', (req, res) => {
//   console.log(req.body)
//   const id = req.params._id
//   const username
//   const description
//   const duration
//   const date
//   const id
//   //   Exercise Response Structure 
//     //   {
//       //   username: "fcc_test",
//       //   description: "test",
//       //   duration: 60,
//       //   date: "Mon Jan 01 1990",
//       //   _id: "5fb5853f734231456ccb3b05"
//     //   }
//   res.json({
//     username,
//     description,
//     duration,
//     date,
//     id
//   })
// })
// })

// GET /api/users/:_id/logs?[from][&to][&limit]
// app.get('api/users/:_id/logs?', (req, res) => {
//   console.log(req.body)
//   { from, to, limit } = req.query
//   res.json({
//     query: 'Query'
//   })
// })

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
