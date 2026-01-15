import React, { useState } from "react";
import Header from "./header/Header";
import Cards from "./cards/Cards";
import Grafico from "./grafico/Grafico";
import Lista from "./lista/Lista";
import "./Styles.css";

function Vendas() {
  const [filtroData, setFiltroData] = useState({
    inicio: null,
    fim: null,
    tipo: "todas",
  });

  const handleFiltroChange = (novoFiltro) => {
    setFiltroData(novoFiltro);
  };

  return (
    <div className="vendas-container relatorios-container">
      <Header filtroData={filtroData} onFiltroChange={handleFiltroChange} />

      {/* Cards de resumo */}
      <div className="vendas-cards">
        <Cards filtroData={filtroData} />
      </div>

      {/* Gráfico de vendas */}
      <div className="vendas-grafico">
        <Grafico filtroData={filtroData} />
      </div>

      {/* Lista / tabela de vendas */}
      <div className="vendas-lista">
        <Lista filtroData={filtroData} />
      </div>
    </div>
  );
}

export default Vendas;
