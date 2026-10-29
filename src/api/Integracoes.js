// src/api/Integracoes.js
import api from "./Api";

// 1. Busca o status da conexão da loja com o Mercado Pago (conectado / não conectado)
export const getStatusMercadoPago = () => api.get("/integracoes/mercadopago/status");

// 2. Pede para o backend gerar o link oficial do Mercado Pago para autorizar
export const getLinkConexaoMercadoPago = () => api.get("/integracoes/mercadopago/conectar");

// 3. Desconecta a conta do Mercado Pago da loja
export const desconectarMercadoPago = () => api.delete("/integracoes/mercadopago");

const IntegracoesAPI = {
  getStatusMercadoPago,
  getLinkConexaoMercadoPago,
  desconectarMercadoPago
};

export default IntegracoesAPI;