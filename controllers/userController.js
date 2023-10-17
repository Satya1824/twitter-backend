import userModel from "../models/userModel.js";
import tweetModel from "../models/tweetModel.js";
import multer from "multer";
import path from "path";

// Get a single user by ID
export const getSingleUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving the user!",
      error: error.message,
    });
  }
};

// follow user controller
export const followUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    const userToFollowId = req.params.id;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { following: userToFollowId } },
      { new: true }
    );

    const userToFollow = await userModel.findByIdAndUpdate(
      userToFollowId,
      { $addToSet: { followers: userId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User followed!",
      user,
      userToFollow,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in following!",
      error: error.message,
    });
  }
};

//unfollow user controller
export const unFollowUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    const userToUnfollowId = req.params.id;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { following: userToUnfollowId } },
      { new: true }
    );

    const userToUnfollow = await userModel.findByIdAndUpdate(
      userToUnfollowId,
      { $pull: { followers: userId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User unfollowed!",
      user,
      userToUnfollow,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in unfollowing!",
      error: error.message,
    });
  }
};

// edit user handler
export const editUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, dob, location } = req.body;

    // Validate the input data here

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, dob, location },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile updated!",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while updating profile!",
      error,
    });
  }
};

// get user tweets
export const getUserTweets = async (req, res) => {
  try {
    const userId = req.params.id;
    const tweets = await tweetModel
      .find({ user: userId })
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tweets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving user tweets!",
      error: error.message,
    });
  }
};

//profile img
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage });

export const updateProfileImgController = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileImg = req.file.path;

    if (!profileImg) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded!",
      });
    }

    // Update the user's profile picture URL in the database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profileImg: profileImg },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated!",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile picture!",
    });
  }
};
