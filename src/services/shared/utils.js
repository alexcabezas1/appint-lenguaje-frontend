import axios from "axios";
import storage from "./storage";
import getConfig from "./config";

export const tokenName = "x-access-token";
const config = getConfig();

export const getAxiosClient = () => {
  let headers = {};
  const token = storage.get(tokenName);
  if (token) {
    headers = { [tokenName]: token };
  }
  const apiURL = config.get("api:url");
  console.log(apiURL);
  return axios.create({
    baseURL: apiURL,
    timeout: 1000,
    headers,
  });
};
