import axios from "./axiosInstance";

export const getMediaState = (partyId) =>
  axios.get(`/media/party/${partyId}`);

export const updateMediaState = (data) =>
  axios.post("/media/update", data);
