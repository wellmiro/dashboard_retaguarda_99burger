import React, { useState, useEffect } from "react";
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
    <div className="vendas-container">
      <Header filtroData={filtroData} onFiltroChange={handleFiltroChange} />
      <Cards filtroData={filtroData} />
      <Grafico filtroData={filtroData} />
      <Lista filtroData={filtroData} />
    </div>
  );
}

export default Vendas;
