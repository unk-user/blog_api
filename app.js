const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const secretKey = process.env.KEY_SECRET;
const PORT = process.env.PORT;

//require routes
const homeRoute = require('./routes/home');
const postsRoute = require('./routes/posts');
const authorRoute = require('./routes/author');

// loading environment variables
dotenv.config();
// connecting to database
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

const app = express();

// setting middleware functions
app.use(express.json());
app.use('/', homeRoute);
app.use('/posts', postsRoute);
app.use('/author', authorRoute);

//starting server
app.listen(PORT, () => {
  console.log('server started on port 3000');
});
