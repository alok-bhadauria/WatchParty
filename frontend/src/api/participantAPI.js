import axios from "./axiosInstance";

export const joinParticipant = (data) =>
  axios.post("/participants/join", data);

export const leaveParticipant = (id) =>
  axios.delete(`/participants/${id}`);

// ✅ match backend route: GET /participants/list/:partyId
export const listParticipants = (partyId) =>
  axios.get(`/participants/list/${partyId}`);

export const updateParticipant = (id, data) =>
  axios.put(`/participants/${id}`, data);
