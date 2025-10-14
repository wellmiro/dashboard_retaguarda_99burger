// src/api/Api.js
import axios from "axios";

// Base URL apontando para o proxy /api
const API_URL = process.env.REACT_APP_API_URL || "/api";

// Cria uma instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints genéricos
export const getPedidos = () => api.get("/pedidos");
export const getProdutos = () => api.get("/produtos");
export const getDashboard = () => api.get("/dashboard");

// CRUD Pedidos
export const addPedido = (data) => api.post("/pedidos", data);
export const updatePedido = (id, data) => api.put(`/pedidos/${id}`, data);
export const deletePedido = (id) => api.delete(`/pedidos/${id}`);

// Para login (chamando o proxy /api/login)
export const loginUsuario = (email, senha) =>
  api.post("/login", { email, senha });

export default api;
