import api from "./Api";

// Buscar usuário pelo ID
export const getUsuario = async (id_usuario) => {
  try {
    const response = await api.get(`/usuarios/${id_usuario}`);
    return response.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || "Não foi possível buscar o usuário";
    throw new Error(errorMsg);
  }
};

// Login — Salvando o token e configurando o cabeçalho na hora
export const loginUsuario = async (email, senha) => {
  try {
    const response = await api.post("/login", { email, senha });
    const { token } = response.data;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user_nome", response.data.nome);
      
      // Isso aqui garante que o próximo comando já saia com o token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return response.data; 
  } catch (err) {
    const errorMsg = err.response?.data?.error || "E-mail ou senha incorretos";
    throw new Error(errorMsg);
  }
};

const UsuariosAPI = { getUsuario, loginUsuario };
export default UsuariosAPI;