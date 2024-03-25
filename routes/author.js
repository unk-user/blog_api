const express = require('express');
const Post = require('../models/post.model');
const Author = require('../models/author.model');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

dotenv.config();
const secretKey = process.env.KEY_SECRET;

//setup jwt verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.authorId = decoded.authorId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

//get posts by authenticated author
router.get('/posts', verifyToken, async (req, res, next) => {
  try {
    const authorId = req.authorId;
    const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 });
    res.json({
      posts: posts,
    });
  } catch (error) {
    next(err);
  }
});

//upload new posts
router.post('/posts', verifyToken, async (req, res, next) => {
  const { title, content, published } = req.body;
  const comments = [];
  try {
    const authorId = req.authorId;

    const newPost = new Post({
      title,
      content,
      comments,
      author: authorId,
      published: published || false,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
});

//routes for specific post
//get post by specified id
router.get('/posts/:id', verifyToken, async (req, res, next) => {
  try {
    const id = req.params.id;
    const authorId = req.authorId;
    const post = await Post.findOne({ _id: id, author: authorId });
    if (!post) return res.status(404).json({ error: 'post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

//update changed post fields
router.patch('/posts/:id', verifyToken, async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }

    const { title, content, published } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.published = published || post.published;
    post.updatedAt = Date.now();

    const savedPost = await post.save();
    res.json(savedPost);
  } catch (error) {
    next(error);
  }
});

//authentication routes

//signin route
router.post('/signin', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAuthor = new Author({ username, email, password: hashedPassword });
    const savedAuthor = await newAuthor.save();

    res.status(201).json({ author: savedAuthor });
  } catch (error) {
    //TODO: better way to handle errors
    //Add redirection

    if (error.name === 'ValidationError') {
      // Handle validation errors
      const errors = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ errors });
    } else {
      // Handle other errors
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

//login route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const author = await Author.findOne({ email });

    if (!author || !(await bcrypt.compare(password, author.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ authorId: author._id }, secretKey, {
      expiresIn: '12h',
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
