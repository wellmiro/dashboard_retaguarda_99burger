// src/components/gerenciar/faturas/Cards.js
import React from 'react';
import './Styles.css';

function Cards() {
  return (
    <div className="top-panel">
      <div className="card-status card-paid">
        <h3>4</h3>
        <p>Pagas</p>
      </div>
      <div className="card-status card-pending">
        <h3>0</h3>
        <p>Pendentes</p>
      </div>
      <div className="card-status card-late">
        <h3>0</h3>
        <p>Atrasadas</p>
      </div>
    </div>
  );
}

export default Cards;
