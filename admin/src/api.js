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
};

export default requests;
