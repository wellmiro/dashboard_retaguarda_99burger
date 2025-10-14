// src/components/produto_estoque/ProdutoEstoque.js
import React, { useState } from 'react';
import Categoria from './categorias/Categorias';
import CadProdutos from './produtos/CadProdutos';
import Cardapio from './cardapio/Cardapio';
import './Styles.css';

const ProdutoEstoque = () => {
  // Estado para forçar recarregamento do Cardápio
  const [refresh, setRefresh] = useState(false);

  // Função chamada após cadastrar produto
  const atualizarCardapio = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="produto-estoque-container">
      {/* Categorias */}
      <Categoria />

      {/* Cadastro de Produtos */}
      <CadProdutos onUpdate={atualizarCardapio} />

      {/* Cardápio (recarrega sempre que refresh muda) */}
      <Cardapio key={refresh} />
    </div>
  );
};

export default ProdutoEstoque;
