import axios from "./axiosInstance";

export const createFeedback = (data) =>
  axios.post("/feedback", data);

export const getFeedback = () =>
  axios.get("/feedback");

export const deleteFeedback = (id) =>
  axios.delete(`/feedback/${id}`);
