// src/api/Pedidos.js
import api from "./Api";

// Listar itens de pedidos via proxy
export const getPedidos = () => api.get("/pedidos/itens");

export default { getPedidos };
