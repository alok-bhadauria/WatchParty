import axios from "./axiosInstance";

// Get ALL active parties (public + private)
// Backend listParties already filters by "fresh + active" logic.
export const getPublicParties = () =>
  axios.get("/parties");

export const getParty = (id) =>
  axios.get(`/parties/${id}`);

export const createParty = (data) =>
  axios.post("/parties", data);

export const updateParty = (id, data) =>
  axios.put(`/parties/${id}`, data);

export const deleteParty = (id) =>
  axios.delete(`/parties/${id}`);

// Verify private party password
export const verifyPartyPassword = (data) =>
  axios.post("/parties/verify-password", data);
