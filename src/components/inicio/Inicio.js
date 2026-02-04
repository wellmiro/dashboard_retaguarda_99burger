import React, { useState, useEffect } from "react";
import Header from "./header/Header";
import Cards from "./cards/Cards";
import Grafico from "./grafico/Grafico";
import PedidosRecentes from "./pedidos/PedidosRecentes";
import RankingProdutos from "./rankingprodutos/RankingProdutos";
import { getUsuario } from "../../api/Usuarios";
import { getPedidos } from "../../api/Pedidos";
import "./Styles.css";

function Inicio() {
  const [filtro, setFiltro] = useState("hoje");
  const [horaAbertura, setHoraAbertura] = useState("08:00");
  const [horaFechamento, setHoraFechamento] = useState("03:50");
  const [dataEspecifica, setDataEspecifica] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idUsuario = localStorage.getItem("id_usuario");
    const token = localStorage.getItem("token");

    if (!idUsuario || !token) {
      window.location.href = "/login";
      return;
    }

    const carregarTudo = async () => {
      try {
        setLoading(true);

        const [resUsuario, resPedidos] = await Promise.all([
          getUsuario(idUsuario),
          getPedidos(),
        ]);

        setUsuario(resUsuario);

        const lista = Array.isArray(resPedidos.data)
          ? resPedidos.data
          : resPedidos.data?.pedidos || [];

        setPedidos(lista);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarTudo();
  }, []);

  return (
    <div className="dashboard-main-area">
      {loading && (
        <div className="loading-inline">
          <div className="loading-spinner"></div>
        </div>
      )}

      {!loading && (
        <>
          <Header usuario={usuario} />

          <Cards
            filtro={filtro}
            setFiltro={setFiltro}
            horaAbertura={horaAbertura}
            setHoraAbertura={setHoraAbertura}
            horaFechamento={horaFechamento}
            setHoraFechamento={setHoraFechamento}
            dataEspecifica={dataEspecifica}
            setDataEspecifica={setDataEspecifica}
            pedidosIniciais={pedidos}
          />

          <Grafico
            filtro={filtro}
            horaAbertura={horaAbertura}
            horaFechamento={horaFechamento}
            dataEspecifica={dataEspecifica}
            pedidosIniciais={pedidos}
          />

          <PedidosRecentes
            filtro={filtro}
            horaAbertura={horaAbertura}
            horaFechamento={horaFechamento}
            dataEspecifica={dataEspecifica}
            pedidosIniciais={pedidos}
          />

          <RankingProdutos
            filtro={filtro}
            horaAbertura={horaAbertura}
            horaFechamento={horaFechamento}
            dataEspecifica={dataEspecifica}
            pedidosIniciais={pedidos}
          />
        </>
      )}
    </div>
  );
}

export default Inicio;
