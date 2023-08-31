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

app.get('/api/users', async (req, res) => {
  
})

// Creating Endpoints 
// First Endpoint
app.post('/api/users', async (req, res) => {
  // getting username from request
  console.log(req.body)

  const userObj = new User({
    username: req.body.username
  })

  try {
    const user = await userObj.save() // error prone code and timing oriented
    console.log(user)
    res.json(user)
  } catch (err) {
    console.log(err)
  }
  return
})

// Second Endpoint
app.post('/api/users/:_id/exercises', async (req, res) => {
  console.log(req.body)

  const id = req.params._id
  const { description, duration, date } = req.body

  try {
    const user_id = await User.findById(id) // error prone code

    if(!user) {
      res.send("Could not find user")
    } else {
      const exerciseObj = new Exercise({
        user_id: user_id,
        description,
        duration,
        date: date? new Date(date): new Date() // if there is a date, we have to add that date as a new date and pass in that date, otherwise if there isn't we save is using the current day's date
      })
    }
      const exercise = await exerciseObj.save() // timely

      res.json({
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString,
        _id: user_id      
      })
    } catch (err) {
    console.log(err)
    res.send("Error saving the exercise")
    }
  })

// GET /api/users/:_id/logs?[from][&to][&limit]
app.get('api/users/:_id/logs?', async (req, res) => {
  console.log(req.body)
  const { from, to, limit } = req.query
  const id = req.params.id
  const user = await User.findById(id)

  if (!user) {
    res.send("Couldn't find user")
    return
  }

  let dateObj = {}

  if (from) {
    dateObj['$gte'] = new Date(from)
  }

  if (to) {
    date['$lte'] = new Date(to)
  }

  let filter = {
    user_id: id
  }

  if (from || to ) {
    filter.date = dateObj
  }

  const exercises = await Exercise.find(filter).limit(parseInt(limit) ?? 500)

  const log = exercises.map(e => ({
    description: e.description, 
    duration: e.duration,
    date: e.date.toDateString()
  }))
  
  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
