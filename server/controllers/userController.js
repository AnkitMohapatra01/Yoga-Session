import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// | Code | Meaning               | When to Use Example                             |
// | ---- | --------------------- | ----------------------------------------------- |
// | 200  | OK                    | Data fetched successfully                       |
// | 201  | Created               | User registered, item created                   |
// | 204  | No Content            | Successfully deleted                            |
// | 400  | Bad Request           | Missing fields, invalid input                   |
// | 401  | Unauthorized          | Invalid or missing token                        |
// | 403  | Forbidden             | No permission to access resource                |
// | 404  | Not Found             | Resource doesn’t exist                          |
// | 409  | Conflict              | Duplicate entry (e.g., email already exists)    |
// | 500  | Internal Server Error | Server crashed, or unhandled exception occurred |

const isProduction = process.env.NODE_ENV === "production";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//? Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please Provide All Credentials",
      });
    }
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "User already Exist" });
    }
    if (password.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Password should be minimum of 5 characters",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS access
      secure: isProduction, // Set true in prod for HTTPS
      sameSite: isProduction ? "Strict" : "Lax", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//? Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide all credentials" });
    }
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS access
      secure: isProduction, // Set true in prod for HTTPS
      sameSite: isProduction ? "Strict" : "Lax", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(201).json({
      success: true,
      message: "LoggedIn Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
//?Logout Functionality
export const Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction, // Set to true in production (HTTPS)
      sameSite: isProduction ? "None" : "Lax", // Important for cross-origin cookies
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};