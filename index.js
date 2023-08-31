const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true})) // in order to access request body

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Creating Endpoints 
// First Endpoint
app.post('api/users', (req, res) => {
  
})

// Second Endpoint
app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body)
  const id = req.params._id
  const username
  const description
  const duration
  const date
  const id
  //   Exercise Response Structure 
    //   {
      //   username: "fcc_test",
      //   description: "test",
      //   duration: 60,
      //   date: "Mon Jan 01 1990",
      //   _id: "5fb5853f734231456ccb3b05"
    //   }
  res.json({
    username,
    description,
    duration,
    date,
    id
  })
})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
