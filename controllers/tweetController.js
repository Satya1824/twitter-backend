import Tweet from "../models/tweetModel.js";
import Users from "../models/userModel.js";
import multer from "multer";
import path from "path";

// Define the storage engine and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

// Create the multer middleware
const upload = multer({ storage: storage });

// Create tweet controller
export const createTweet = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required for creating a tweet.",
      });
    }

    const tweet = new Tweet({
      text,
      user: userId,
    });

    // Check if there's an uploaded image
    if (req.file) {
      tweet.image = req.file.path;
    }

    await tweet.save();

    // console.log("isReply:", tweet.isReply);

    res.status(201).json({
      success: true,
      message: "Tweet posted!",
      tweet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in posting tweet!",
      error: error.message,
    });
  }
};

// // Get all tweets controller
export const getAllTweets = async (req, res) => {
  try {
    const excludeReplies = req.query.excludeReplies === "true";

    let tweets;

    if (excludeReplies) {
      tweets = await Tweet.find({ isReply: false })
        .populate("user")
        .sort({ createdAt: -1 });
    } else {
      tweets = await Tweet.find().populate("user").sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      tweets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving tweets!",
      error: error.message,
    });
  }
};

// Get a single tweet by ID
export const getTweetById = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    res.status(200).json({
      success: true,
      tweet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving the tweet!",
      error: error.message,
    });
  }
};

//delete tweet controller

export const deleteTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    // Check if the deleted tweet is a reply
    if (deletedTweet.isReply === true) {
      // If it was a reply, find its parent tweet
      const parentTweet = await Tweet.findById(deletedTweet.replyTo);

      if (parentTweet) {
        // Remove the reply's ID from the parent tweet's replies array
        parentTweet.replies.pull(tweetId);
        await parentTweet.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Tweet deleted!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in deleting tweet!",
      error: error.message,
    });
  }
};

// Controller for liking a tweet
export const likeTweetController = async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.id;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    // Check if the user has already liked the tweet
    if (tweet.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this tweet!",
      });
    }

    tweet.likes.push(userId);
    await tweet.save();

    res.status(200).json({
      success: true,
      message: "Tweet liked!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in liking tweet!",
      error: error.message,
    });
  }
};

// Controller for disliking a tweet
export const dislikeTweetController = async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.id;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    tweet.likes.pull(userId);
    await tweet.save();

    res.status(200).json({
      success: true,
      message: "Tweet disliked!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in disliking tweet!",
      error: error.message,
    });
  }
};

// replies controller
export const createReplyController = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required for creating a reply.",
      });
    }

    const reply = new Tweet({
      text,
      user: userId,
      isReply: true,
      replyTo: tweetId,
    });

    await reply.save();
    const parentTweet = await Tweet.findById(tweetId);

    if (!parentTweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    parentTweet.replies.push(reply._id);

    await parentTweet.save();

    res.status(201).json({
      success: true,
      message: "Reply added successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding reply!",
      error: error.message,
    });
  }
};

// get replies controller

export const getRepliesByTweetId = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const tweet = await Tweet.findById(tweetId).populate({
      path: "replies",
      options: { sort: { createdAt: -1 } },
    });

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    const replies = tweet.replies;

    res.status(200).json({
      success: true,
      replies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving tweet replies!",
      error: error.message,
    });
  }
};

export const retweetController = async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.id;

    // Find the user who is performing the retweet
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    // Check if the user has already retweeted the tweet
    if (tweet.retweets.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User has already retweeted this tweet!",
      });
    }

    // Add the user's ID to the retweets array
    tweet.retweets.push(userId);
    await tweet.save();

    res.status(200).json({
      success: true,
      message: "Tweet retweeted!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retweeting!",
    });
  }
};

// Get the last user who retweeted a tweet by its ID along with their username
export const getRetweetController = async (req, res) => {
  try {
    const tweetId = req.params.id;

    // Find the tweet by its ID
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    // Extract and return the user ID of the last retweeter
    const lastRetweetUserId = tweet.retweets[tweet.retweets.length - 1];

    if (!lastRetweetUserId) {
      return res.status(404).json({
        success: false,
        message: "No retweets found for the tweet!",
      });
    }

    // Retrieve the user's username based on their ID
    const lastRetweeterUser = await Users.findById(lastRetweetUserId);

    if (!lastRetweeterUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const lastRetweeterUsername = lastRetweeterUser.username;

    res.status(200).json({
      success: true,
      lastRetweeterUsername,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving the last retweeter's username!",
      error: error.message,
    });
  }
};
