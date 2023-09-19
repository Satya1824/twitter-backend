import express from "express";
import {
  registerController,
  loginController,
  testController,
  //   forgotPasswordController,
  // updateProfileController,
  // updateProfileImgController,
} from "../controllers/authController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";
// import multer from "multer";

// const upload = multer({ dest: "profiles/" });

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
// router.post("/forgot-password", forgotPasswordController);

//test routes
router.get("/test", requireSignIn, testController);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
// router.put("/profile", requireSignIn, updateProfileController);

// Route for updating the profile picture
// router.post(
//   "/update-profile-pic",
//   requireSignIn,
//   upload.single("profileImg"),
//   updateProfileImgController
// );

// router.get("/all-tweets", requireSignIn, getUserTweets);

export default router;
