import axios from "axios";

// Change this URL to your Railway backend URL
const API = axios.create({
    baseURL: "/api/",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;


