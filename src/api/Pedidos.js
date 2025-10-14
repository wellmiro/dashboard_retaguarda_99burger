import api from "./Api";

export const getPedidos = () => api.get("/pedidos/itens");

export default { getPedidos };

