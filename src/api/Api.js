import axios from "axios";

const api = axios.create({
  baseURL: "https://api-99burger.onrender.com",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// --- INTERCEPTOR: Injeta o Token do LocalStorage em cada requisição ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPOSTA: Captura erro 401 e 403 (Token inválido/expirado) ---
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Se a API retornar 401 ou 403 (Forbidden), limpa tudo e manda pro login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.clear();
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

// --- CATEGORIAS ---
export const getCategorias = () => api.get("/categorias");
export const postCategoria = (data) => api.post("/categorias", data);
export const putCategoria = (id, data) => api.put(`/categorias/${id}`, data);
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);

// --- PRODUTOS ---
export const getProdutos = () => api.get("/produtos");
export const createProduto = (data) => api.post("/produtos", data);
export const updateProduto = (id, data) => api.put(`/produtos/${id}`, data);
export const deleteProduto = (id) => api.delete(`/produtos/${id}`);

// --- OPÇÕES E CARDÁPIO ---
export const createOpcaoProduto = (data) => api.post("/produtos/opcoes", data);
export const deleteOpcaoProduto = (id) => api.delete(`/produtos/opcoes/${id}`);
export const getOpcoesProduto = (id_prod) => api.get(`/produtos/cardapio/opcoes/${id_prod}`);

// --- PEDIDOS ---
export const getPedidos = () => api.get("/pedidos");
export const addPedido = (data) => api.post("/pedidos", data);
export const updatePedido = (id, data) => api.put(`/pedidos/${id}`, data);
export const deletePedido = (id) => api.delete(`/pedidos/${id}`);

// --- USUÁRIOS E AUTH ---
export const loginUsuario = (email, senha) => api.post("/login", { email, senha });
export const getUsuario = (id) => api.get(`/usuarios/${id}`);

// --- DASHBOARD ---
export const getDashboard = () => api.get("/dashboard");

export default api;