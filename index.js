const express = require('express'); // Import the Express framework
const app = express(); // Create an instance of the Express application
const cors = require('cors'); // Import CORS middleware
require('dotenv').config(); // Load environment variables from .env file

const mongoose = require('mongoose'); // Import Mongoose library for MongoDB
const { Schema } = mongoose; // Destructure Schema from Mongoose

mongoose.connect(process.env.DB_URL); // Connect to the MongoDB database using the provided URL

const UserSchema = new Schema({
  username: String // Define a user schema with a 'username' field
});

const User = mongoose.model('User', UserSchema); // Create a User model based on the UserSchema

const ExerciseSchema = new Schema({
  user_id: { type: String, required: true }, // Define an exercise schema with 'user_id', 'description', 'duration', and 'date' fields
  description: String,
  duration: Number,
  date: Date
});

const Exercise = mongoose.model('Exercise', ExerciseSchema); // Create an Exercise model based on the ExerciseSchema

app.use(cors()); // Use CORS middleware to enable cross-origin resource sharing
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json()); // Parse incoming JSON data in requests
app.use(express.urlencoded({ extended: true })); // Parse incoming URL-encoded data in requests

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html'); // Serve the index.html file
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({}).select('_id username'); // Retrieve all users from the database, selecting only '_id' and 'username'

  if (!users) {
    res.send("No users"); // If no users are found, send a response indicating so
  } else {
    res.json(users); // Send the retrieved users as a JSON response
  }
});

// Define endpoints

app.post('/api/users', async (req, res) => {
  console.log(req.body); // Log the request body (should contain a 'username')

  const userObj = new User({
    username: req.body.username // Create a new User instance with the provided 'username'
  });

  try {
    const user = await userObj.save(); // Save the new user to the database
    console.log(user);
    res.json(user); // Send the saved user as a JSON response
  } catch (err) {
    console.log(err); // Log any errors that occur during the save process
  }
  return;
});

// Define another endpoint for adding exercises

app.post('/api/users/:_id/exercises', async (req, res) => {
  console.log(req.body); // Log the request body (should contain 'description', 'duration', and 'date')

  const id = req.params._id; // Extract the user ID from the request parameters
  const { description, duration, date } = req.body; // Destructure the exercise details from the request body

  try {
    const user = await User.findById(id); // Find the user with the provided ID

    if (!user) {
      res.send("Could not find user"); // If user not found, send an appropriate response
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date() // Create a new Exercise instance with the provided details, including the current date if 'date' is not provided
      });

      const exercise = await exerciseObj.save(); // Save the new exercise to the database
      res.json({
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString(),
        _id: user._id
      }); // Send a JSON response with exercise details and user information
    }

  } catch (err) {
    console.log(err);
    res.send("Error saving the exercise"); // If an error occurs during the process, send an error response
  }
});

// Define an endpoint for retrieving user exercise logs

app.get('/api/users/:_id/logs?', async (req, res) => {
  console.log(req.body); // Log the request body (which might not be used in this route)
  const { from, to, limit } = req.query; // Extract query parameters 'from', 'to', and 'limit'
  const id = req.params._id; // Extract the user ID from the request parameters
  const user = await User.findById(id); // Find the user with the provided ID

  if (!user) {
    res.send("Couldn't find user"); // If user not found, send an appropriate response
    return;
  }

  let dateObj = {};

  if (from) {
    dateObj['$gte'] = new Date(from); // If 'from' date provided, construct a date query object with '$gte' operator
  }

  if (to) {
    dateObj['$lte'] = new Date(to); // If 'to' date provided, construct a date query object with '$lte' operator
  }

  let filter = {
    user_id: id // Filter object to match exercises with the user's ID
  };

  if (from || to) {
    filter.date = dateObj; // If 'from' or 'to' date provided, add the 'dateObj' to the filter
  }

  const exercises = await Exercise.find(filter).limit(parseInt(limit) ?? 500); // Retrieve exercises matching the filter, with an optional limit

  const log = exercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  })); // Create an array of exercise logs with relevant details

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log
  }); // Send a JSON response with user information and exercise logs
});

// Start the server

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port); // Start the server and log the listening port
});