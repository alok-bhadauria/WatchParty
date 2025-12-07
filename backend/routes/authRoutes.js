const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// -----------------------
// PUBLIC ROUTES
// -----------------------
router.post("/register", auth.register);
router.post("/login", auth.login);

// -----------------------
// AUTHENTICATED ROUTES
// -----------------------
router.get("/me", authMiddleware, (req, res) => {
  req.params.id = req.user.id;
  return auth.getUser(req, res);
});

router.put("/me", authMiddleware, (req, res) => {
  req.params.id = req.user.id;
  return auth.updateUser(req, res);
});

router.delete("/me", authMiddleware, (req, res) => {
  req.params.id = req.user.id;
  return auth.deleteUser(req, res);
});

// -----------------------
// CHANGE PASSWORD
// -----------------------
router.put("/change-password", authMiddleware, auth.changePassword);

module.exports = router;
