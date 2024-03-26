const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require(cors);

// loading environment variables
dotenv.config();

const secretKey = process.env.KEY_SECRET;
const PORT = process.env.PORT;

//require routes
const homeRoute = require('./routes/home');
const postsRoute = require('./routes/posts');
const authorRoute = require('./routes/author');

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
app.use(cors());
app.use(express.json());
app.use('/', homeRoute);
app.use('/posts', postsRoute);
app.use('/author', authorRoute);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//starting server
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
