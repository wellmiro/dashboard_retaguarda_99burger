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
  const [dataEspecifica, setDataEspecifica] = useState(new Date().toISOString().split('T')[0]);
  
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [textoLoading, setTextoLoading] = useState("Sincronizando...");

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
        setTextoLoading("Sincronizando...");
        
        const [resUsuario, resPedidos] = await Promise.all([
          getUsuario(idUsuario),
          getPedidos()
        ]);

        setTextoLoading("Carregando...");
        setUsuario(resUsuario);
        const lista = Array.isArray(resPedidos.data) ? resPedidos.data : resPedidos.data?.pedidos || [];
        setPedidos(lista);

        setTextoLoading("Aguarde...");

        setTimeout(() => {
          setTextoLoading("Concluído!");
          setTimeout(() => setLoading(false), 700);
        }, 800);

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setTextoLoading("Erro na conexão.");
      }
    };

    carregarTudo();
  }, []);

  if (loading) {
    return (
      <div style={styles.overlay}>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={styles.box}>
          <div style={styles.spinner}></div>
          <p style={styles.text}>{textoLoading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-area">
      <Header usuario={usuario} />
      <Cards
        filtro={filtro} setFiltro={setFiltro}
        horaAbertura={horaAbertura} setHoraAbertura={setHoraAbertura}
        horaFechamento={horaFechamento} setHoraFechamento={setHoraFechamento}
        dataEspecifica={dataEspecifica} setDataEspecifica={setDataEspecifica}
        pedidosIniciais={pedidos} 
      />
      <Grafico
        filtro={filtro} horaAbertura={horaAbertura}
        horaFechamento={horaFechamento} dataEspecifica={dataEspecifica}
        pedidosIniciais={pedidos}
      />
      <PedidosRecentes
        filtro={filtro} horaAbertura={horaAbertura}
        horaFechamento={horaFechamento} dataEspecifica={dataEspecifica}
        pedidosIniciais={pedidos}
      />
      <RankingProdutos 
        filtro={filtro} horaAbertura={horaAbertura} 
        horaFechamento={horaFechamento} dataEspecifica={dataEspecifica}
        pedidosIniciais={pedidos}
      />
    </div>
  );
}

// Estilos em linha para garantir que o celular renderize
const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: '#000000', // Fundo preto total
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  box: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255, 255, 255, 0.2)',
    borderTop: '6px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: '#ffffff',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0,
    fontFamily: 'sans-serif',
  }
};

export default Inicio;