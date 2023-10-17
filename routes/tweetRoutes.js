import express from "express";
import {
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
  likeTweetController,
  dislikeTweetController,
  createReplyController,
  getRepliesByTweetId,
  retweetController,
  getRetweetController,
} from "../controllers/tweetController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

import multer from "multer";

const upload = multer({ dest: "uploads/" });

// router object
const router = express.Router();

// routes
// Create a new tweet
router.post(
  "/create-tweet",
  requireSignIn,
  upload.single("image"),
  createTweet
);

// Get all tweets
router.get("/get-tweets", getAllTweets);

// Get a single tweet by ID
router.get("/get-tweet/:id", getTweetById);

// Delete a tweet by ID (requires authentication)
router.delete("/delete-tweet/:id", requireSignIn, deleteTweet);

// like a tweet
router.post("/like/:id", requireSignIn, likeTweetController);

// dislike a tweet
router.post("/dislike/:id", requireSignIn, dislikeTweetController);

// reply to a tweet
router.post("/reply/:id", requireSignIn, upload.none(), createReplyController);

// get tweet replies
router.get("/tweet-replies/:id", requireSignIn, getRepliesByTweetId);

// retweet a tweet
router.post("/retweet/:id", requireSignIn, retweetController);

// get retweet
router.get("/get-retweet/:id", getRetweetController);

export default router;
