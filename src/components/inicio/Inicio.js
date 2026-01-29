import React, { useState, useEffect } from "react";
import Header from "./header/Header";
import Cards from "./cards/Cards";
import Grafico from "./grafico/Grafico";
import PedidosRecentes from "./pedidos/PedidosRecentes";
import RankingProdutos from "./rankingprodutos/RankingProdutos";
import { getUsuario } from "../../api/Usuarios";
import "./Styles.css";

function Inicio() {
  const [filtro, setFiltro] = useState("hoje");
  const [horaAbertura, setHoraAbertura] = useState("08:00");
  const [horaFechamento, setHoraFechamento] = useState("03:50");
  const [usuario, setUsuario] = useState(null); // usuário logado

  // Pegar dados do usuário ao carregar
  useEffect(() => {
    const idUsuario = localStorage.getItem("id_usuario");
    if (idUsuario) {
      getUsuario(idUsuario)
        .then((data) => {
          // data já é um objeto único, não array
          setUsuario(data);
        })
        .catch((err) => {
          console.error("Erro ao buscar usuário:", err.message);
        });
    }
  }, []);

  return (
    <div className="dashboard-main-area">
      <Header usuario={usuario} />

      <Cards
        filtro={filtro}
        setFiltro={setFiltro}
        horaAbertura={horaAbertura}
        setHoraAbertura={setHoraAbertura}
        horaFechamento={horaFechamento}
        setHoraFechamento={setHoraFechamento}
      />

      <Grafico
        filtro={filtro}
        horaAbertura={horaAbertura}
        horaFechamento={horaFechamento}
      />

      <PedidosRecentes
        filtro={filtro}
        horaAbertura={horaAbertura}
        horaFechamento={horaFechamento}
      />

      <RankingProdutos />
    </div>
  );
}

export default Inicio;
