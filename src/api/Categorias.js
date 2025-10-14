// src/api/Categorias.js
import api from "./Api";

// Listar categorias
export const getCategorias = () => api.get("/categorias");

// Cadastrar nova categoria
export const postCategoria = (categoria) => api.post("/categorias", categoria);

// Atualizar categoria
export const putCategoria = (id, categoria) => api.put(`/categorias?id=${id}`, categoria);

// Deletar categoria
export const deleteCategoria = (id) => api.delete(`/categorias?id=${id}`);

export default {
  getCategorias,
  postCategoria,
  putCategoria,
  deleteCategoria
};
