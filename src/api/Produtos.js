// src/api/Produtos.js
import api from "./Api";

// GET - todos os produtos (Aqui o Interceptor envia o Token p/ filtrar por empresa)
export const getProdutos = () => api.get("/produtos");

// POST - criar novo produto (Precisa de Token)
export const createProduto = (data) => api.post("/produtos", data);

// PUT - atualizar produto pelo id (Precisa de Token)
export const updateProduto = (id, data) => api.put(`/produtos/${id}`, data);

// DELETE - remover produto pelo id (Precisa de Token)
export const deleteProduto = (id) => api.delete(`/produtos/${id}`);

// --- ROTAS SEM NECESSIDADE DE AUTENTICAÇÃO NO NODE ---

// POST - criar nova opção (grupo) de produto
export const createOpcaoProduto = (data) => api.post("/produtos/opcoes", data);

// DELETE - remover grupo de produto (opção)
export const deleteOpcaoProduto = (id_opcao) =>
  api.delete(`/produtos/opcoes/${id_opcao}`);

// GET - grupos e itens do produto (Usado no cardápio público)
export const getOpcoesProduto = (id_produto) =>
  api.get(`/produtos/cardapio/opcoes/${id_produto}`);

export default {
  getProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  createOpcaoProduto,
  deleteOpcaoProduto,
  getOpcoesProduto,
};