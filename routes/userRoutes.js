import express from "express";
import {
  editUserController,
  followUserController,
  getSingleUserController,
  getUserTweets,
  unFollowUserController,
  updateProfileImgController,
} from "../controllers/userController.js";

import multer from "multer";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const upload = multer({ dest: "profiles/" });

//router object
const router = express.Router();

// single user
router.get("/:id", getSingleUserController);

//follow user
router.post("/:id/follow", requireSignIn, followUserController);

//unfollow user
router.post("/:id/unfollow", requireSignIn, unFollowUserController);

//edit user
router.put("/:id", requireSignIn, editUserController);

//user tweets
router.get("/:id/tweets", requireSignIn, getUserTweets);

//profile image
router.post(
  "/:id/uploadProfilePic",
  upload.single("profileImg"),
  requireSignIn,
  updateProfileImgController
);
export default router;
