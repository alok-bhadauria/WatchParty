import axios from "./axiosInstance";

// Register
export const registerUser = (data) =>
  axios.post("/auth/register", data);

// Login
export const loginUser = (data) =>
  axios.post("/auth/login", data);

export const changePassword = (data) =>
  axios.put("/auth/change-password", data);
/**
 * NOTE:
 * Backend authRoutes only exposes:
 *  - GET  /auth/me
 *  - PUT  /auth/me
 *  - DELETE /auth/me
 *
 * We keep the old function names/signatures (getUser, updateUser, deleteUser)
 * but internally they call /auth/me and IGNORE the id param.
 */

// Get current logged-in user
export const getUser = () =>
  axios.get("/auth/me");

// Update current user profile
export const updateUser = (_id, data) =>
  axios.put("/auth/me", data);

// Delete current user
export const deleteUser = () =>
  axios.delete("/auth/me");
