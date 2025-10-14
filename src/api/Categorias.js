// src/api/Categorias.js
import api from "./Api";

// Listar categorias
export const getCategorias = () => api.get("/categorias");

// Cadastrar nova categoria
export const postCategoria = (categoria) => api.post("/categorias", categoria);

// Atualizar categoria (não usar até o endpoint existir)
export const putCategoria = (id, categoria) => api.put(`/categorias/${id}`, categoria);

// Deletar categoria (não usar até o endpoint existir)
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);

export default {
  getCategorias,
  postCategoria,
  putCategoria,
  deleteCategoria
};
