// src/api/Api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://nonautobiographical-uncapitulating-henry.ngrok-free.dev", // conecta ao backend local
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

// Login AWS
export const loginUsuario = (email, senha) => api.post("/login", { email, senha });

export default api;
