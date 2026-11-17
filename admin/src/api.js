import instance from "./utils/axiosInstance";

const requests = {
  getConfig: async () => {
    const data = await instance.get("/config");
    return data.data;
  },
  setConfig: async (config) => {
    const data = await instance.post("/config", config);
    return data.data;
  },
  sendNotification: async (notification) => {
    const data = await instance.post("/send", notification);
    return data.data;
  },
  sentNotifications: async (params = {}) => {
    const data = await instance.get("/sent", { params });
    return data.data;
  },
};

export default requests;
