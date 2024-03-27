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
    const post = await Post.findOne({ _id: id, published: true }).populate('comments').exec();
    if (!post) return res.status(404).json({ error: 'post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

//add comment post request
router.post('/:id/comments', async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, content } = req.body;

    // Create a new comment object
    const newComment = new Comment({
      username,
      email,
      content,
    });

    // Save the comment to the database
    const savedComment = await newComment.save();

    // Find the post by ID and update its comments array with the new comment's ObjectId
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: savedComment._id } },
      { new: true }
    );

    res.status(201).json({ message: 'Comment added successfully', comment: savedComment, updatedPost });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
