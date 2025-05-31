const express = require('express');
const router = express.Router();

// GET /api/blog - List blog posts
router.get('/', (req, res) => {
  // TODO: Fetch blog posts
  res.json({ message: 'Blog list endpoint (to be implemented)' });
});

// POST /api/blog - Create blog post (admin only)
router.post('/', (req, res) => {
  // TODO: Create new blog post
  res.json({ message: 'Create blog post endpoint (to be implemented)' });
});

module.exports = router;
