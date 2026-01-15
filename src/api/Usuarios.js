// src/api/Usuarios.js
import api from "./Api";

// Buscar usuário pelo ID
// Retorna um objeto único, ou lança erro se não encontrado
export const getUsuario = async (id_usuario) => {
  try {
    const response = await api.get(`/usuarios/${id_usuario}`); // rota deve bater com backend
    return response.data; // já é um objeto único
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error("Não foi possível buscar o usuário");
  }
};

// Login — retorna diretamente o objeto do usuário
export const loginUsuario = async (email, senha) => {
  try {
    const response = await api.post("/login", { email, senha });
    return response.data; // objeto do usuário
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      throw new Error(err.response.data.error); // usuário ou senha inválidos
    }
    throw new Error("Servidor não está disponível");
  }
};

// Export padrão
export default { getUsuario, loginUsuario };
