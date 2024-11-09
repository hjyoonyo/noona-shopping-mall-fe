import axios from "axios";
// 상황따라 주소 다름
const LOCAL_BACKEND = process.env.REACT_APP_LOCAL_BACKEND;
const REACT_APP_PRODUCTION_BACKEND = process.env.REACT_APP_PRODUCTION_BACKEND;

const api = axios.create({
  baseURL: LOCAL_BACKEND || REACT_APP_PRODUCTION_BACKEND,
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${sessionStorage.getItem("token")}`,
  },
});

api.interceptors.request.use(
  (request) => {
    request.headers.authorization = `Bearer ${sessionStorage.getItem("token")}`;
    return request;
  },
  function (error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    error = error.response.data;
    return Promise.reject(error);
  }
);

export default api;
