// src/api/Insumos.js
import api from './Api'; // ✅ Aqui é './Api' porque Api.js está na mesma pasta (src/api)

export const getInsumos = () => api.get("/insumos");
export const postInsumo = (data) => api.post("/insumos", data);
export const putInsumo = (id_insumo, data) => api.put(`/insumos/${id_insumo}`, data);
export const deleteInsumo = (id_insumo) => api.delete(`/insumos/${id_insumo}`);

export const getFichaTecnica = (id_produto) => api.get(`/produtos/${id_produto}/ficha`);
export const addFichaItem = (data) => api.post("/produtos/ficha", data);
export const deleteFichaItem = (id_ficha) => api.delete(`/produtos/ficha/${id_ficha}`);