// src/api/Usuarios.js
import api from "./Api";

// Busca usuário pelo ID
export const getUsuario = (id_usuario) => api.get(`/usuario/${id_usuario}`);

// Faz login do usuário
export const loginUsuario = (email, senha) =>
  api.post("/login", { email, senha });

// Export default opcional
export default {
  getUsuario,
  loginUsuario,
};
