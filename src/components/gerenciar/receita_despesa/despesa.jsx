import React, { useState, useEffect, useCallback } from 'react';
import api from "../../../api/Despesas";
import Header from './header/header.jsx';
import Cards from './cards/cards.jsx'; 
import Grafico from './grafico/grafico.jsx'; 
import CadCategoria from './cad_categoria/cad_categoria.jsx';
import CadDespesas from './cad_despesas/cad_despesas.jsx';
import Lista from './lista/lista.jsx'; 
import './styles.css';

function Despesa() {
  const [despesas, setDespesas] = useState([]);
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [showModalDespesa, setShowModalDespesa] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const resDes = await api.getDespesas();
      setDespesas(resDes.data || []);
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const dadosFiltrados = despesas.filter(d => {
    if (!d.data_vencimento) return false;
    const dataVenc = d.data_vencimento.split('T')[0].split('-');
    return parseInt(dataVenc[1]) === Number(mesFiltro) && 
           parseInt(dataVenc[0]) === Number(anoFiltro);
  });

  if (!Header || !Cards || !CadCategoria || !CadDespesas || !Grafico) {
    return <div style={{color: 'white'}}>Erro crítico: Falha na importação dos componentes.</div>;
  }

  return (
    <div className="relatorios-container">
      <h2 className="performace-label">💰 Gestão de Despesas e Receitas</h2>

      <Header 
        mesFiltro={mesFiltro}
        setMesFiltro={setMesFiltro}
        anoFiltro={anoFiltro}
        setAnoFiltro={setAnoFiltro}
        abrirModalCategoria={() => setShowModalCategoria(true)}
        abrirModalDespesa={() => setShowModalDespesa(true)}
      />

      {/* ✅ AQUI ESTÁ CORRIGIDO */}
      <div className="layout-dashboard-horizontal">
        <Cards dados={dadosFiltrados} />

        <div className="dashboard-content-right">
          <Grafico dados={dadosFiltrados} todosOsDados={despesas} />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Lista dados={dadosFiltrados} onRefresh={carregarDados} />
      </div>

      <CadCategoria 
        isOpen={showModalCategoria} 
        onClose={() => setShowModalCategoria(false)} 
        onRefresh={carregarDados} 
      />

      <CadDespesas 
        isOpen={showModalDespesa} 
        onClose={() => setShowModalDespesa(false)} 
        onRefresh={carregarDados} 
      />
    </div>
  );
}

export default Despesa;