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
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const isLoggedIn = !!localStorage.getItem("id_usuario"); // verifica se está logado

  return (
    <Router>
      <Routes>
        {/* Página inicial redireciona para login se não estiver logado */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/inicio" /> : <Navigate to="/login" />}
        />

        {/* Rota do Login não mostra Sidebar */}
        <Route path="/login" element={<Login />} />

        {/* Rotas do Dashboard (com Sidebar) */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
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
