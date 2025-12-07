import axios from "./axiosInstance";

export const sendMessage = (data) =>
  axios.post("/messages", data);

export const getMessages = (partyId) =>
  axios.get(`/messages/party/${partyId}`);

export const deleteMessage = (id) =>
  axios.delete(`/messages/${id}`);
