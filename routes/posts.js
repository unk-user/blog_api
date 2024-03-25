const express = require('express');
const Post = require('../models/post.model');
const Author = require('../models/author.model');
const router = express.Router();

//get all published posts sorted by date
router.get('/', async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const filter = req.query.filter === 'oldest' ? 1 : -1;

    const posts = await Post.find({ published: true })
      .sort({ createdAt: filter })
      .limit(limit);
    res.json({
      posts: posts,
    });
  } catch (error) {
    next(err);
  }
});

//get published post by specified id
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findOne({ _id: id, published: true });
    if (!post) return res.status(404).json({ error: 'post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
