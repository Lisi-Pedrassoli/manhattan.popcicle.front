import axios from "axios";// aqui o front manda o token do usuário a cada requisição que ele faz manda pro securityConfiguration

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
  headers: {
    "Authorization": `Bearer ${token}`
  }
})

export default api;