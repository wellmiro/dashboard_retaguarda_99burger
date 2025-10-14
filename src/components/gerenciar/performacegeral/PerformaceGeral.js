import React from 'react';
import Cards from './cards/Cards';
import Grafico from './grafico/Grafico';
import Lista from './lista/Lista'; // atenção à pasta correta
import './Styles.css';

function PerformaceGeral() {
  return (
    <div className="performace-geral-container">
      <h2 className="performace-label">📊 Performace Geral</h2>

      <Cards />

      <Grafico />

      <Lista /> {/* adiciona a lista de produtos */}
    </div>
  );
}

export default PerformaceGeral;
