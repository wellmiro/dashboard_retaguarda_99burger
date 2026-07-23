import apiRef from './Api';

export const getInsumos = () => apiRef.get("/insumos");
export const postInsumo = (data) => apiRef.post("/insumos", data);
export const putInsumo = (id_insumo, data) => apiRef.put(`/insumos/${id_insumo}`, data);
export const updateInsumo = putInsumo; // Alias para evitar divergência de nomes
export const deleteInsumo = (id_insumo) => apiRef.delete(`/insumos/${id_insumo}`);

export const getFichaTecnica = (id_produto) => apiRef.get(`/produtos/${id_produto}/ficha`);
export const addFichaItem = (data) => apiRef.post("/produtos/ficha", data);
export const deleteFichaItem = (id_ficha) => apiRef.delete(`/produtos/ficha/${id_ficha}`);