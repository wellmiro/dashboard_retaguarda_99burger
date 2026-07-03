import React, { useState, useEffect } from "react";
import Header from "./header/Header";
import Cards from "./cards/Cards";
import Grafico from "./grafico/Grafico";
import PedidosRecentes from "./pedidos/PedidosRecentes";
import RankingProdutos from "./rankingprodutos/RankingProdutos";
import { getEstabelecimentoDashboard } from "../../api/Api"; // Importa a nova rota
import { getPedidos } from "../../api/Pedidos";
import "./Styles.css";

function Inicio() {
  const [filtro, setFiltro] = useState("hoje");
  // 🟢 Começam com valor padrão e mudam dinamicamente conforme o banco
  const [horaAbertura, setHoraAbertura] = useState("00:00");
  const [horaFechamento, setHoraFechamento] = useState("23:59");
  const [dataEspecifica, setDataEspecifica] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [usuario, setUsuario] = useState(null); // Vai armazenar os dados da empresa pro Header
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

        // Faz as duas requisições de forma segura e paralela
        const [resEmpresa, resPedidos] = await Promise.all([
          getEstabelecimentoDashboard(),
          getPedidos(),
        ]);

        // Define os dados da empresa (nome, rua, logo) para o Header ler
        if (resEmpresa && resEmpresa.data) {
          setUsuario(resEmpresa.data);

          // 🟢 Captura os horários reais do estabelecimento vindos do banco de dados
          if (resEmpresa.data.horario_abertura) {
            const aberturaFormatada = resEmpresa.data.horario_abertura.substring(0, 5); // ex: "18:00"
            setHoraAbertura(aberturaFormatada);
          }
          if (resEmpresa.data.horario_fechamento) {
            const fechamentoFormatada = resEmpresa.data.horario_fechamento.substring(0, 5); // ex: "02:00"
            setHoraFechamento(fechamentoFormatada);
          }
        }

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