import Tweet from "../models/tweetModel.js";
import Users from "../models/userModel.js";
import multer from "multer";
import path from "path";

// Define the storage engine and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

// Create the multer middleware
const upload = multer({ storage: storage });

// Create a new tweet
// export const createTweet = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const user = req.user;

//     const tweet = new Tweet({
//       text,
//       user,
//     });

//     // Check if there's an uploaded image
//     if (req.file) {
//       tweet.image = req.file.path; // Store the image path in the Tweet model
//     }

//     await tweet.save();

//     res.status(201).json({
//       success: true,
//       message: "Tweet posted!",
//       tweet,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error in posting tweet!",
//       error: error.message,
//     });
//   }
// };

// Create a new tweet
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

    console.log("isReply:", tweet.isReply);

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

// // Get all tweets
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

    // const tweets = await Tweet.find().populate("user").sort({ createdAt: -1 });

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

// export const getAllTweets = async (req, res) => {
//   try {
//     const userId = req.user._id; // Assuming you have access to the user ID
//     const tweets = await Tweet.find().populate("user").sort({ createdAt: -1 });

//     // For each tweet, check if the user has liked it and add a 'liked' property
//     const tweetsWithLikedStatus = tweets.map((tweet) => ({
//       ...tweet,
//       liked: tweet.likes.includes(userId),
//     }));

//     res.status(200).json({
//       success: true,
//       tweets: tweetsWithLikedStatus,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error in retrieving tweets!",
//       error: error.message,
//     });
//   }
// };

// // Get all tweets for the logged-in user
// export const getUserTweets = async (req, res) => {
//   try {
//     const user = req.user;
//     const tweets = await Tweet.find({ user })
//       .populate("user")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       tweets,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error in retrieving user tweets!",
//       error: error.message,
//     });
//   }
// };

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

// // Update a tweet by ID
// export const updateTweet = async (req, res) => {
//   try {
//     const tweetId = req.params.id;
//     const { text } = req.body;
//     const tweet = await Tweet.findByIdAndUpdate(
//       tweetId,
//       { text },
//       { new: true }
//     );

//     if (!tweet) {
//       return res.status(404).json({
//         success: false,
//         message: "Tweet not found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Tweet updated!",
//       tweet,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating the tweet!",
//       error: error.message,
//     });
//   }
// };

// Delete a tweet by ID
// export const deleteTweet = async (req, res) => {
//   try {
//     const tweetId = req.params.id;
//     const tweet = await Tweet.findByIdAndDelete(tweetId);

//     if (!tweet) {
//       return res.status(404).json({
//         success: false,
//         message: "Tweet not found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Tweet deleted!",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error in deleting tweet!",
//       error: error.message,
//     });
//   }
// };

export const deleteTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;

    // Use findByIdAndDelete to find and delete the tweet
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

    // Find the tweet by its ID
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

    // Add the user's ID to the likes array
    tweet.likes.push(userId);

    // Save the tweet document to update the likes
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

    // Find the tweet by its ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found!",
      });
    }

    // Remove the user's ID from the likes array
    tweet.likes.pull(userId); // Use the "pull" method to remove the user's ID

    // Save the tweet document to update the likes
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

// replies
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

export const getRepliesByTweetId = async (req, res) => {
  try {
    const tweetId = req.params.id;

    // Find the tweet by its ID
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

    // Extract and return the replies
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

    // Add the user's ID to the retweets array
    tweet.retweets.push(userId);
    await tweet.save();

    // Get the last user who retweeted (assuming you have a `username` field in your User model)
    // const lastRetweetUserId = tweet.retweets[tweet.retweets.length - 1];
    // const lastRetweetUser = await Users.findById(lastRetweetUserId);

    res.status(200).json({
      success: true,
      message: "Tweet retweeted!",
      // lastRetweetUsername: lastRetweetUser.username,
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
    const lastRetweetUserId = tweet.retweets[tweet.retweets.length - 1]; // Assuming the latest retweet is at the first position

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

    const lastRetweeterUsername = lastRetweeterUser.username; // Assuming the username field exists in your user schema

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
