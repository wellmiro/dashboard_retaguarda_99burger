import api from "./Api";

// --- CATEGORIAS ---
export const getCategoriasDespesa = () => api.get("/despesas/categorias");
export const createCategoriaDespesa = (data) => api.post("/despesas/categorias", data);
export const deleteCategoriaDespesa = (id) => api.delete(`/despesas/categorias/${id}`);

// --- DESPESAS ---
export const getDespesas = () => api.get("/despesas");
export const createDespesa = (data) => api.post("/despesas", data);
export const updateDespesa = (id, data) => api.put(`/despesas/${id}`, data);
export const deleteDespesa = (id) => api.delete(`/despesas/${id}`);
export const pagarDespesa = (id) => api.put(`/despesas/${id}/pagar`);

export default { 
    getCategoriasDespesa, createCategoriaDespesa, deleteCategoriaDespesa,
    getDespesas, createDespesa, updateDespesa, deleteDespesa, pagarDespesa 
};