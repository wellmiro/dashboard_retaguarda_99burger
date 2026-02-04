import React, { useState, useEffect, useRef } from 'react';
import './Styles.css';

function Header({ filtroData, onFiltroChange }) {
  // Sincroniza os inputs com o que vem do componente pai
  const [startDate, setStartDate] = useState(filtroData.inicio || '');
  const [endDate, setEndDate] = useState(filtroData.fim || '');
  const [mesesAtivos, setMesesAtivos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(filtroData.tipo);
  
  const barraRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const mesesFull = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const mesAtualIndex = new Date().getMonth();
    setMesesAtivos(mesesFull.slice(0, mesAtualIndex + 1));
  }, []);

  // Função para mover a barra azul
  const moverBarra = (index) => {
    if (barraRef.current && containerRef.current) {
      const botoes = containerRef.current.querySelectorAll('.btn-nav-vendas');
      const alvo = botoes[index];
      if (alvo) {
        barraRef.current.style.width = `${alvo.offsetWidth}px`;
        barraRef.current.style.left = `${alvo.offsetLeft}px`;
        barraRef.current.style.opacity = "1";
      }
    }
  };

  // Posiciona a barra ao carregar ou mudar o index
  useEffect(() => {
    if (mesesAtivos.length > 0) {
      const timer = setTimeout(() => moverBarra(activeIndex), 300);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, mesesAtivos]);

  // FUNÇÃO CORRIGIDA: Atualiza o gráfico E os campos de data
  const handleMesClick = (index) => {
    setActiveIndex(index);
    const ano = new Date().getFullYear();
    const inicio = new Date(ano, index, 1).toISOString().split('T')[0];
    const fim = new Date(ano, index + 1, 0).toISOString().split('T')[0];
    
    // Atualiza os campos visuais (o dd/mm/aaaa que sumiu)
    setStartDate(inicio);
    setEndDate(fim);
    
    // Avisa o componente pai para atualizar os cards/grafico
    onFiltroChange({ inicio, fim, tipo: index });
  };

  return (
    <div className="header-vendas-top">
      <h1 className="titulo-vendas">Vendas Diárias</h1>
      
      <div className="filtro-vendas-inputs">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn-vendas-filtrar" onClick={() => onFiltroChange({ inicio: startDate, fim: endDate, tipo: 'custom' })}>
          Filtrar
        </button>
      </div>

      <div className="container-nav-vendas" ref={containerRef}>
        {mesesAtivos.map((mes, index) => (
          <button key={mes} className="btn-nav-vendas mes-azul" onClick={() => handleMesClick(index)}>
            {mes}
          </button>
        ))}
        
        <button className="btn-nav-vendas hoje-vermelho" onClick={() => {
          const hoje = new Date().toISOString().split('T')[0];
          setStartDate(hoje);
          setEndDate(hoje);
          setActiveIndex(mesesAtivos.length);
          onFiltroChange({ inicio: hoje, fim: hoje, tipo: mesesAtivos.length });
        }}>Hoje</button>
        
        <button className="btn-nav-vendas todos-laranja" onClick={() => {
          const ano = new Date().getFullYear();
          const hoje = new Date().toISOString().split('T')[0];
          const inicioAno = `${ano}-01-01`;
          setStartDate(inicioAno);
          setEndDate(hoje);
          const index = mesesAtivos.length + 1;
          setActiveIndex(index);
          onFiltroChange({ inicio: inicioAno, fim: hoje, tipo: index });
        }}>Todos</button>

        <div className="pauzinho-azul" ref={barraRef}></div>
      </div>
    </div>
  );
}

export default Header;