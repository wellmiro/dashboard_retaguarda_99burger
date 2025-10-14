// src/api/Api.js
import axios from "axios";

// URL base da sua API (pode ser localhost, AWS, etc.)
const API_URL = process.env.REACT_APP_API_URL || "http://44.203.195.247:3000";

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

export default api;
