import { message } from "antd";
import axios, { AxiosResponse } from "axios";

const network = axios.create({
  baseURL: "",
});

export class NetworkError extends Error {
  response: AxiosResponse<any, any>;
  constructor(_response: AxiosResponse<any, any>) {
    super();
    this.response = _response;
  }
}

export const request = async (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any
) => {
  const response = await network.request({ method, url, data }).catch((err) => {
    /**
     * @note token expired 表明token已过期，需要跳转到登录界面
     */
    if ((err.response?.data as any).message === "Token Expired") {
      message.error("登录token已超时，请点击刷新后重新登录");
      localStorage.clear();
    }
    throw new NetworkError(err.response);
  });
  if (response?.data.code === 0) {
    return { ...response };
  } else {
    throw new NetworkError(response?.data.info);
  }
};

/**
 * @brief Add the token to the Authorization header
 *
 */
network.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
