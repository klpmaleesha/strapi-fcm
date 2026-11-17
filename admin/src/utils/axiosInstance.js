/**
 * axios with a custom config.
 */

import axios from "axios";
import { auth } from "@strapi/helper-plugin";
import pluginId from "../pluginId";

const instance = axios.create({
  baseURL: `${(window.strapi?.backendURL || process.env.STRAPI_ADMIN_BACKEND_URL || '').replace(/\/$/, '')}/${pluginId}`,
});

instance.interceptors.request.use(
  async (config) => {
    config.headers = {
      Authorization: `Bearer ${auth.getToken()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // whatever you want to do with the error
    if (error.response?.status === 401) {
      auth.clearAppStorage();
      window.location.reload();
    }

    throw error;
  }
);

export default instance;
