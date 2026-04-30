const express = require('express');
const User = require('../models/user');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Get all users (for assigning tasks / adding to projects)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;