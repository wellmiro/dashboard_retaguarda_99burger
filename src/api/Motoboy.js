// src/api/Motoboy.js
import api from "./Api";

// Configuração + zonas + coordenadas do estabelecimento
export const getConfigMotoboy = () => api.get("/motoboy/config");
export const salvarConfigMotoboy = (dados) => api.put("/motoboy/config", dados);

// Zonas
export const criarZona = (zona) => api.post("/motoboy/zonas", zona);
export const atualizarZona = (id, zona) => api.put(`/motoboy/zonas/${id}`, zona);
export const excluirZona = (id) => api.delete(`/motoboy/zonas/${id}`);

// Público (cardápio digital) - não precisa de token, mas o interceptor não atrapalha
export const calcularFrete = (slug, lat, lng) =>
  api.get(`/cardapio_digital/${slug}/frete`, { params: { lat, lng } });

export default {
  getConfigMotoboy, salvarConfigMotoboy,
  criarZona, atualizarZona, excluirZona, calcularFrete,
};

// Sugestões de endereço (autocomplete). lat/lng = centro para priorizar resultados próximos
export const buscarEndereco = (q, lat, lng) =>
  api.get("/geocode/buscar", { params: { q, lat, lng } });