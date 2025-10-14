// src/components/relatorios/vendas/header/Header.js
import React, { useState, useEffect, useRef } from 'react';
import './Styles.css';

function Header({ filtroData, onFiltroChange }) {
  const [startDate, setStartDate] = useState(filtroData.inicio || '');
  const [endDate, setEndDate] = useState(filtroData.fim || '');
  const [mesesAtivos, setMesesAtivos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const barraRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setStartDate(filtroData.inicio || '');
    setEndDate(filtroData.fim || '');
  }, [filtroData]);

  // Gerar meses de Janeiro até mês atual dinamicamente
  useEffect(() => {
    const hoje = new Date();
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril",
      "Maio", "Junho", "Julho", "Agosto",
      "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    setMesesAtivos(meses.slice(0, hoje.getMonth() + 1));
  }, []);

  const handleFilter = () => {
    if (onFiltroChange) {
      onFiltroChange({
        inicio: startDate || null,
        fim: endDate || null,
      });
    }
  };

  const animarBarra = (index) => {
    if (barraRef.current && containerRef.current) {
      const btn = containerRef.current.children[index];
      barraRef.current.style.width = `${btn.offsetWidth}px`;
      barraRef.current.style.left = `${btn.offsetLeft}px`;
    }
  };

  const handleMesClick = (index) => {
    setActiveIndex(index);
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), index, 1);
    const fim = new Date(hoje.getFullYear(), index + 1, 0);

    if (onFiltroChange) {
      onFiltroChange({
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0],
      });
    }

    animarBarra(index);
  };

  const handleHojeClick = () => {
    const index = mesesAtivos.length;
    setActiveIndex(index);

    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    if (onFiltroChange) {
      onFiltroChange({
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0],
      });
    }

    animarBarra(index);
  };

  const handleTodosClick = () => {
    const index = mesesAtivos.length + 1;
    setActiveIndex(index);

    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), 0, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    if (onFiltroChange) {
      onFiltroChange({
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0],
      });
    }

    animarBarra(index);
  };

  // Inicializar barra no primeiro mês ou seleção atual
  useEffect(() => {
    if (activeIndex === null && containerRef.current && mesesAtivos.length > 0) {
      animarBarra(0);
      setActiveIndex(0);
    }
  }, [mesesAtivos]);

  return (
    <div className="top-bar">
      <h1>Vendas Diárias</h1>
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
        <button onClick={handleFilter}>Filtrar</button>
      </div>

      <div className="botoes-mes-container" ref={containerRef}>
        {mesesAtivos.map((mes, index) => (
          <button
            key={mes}
            className="btn-mes"
            onClick={() => handleMesClick(index)}
          >
            {mes}
          </button>
        ))}

        <button className="btn-hoje" onClick={handleHojeClick}>
          Hoje
        </button>

        <button className="btn-todos" onClick={handleTodosClick}>
          Todos
        </button>

        <div className="barra-ativa" ref={barraRef}></div>
      </div>
    </div>
  );
}

export default Header;
