import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome, FaStore, FaChartBar, FaCog, FaSignOutAlt,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaBoxOpen,
  FaCashRegister, FaBars, FaMotorcycle
} from "react-icons/fa";
import "./Styles.css";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const funcaoUsuario = (localStorage.getItem("funcao_usuario") || "").trim().toLowerCase();
  const isCozinha = funcaoUsuario === "cozinha";
  const isMotoboy = funcaoUsuario === "motoboy";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleMenu = (menuName) => {
    if (isCollapsed && window.innerWidth > 768) {
      setIsCollapsed(false);
      setOpenMenu(menuName);
    } else {
      setOpenMenu(openMenu === menuName ? null : menuName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_usuario");
    localStorage.removeItem("nome_usuario");
    localStorage.removeItem("email_usuario");
    localStorage.removeItem("status_usuario");
    localStorage.removeItem("dt_cadastro_usuario");
    localStorage.removeItem("funcao_usuario");
    navigate("/login");
    setMobileOpen(false);
  };

  const renderLink = (to, icon, text) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`mobile-link ${isActive ? "active" : ""}`}>
        <span className="icon">{icon}</span>
        <span className="text">{text}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="mobile-top-bar" style={{ display: window.innerWidth <= 768 ? "block" : "none" }}>
        <button className="mobile-toggle-btn" onClick={() => setMobileOpen(true)}>
          <FaBars />
        </button>
      </div>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <span className="logo-text">🍔 99Burger</span>

          <div className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {!isCozinha && !isMotoboy && (
              <>
                <li>{renderLink("/inicio", <FaHome />, "Início")}</li>

                <li>
                  <div
                    className={`menu-item-with-arrow ${openMenu === "loja" ? "active" : ""}`}
                    onClick={() => toggleMenu("loja")}
                  >
                    <div className="menu-item">
                      <span className="icon"><FaStore /></span>
                      <span className="text">Gerenciar Loja</span>
                    </div>
                    <FaChevronDown className={`arrow ${openMenu === "loja" ? "open" : ""}`} />
                  </div>
                  <ul className={`submenu ${openMenu === "loja" ? "open" : ""}`}>
                    <li>{renderLink("/pedidos", null, "Pedidos")}</li>
                    <li>{renderLink("/produtos", null, "Cardápio / Produtos")}</li>
                    <li>{renderLink("/clientes", null, "Clientes")}</li>
                  </ul>
                </li>

                <li>
                  <div
                    className={`menu-item-with-arrow ${openMenu === "relatorios" ? "active" : ""}`}
                    onClick={() => toggleMenu("relatorios")}
                  >
                    <div className="menu-item">
                      <span className="icon"><FaChartBar /></span>
                      <span className="text">Relatórios</span>
                    </div>
                    <FaChevronDown className={`arrow ${openMenu === "relatorios" ? "open" : ""}`} />
                  </div>
                  <ul className={`submenu ${openMenu === "relatorios" ? "open" : ""}`}>
                    <li>{renderLink("/performace", null, "Performance Geral")}</li>
                    <li>{renderLink("/vendas", null, "Vendas")}</li>
                    <li>{renderLink("/faturas", null, "Faturas")}</li>
                    <li>{renderLink("/financeiro", null, "Financeiro")}</li>
                    <li>{renderLink("/receita-despesa", null, "Receitas e Despesas")}</li>
                    <li>{renderLink("/integracoes", null, "Integrações")}</li>
                  </ul>
                </li>

                <li>{renderLink("/produto-estoque", <FaBoxOpen />, "Produtos / Estoque")}</li>
                <li>{renderLink("/fechamento-caixa", <FaCashRegister />, "Fechamento de Caixa")}</li>
                <li>{renderLink("/configuracoes", <FaCog />, "Configurações")}</li>
              </>
            )}

            {isMotoboy && (
              <li>{renderLink("/configurar-rotas", <FaMotorcycle />, "Rotas e Taxas")}</li>
            )}

            <li className="logout-section">
              <button className="mobile-link logout-link" onClick={handleLogout}>
                <span className="icon"><FaSignOutAlt /></span>
                <span className="text">Desconectar</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
