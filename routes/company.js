const express = require("express");
const router= express.Router();
const path = require('path');
const User = require("../models/user.js"); 

router.get('/home', async (req, res) => {
   try {
      // Fetch user data (assuming logged-in user details are available)
      const Influencers = await User.find(); // req.user should have logged-in user details
      console.log(Influencers)
      if (!Influencers) {
        return res.status(404).send('User not found');
      }
  
      // Render the homepage EJS template
      res.render('company/home', {Influencers});
    } catch (error) {
      res.status(500).send(error);
    }
  });

module.exports=router;