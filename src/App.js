import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Inicio from "./components/inicio/Inicio";
import PerformaceGeral from "./components/gerenciar/performacegeral/PerformaceGeral";
import Faturas from "./components/gerenciar/faturas/Faturas";
import Vendas from "./components/relatorios/vendas/Vendas";
import Estoque from "./components/relatorios/estoque/Estoque";
import Financeiro from "./components/relatorios/financeiro/Financeiro";
import ProdutoEstoque from "./components/produto_estoque/ProdutoEstoque";
import Login from "./components/login/Login";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Transformamos em estado para o React "perceber" a mudança
  const [user, setUser] = useState(localStorage.getItem("id_usuario")); 

  // Função para atualizar o estado quando logar
  const handleLoginSuccess = () => {
    setUser(localStorage.getItem("id_usuario"));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/inicio" /> : <Navigate to="/login" />}
        />

        {/* Passamos a função para o Login avisar o App que deu certo */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        <Route
          path="/*"
          element={
            user ? (
              <div className="dashboard-wrapper">
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <div className={`content-container ${isCollapsed ? "collapsed" : ""}`}>
                  <Routes>
                    <Route path="/inicio" element={<Inicio />} />
                    <Route path="/performace" element={<PerformaceGeral />} />
                    <Route path="/faturas" element={<Faturas />} />
                    <Route path="/vendas" element={<Vendas />} />
                    <Route path="/estoque" element={<Estoque />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/produto-estoque" element={<ProdutoEstoque />} />
                    <Route path="*" element={<Navigate to="/inicio" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
