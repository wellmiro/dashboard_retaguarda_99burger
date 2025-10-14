// src/components/inicio/Inicio.js
import React from 'react';
import Header from './header/Header';
import Cards from './cards/Cards';
import Grafico from './grafico/Grafico';
import PedidosRecentes from './pedidos/PedidosRecentes';
import RankingProdutos from './rankingprodutos/RankingProdutos';
import './Styles.css';

function Inicio() {
  const pedidos = [
    { id: '001', cliente: 'João', valor: 45, status: 'Entregue' },
    { id: '002', cliente: 'Maria', valor: 30, status: 'Pendente' },
    { id: '003', cliente: 'Carlos', valor: 60, status: 'Entregue' },
    { id: '004', cliente: 'Ana', valor: 25, status: 'Cancelado' },
    { id: '005', cliente: 'Beatriz', valor: 80, status: 'Entregue' },
  ];

  return (
    <div className="dashboard-main-area">
      <Header />
      <Cards />
      <Grafico />
      <PedidosRecentes pedidos={pedidos} />
      <RankingProdutos />
    </div>
  );
}

export default Inicio; // ✅ agora tudo bate com o nome do componente
