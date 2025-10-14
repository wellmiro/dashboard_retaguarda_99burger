import api from "./Api";

// Busca usuário pelo ID
export const getUsuario = (id_usuario) => api.get(`/usuario/${id_usuario}`);

// Faz login do usuário — agora chama o endpoint da Vercel (/api/login)
export const loginUsuario = (email, senha) =>
  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  }).then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erro ao efetuar login");
    }
    return res.json();
  });

// Export default
export default {
  getUsuario,
  loginUsuario,
};
