// src/api/Categorias.js
import api from "./Api";

// Listar categorias - Agora seguro via interceptor no Api.js
export const getCategorias = () => api.get("/categorias");

// Cadastrar nova categoria
export const postCategoria = (categoria) => api.post("/categorias", categoria);

// Atualizar categoria
export const putCategoria = (id, categoria) => api.put(`/categorias/${id}`, categoria);

// Deletar categoria
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);

const CategoriasAPI = {
  getCategorias,
  postCategoria,
  putCategoria,
  deleteCategoria
};

export default CategoriasAPI;