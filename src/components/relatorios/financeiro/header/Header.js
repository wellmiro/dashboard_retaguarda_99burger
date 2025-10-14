import React, { useState } from 'react';
import './Styles.css';

function Header() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todas');

  const handleFilter = () => {
    alert(`Filtrando de ${startDate} até ${endDate} | Tipo: ${tipoFiltro}`);
    console.log('Filtro aplicado:', { startDate, endDate, tipoFiltro });
  };

  return (
    <div className="top-bar">
      <div className="title-section">
        <h1>Fluxo de Caixa - Relatório Financeiro</h1>
      </div>
      <div className="filtro">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
        <button onClick={handleFilter}>Filtrar</button>
      </div>
    </div>
  );
}

export default Header;
