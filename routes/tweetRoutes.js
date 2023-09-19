import express from "express";
import {
  createTweet,
  getAllTweets,
  getTweetById,
  // updateTweet,
  deleteTweet,
  likeTweetController,
  dislikeTweetController,
  createReplyController,
  getRepliesByTweetId,
  retweetController,
  getRetweetController,
  // getUserTweets,
} from "../controllers/tweetController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Create a new tweet (requires authentication)
router.post(
  "/create-tweet",
  requireSignIn, // Middleware for authentication
  upload.single("image"), // Handle image upload
  createTweet
);

// router.get("/tweets", getUserTweets);

// Get all tweets
router.get("/get-tweets", getAllTweets);

// Get a single tweet by ID
router.get("/get-tweet/:id", getTweetById);

// // Update a tweet by ID (requires authentication)
// router.put("/update-tweet/:id", requireSignIn, updateTweet);

// Delete a tweet by ID (requires authentication)
router.delete("/delete-tweet/:id", requireSignIn, deleteTweet);

router.post("/like/:id", requireSignIn, likeTweetController);

router.post("/dislike/:id", requireSignIn, dislikeTweetController);

router.post("/reply/:id", requireSignIn, upload.none(), createReplyController);

router.get("/tweet-replies/:id", requireSignIn, getRepliesByTweetId);

router.post("/retweet/:id", requireSignIn, retweetController);

router.get("/get-retweet/:id", getRetweetController);

export default router;
