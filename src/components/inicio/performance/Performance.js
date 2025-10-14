import React from 'react';
import './Styles.css';

function Performance() {
  return (
    <div className="performance-container">
      <div className="performance-section">
        <h2>Acompanhamento</h2>
        <div className="performance-cards">
          <div className="performance-card">
            <h3>Pedidos de hoje</h3>
            <p>0</p>
          </div>
          <div className="performance-card">
            <h3>Ticket médio de hoje</h3>
            <p>R$ 0,00</p>
          </div>
          <div className="performance-card">
            <h3>Pedidos de abril</h3>
            <p>0</p>
          </div>
          <div className="performance-card">
            <h3>Ticket médio de abril</h3>
            <p>R$ 0,00</p>
          </div>
          <div className="performance-card">
            <h3>Avaliação no App</h3>
            <p>Nenhuma avaliação</p>
          </div>
        </div>
      </div>
      <div className="performance-section">
        <h2>Desempenho</h2>
        <div className="performance-cards">
          <div className="performance-card">
            <h3>Vendas</h3>
            <p>0</p>
            <p>R$ 0,00</p>
          </div>
          <div className="performance-card">
            <h3>Clientes Novos</h3>
            <p>0</p>
            <p>R$ 0,00</p>
          </div>
          <div className="performance-card">
            <h3>Item mais vendido</h3>
            <p> - </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Performance;