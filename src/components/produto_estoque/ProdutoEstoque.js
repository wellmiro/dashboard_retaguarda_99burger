// src/components/produto_estoque/ProdutoEstoque.js
import React, { useState, useCallback } from 'react';
// ⚠️ CORRIGIDO: O nome do arquivo refatorado é Categorias.js
// O caminho foi ajustado para refletir o nome do componente (assumindo que o arquivo está na pasta 'categorias')
import Categorias from './categorias/Categorias'; 
import CadProdutos from './produtos/CadProdutos';
import Cardapio from './cardapio/Cardapio';
import './Styles.css';

const ProdutoEstoque = () => {
    // Estado para forçar recarregamento do Cardápio
    const [refresh, setRefresh] = useState(false);

    // Usa useCallback para garantir que a função atualizarCardapio seja estável
    const atualizarCardapio = useCallback(() => {
        setRefresh(prev => !prev);
    }, []);

    return (
        // Aplicando o container Flex/Grid
        <div className="produto-estoque-container">
            {/* Categorias (Geralmente um painel menor) */}
            <Categorias />

            {/* Cadastro de Produtos (Geralmente um painel de formulário) */}
            <CadProdutos onUpdate={atualizarCardapio} />

            {/* Cardápio (Geralmente o painel principal/maior) */}
            {/* Usar 'key' para forçar a remontagem/recarregamento do Cardapio quando 'refresh' muda */}
            <Cardapio key={refresh} />
        </div>
    );
};

export default ProdutoEstoque;