import userModel from "../models/userModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

//register user controller
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

//login controller
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    //validations
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
