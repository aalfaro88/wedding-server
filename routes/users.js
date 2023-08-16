// routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const isAuthenticated = require('../middleware/isAuthenticated');


router.get('/:userId', isAuthenticated,  async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const userProfile = {
      _id: user._id,
      email: user.email,
      username: user.username,
      randomize_tokens: user.randomize_tokens,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/:userId/update-tokens', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { randomize_tokens } = req.body;

    console.log('Received request to update tokens for userId:', userId);
    console.log('Received randomize_tokens value:', randomize_tokens);

    if (!randomize_tokens) {
      return res.status(400).json({ message: 'Randomize tokens value is required' });
    }

    const user = await User.findByIdAndUpdate(userId, { randomize_tokens }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User after updating tokens:', user);

    res.json({ message: 'Randomize tokens updated successfully', randomize_tokens: user.randomize_tokens });
  } catch (error) {
    console.error('Error updating randomize tokens:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
