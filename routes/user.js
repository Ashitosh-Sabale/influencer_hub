const express = require("express");
const router= express.Router();
const path = require('path');
const {auth,oauth2Client}=require("../functions/youtubeAuth");
const {videos,channelInfo}=require("../functions/youtubedata");
var channelId="";
const User = require("../models/user.js"); 
const {findMostPopularContent,calculateEngagementRate}=require("../functions/analytics.js")
const multer = require('multer');





// ____________________________________________________________________________________
// store image in public image folder

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/images')); // Save in public/images folder
  },
  filename: (req, file, cb) => {
      // Set the file name
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid name clashes
  }
});

const upload = multer({ storage: storage });
// __________________________________________________________________________________



router.get('/home', async (req, res) => {
  console.log(req.user.username)
  try {
    // Fetch user data (assuming logged-in user details are available)
    const user = await User.findByUsername( req.user.username); // req.user should have logged-in user details
    console.log(user)
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Render the homepage EJS template
    res.render('influencer/Home', {
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});


router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByUsername(req.user.username);
    const profileComplete = user.bio && user.profilePic ;
    res.locals.profilPic=user.profilPic;
    res.render('influencer/profile', {
      user,
      profileComplete
    });
  } catch (error) {
    res.status(500).send('Error loading profile update page');
  }
});

// Route to handle profile update
router.post('/profile',upload.single('profilePic'),async (req, res) => {

  
  try {
    const { bio, instagram, facebook, youtube } = req.body;
    const profilePic = req.file ? req.file.filename : req.user.profilPic; 
    console.log(profilePic);
    await User.findOneAndUpdate({ username: req.user.username }, {
      bio,
      profilePic,
      'socialMedia.instagram': instagram,
      'socialMedia.facebook': facebook,
      'socialMedia.youtube': youtube
    });

    res.redirect('/user/profile');
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});




// Generate a URL for the user to grant permissions
router.get('/auth', (req, res) => {
    const url=auth();
    res.redirect(url);
  });
  
  // The callback URL that handles the OAuth 2.0 response
router.get('/oauth2callback', async (req, res) => {
    const { code } = req.query; // Get the authorization code from the query string
    try {
      const { tokens } = await oauth2Client.getToken(code); // Get the OAuth tokens using the code
      oauth2Client.setCredentials(tokens); // Set the credentials
      res.redirect('/user/channel');
    } catch (error) {
      console.error('Error during authentication:', error);
      res.send('Error during authentication.');
    }
  });
  
  // Fetch channel data after user authenticates
router.get('/channel', async (req, res) => {
      
      try {
        // Make sure oauth2Client is authenticated
        if (!oauth2Client) {
            return res.redirect('/auth/google');  // Redirect to login if not authenticated
        }
         
        let channel=await channelInfo(oauth2Client);
        let videosList = await videos(oauth2Client);
  
        if(!channel){
          res.send("No Channel found");
        }
        
        const mostPopularContent= await findMostPopularContent(videosList);
        console.log(`mostPopular: ${mostPopularContent}`)
        res.render('influencer/youtube', { videosList,channel,mostPopularContent });  // Pass videosList to the 'videos' view
  
    } catch (error) {
        console.error('Error retrieving videos:', error.message);
        res.status(500).send('An error occurred while fetching videos.');
    }
  });


  router.get('/profile/:username', async (req, res) => {
      try {
        const user = await Influencer.findOne({ email: req.params.username });
    
        if (!user) {
          return res.status(404).send('User not found');
        }
    
        // Render the EJS template and pass user data to the view
        res.render('profile', {
          username: user.name,
          bio: user.bio,
          profilePic: user.profilePic,
          socialMedia: user.socialMedia,
          engagementRate: user.engagements,
          growthRate: user.analytics.growthRate
        });
      } catch (error) {
        res.status(500).send('Error fetching user profile');
      }
    });

module.exports= router;