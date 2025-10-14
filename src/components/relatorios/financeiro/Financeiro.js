import React from "react";
import "./Styles.css";           // ✅ CSS unificado
import Header from "./header/Header";
import Cards from "./cards/Cards"; // ✅ import dos cards
import Lista from "./lista/Lista"; // ✅ import dos cards
import Grafico from "./grafico/Grafico"; 

function Financeiro() {
  return (
    <div className="relatorios-container">
      <Header />
      <Cards /> {/* ✅ aqui chamamos os cards */}
      <Lista /> {/* ✅ aqui chamamos os cards */}
      <Grafico />
    </div>
  );
}

export default Financeiro;
