const express = require('express');
const Post = require('../models/post.model');

const router = express.Router();

//get recently published posts
router.get('/', async(req, res, next) => {
  const posts = await Post.find({published: true}).sort({ createdAt: -1 }).limit(5);
  res.json({
    posts: posts,
  })
});

module.exports = router;