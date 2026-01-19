// src/api/Api.js
import axios from "axios";

/**
 * Configuração central da API
 * O header 'ngrok-skip-browser-warning' é essencial para que o navegador
 * não bloqueie a resposta JSON com a página de aviso do ngrok.
 */
const api = axios.create({
  baseURL: "https://api-99burger.onrender.com", 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "69420" // Pode ser qualquer valor, ex: "true" ou "69420"
  },
});

// --- Endpoints de Consulta (Dashboard e Listagens) ---
export const getPedidos = () => api.get("/pedidos");
export const getProdutos = () => api.get("/produtos");
export const getDashboard = () => api.get("/dashboard");

// --- Endpoints de Gerenciamento de Pedidos (CRUD) ---
export const addPedido = (data) => api.post("/pedidos", data);
export const updatePedido = (id, data) => api.put(`/pedidos/${id}`, data);
export const deletePedido = (id) => api.delete(`/pedidos/${id}`);

// --- Endpoints de Autenticação ---
// Nota: Se sua API de login estiver em outro servidor, ajuste a URL se necessário.
export const loginUsuario = (email, senha) => api.post("/login", { email, senha });

export default api;