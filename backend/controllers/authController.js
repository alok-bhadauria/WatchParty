// controllers/authController.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { success, error: respError } = require("../utils/responseHandler");
const { requiredFields } = require("../utils/validators");

// ---------------------------------------------
// ✅ Use environment-based config (NO config.js)
// ---------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || "changeme-supersecret-key";
const TOKEN_EXPIRY = "7d";

// Utility: Return a "safe user" object
function safeUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatar: u.avatar,
    watchName: u.watchName
  };
}

// ---------------------------------------------
// REGISTER
// ---------------------------------------------
exports.register = async (req, res) => {
  try {
    const missing = requiredFields(req.body, [
      "name",
      "email",
      "username",
      "password",
    ]);
    if (missing.length)
      return respError(
        res,
        "Missing required fields: " + missing.join(", "),
        400
      );

    const { name, email, username, password, watchName, avatar } = req.body;

    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existing)
      return respError(res, "Email or username already in use", 409);

    const user = new User({
      name,
      email,
      username,
      password,
      watchName,
      avatar,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return success(res, { user: safeUser(user), token }, 201);
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// ---------------------------------------------
// LOGIN
// ---------------------------------------------
exports.login = async (req, res) => {
  try {
    const missing = requiredFields(req.body, ["identifier", "password"]);
    if (missing.length)
      return respError(
        res,
        "Missing credentials: " + missing.join(", "),
        400
      );

    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return respError(res, "Invalid credentials", 401);

    const match = await user.comparePassword(password);
    if (!match) return respError(res, "Invalid credentials", 401);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return success(res, { user: safeUser(user), token });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// ---------------------------------------------
// GET USER
// ---------------------------------------------
exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) return respError(res, "User not found", 404);

    return success(res, { user });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// ---------------------------------------------
// UPDATE USER
// ---------------------------------------------
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    const updates = { ...req.body };
    delete updates.password; // prevent password update here
    updates.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!user) return respError(res, "User not found", 404);

    return success(res, { user: safeUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return respError(res, "Email or username already in use", 409);
    }
    return respError(res, err.message, 500);
  }
};

// ---------------------------------------------
// DELETE USER
// ---------------------------------------------
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) return respError(res, "User not found", 404);

    return success(res, {});
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

// ---------------------------------------------
// CHANGE PASSWORD (AUTH REQUIRED)
// ---------------------------------------------
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return respError(res, "Old and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return respError(res, "New password must be at least 6 characters", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) return respError(res, "User not found", 404);

    const match = await user.comparePassword(oldPassword);
    if (!match) return respError(res, "Old password is incorrect", 403);

    user.password = newPassword; // will be hashed by pre('save')
    await user.save();

    return success(res, { message: "Password updated successfully" });
  } catch (err) {
    return respError(res, err.message, 500);
  }
};

