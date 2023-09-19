import userModel from "../models/userModel.js";
import tweetModel from "../models/tweetModel.js";
import multer from "multer";
import path from "path";

// export const getVisitedUserProfileController = async (req, res) => {
//   try {
//     // Extract the visited user's ID or username from the request params
//     const { userId } = req.params;

//     // Find the user based on the provided ID or username
//     const visitedUser = await userModel.findOne({ _id: userId });

//     if (!visitedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Visited user not found!",
//       });
//     }
//     console.log("Received userId:", userId);

//     // Return the visited user's profile data
//     res.status(200).json({
//       success: true,
//       user: visitedUser,
//     });
//   } catch (error) {
//     console.error("Error fetching visited user profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching visited user profile",
//       error: error.message,
//     });
//   }
// };

// Define the route handler for getting a single user detail
// app.get('/api/user/:id', async (req, res) => {

// export const getSingleUserController = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid userId" });
//     }

//     const user = await userModel
//       .findById(userId)
//       .populate("followers", "name") // Customize fields to populate
//       .populate("following", "name"); // Customize fields to populate

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

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

// Define the route handler for following a user
// app.post('/api/user/:id/follow', async (req, res) => {

export const followUserController = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have authentication middleware
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

// Define the route handler for editing user details
// app.put('/api/user/:id', async (req, res) => {
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
    const userId = req.params.id; // Get the user ID from the authentication data
    const tweets = await tweetModel
      .find({ user: userId, isReply: false }) // Filter tweets by the user's ID
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

// export const updateProfileImgController = async (req, res) => {
//   try {
//     const userId = req.params._id;
//     const profileImg = req.file.path;

//     if (!profileImg) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No image uploaded!" });
//     }

//     // Update the user's profile picture URL in the database
//     const updatedUser = await userModel.findByIdAndUpdate(
//       userId,
//       { profileImg: profileImg.path },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found!" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile picture updated!",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Error updating profile picture!" });
//   }
// };

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
