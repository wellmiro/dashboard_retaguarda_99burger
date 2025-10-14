import React from 'react';
import './Styles.css'; // CSS dos cards

function Cards() {
  return (
    <div className="cards-container">
      <div className="card card-entradas">
        <h3>R$ 15.250,00</h3>
        <p>Total Entradas</p>
      </div>
      <div className="card card-saidas">
        <h3>R$ 7.500,00</h3>
        <p>Total Saídas</p>
      </div>
      <div className="card card-lucro">
        <h3>R$ 7.750,00</h3>
        <p>Lucro Líquido</p>
      </div>
      <div className="card card-taxas">
        <h3>R$ 1.200,00</h3>
        <p>Taxas de Entrega</p>
      </div>
    </div>
  );
}

export default Cards;
