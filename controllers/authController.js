import userModel from "../models/userModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    //validations
    if (!name) {
      return res.send({ error: "Name is required!" });
    }
    if (!email) {
      return res.send({ message: "Email is required!" });
    }
    if (!username) {
      return res.send({ message: "Username is required!" });
    }
    if (!password) {
      return res.send({ message: "Password is required!" });
    }

    if (password && password.length < 6) {
      return res.json({
        success: false,
        message: "The password should contain atleast six characters!",
      });
    }

    // Check if a user with the same email or username exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    // If an existing user is found, return an error
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User with the same email or username already exists!",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      username,
      password: hashedPassword,
    }).save();

    res.status(201).send({
      success: true,
      message: "User registered!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registeration!",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    //validation
    if (!username || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid username or password!",
      });
    }

    //check user
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User doesn't exist!",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password!",
      });
    }

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Logged in successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profileImg: user.profileImg,
        dob: user.dob,
        location: user.location,
        createdAt: user.createdAt,
        followers: user.followers,
        following: user.following,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login!",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected routes!");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "profiles/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const fileExtension = path.extname(file.originalname);
//     cb(null, uniqueSuffix + fileExtension);
//   },
// });

// const upload = multer({ storage });

// export const updateProfileImgController = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const profileImg = req.file;

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

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, username, password, location, dob } = req.body;
    const user = await userModel.findById(req.user._id);
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        location: location || user.location,
        dob: dob || user.dob,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile updated successfully!",
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
