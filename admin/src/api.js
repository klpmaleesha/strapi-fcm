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
  sentNotifications: async () => {
    const data = await instance.get("/sent");
    return data.data;
  },
  findConfig: async () => {
    const data = await instance.get("/sdk");
    return data.data;
  },
};

export default requests;
