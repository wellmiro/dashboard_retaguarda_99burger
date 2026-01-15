import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaStore, FaChartBar, FaFileInvoiceDollar,
  FaBoxOpen, FaCashRegister, FaCog, FaBars, FaSignOutAlt, FaChevronDown
} from "react-icons/fa";
import { MdOutlineDns } from "react-icons/md";
import "./Styles.css";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openSubmenu, setOpenSubmenu] = React.useState(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);
  
  // Usamos useCallback para otimizar o handleSubmenuClick
  const handleSubmenuClick = useCallback((menu) =>
    setOpenSubmenu(openSubmenu === menu ? null : menu), [openSubmenu]);

  const handleLogout = () => {
    localStorage.removeItem("id_usuario");
    localStorage.removeItem("nome_usuario");
    navigate("/login");
    setMobileOpen(false);
  };

  // Funçao de navegação corrigida com setTimeout e useCallback
  const goTo = useCallback((path) => {
    navigate(path);

    // Lógica para Desktop (imediata)
    if (window.innerWidth >= 769) {
      if (isCollapsed) {
        setIsCollapsed(false);
      }
      setOpenSubmenu(null); 
    } 
    
    // Lógica para Mobile (com atraso - ESSENCIAL)
    else {
      setTimeout(() => {
        setMobileOpen(false); // Fecha o menu mobile após a navegação
        setOpenSubmenu(null); // Fecha o submenu
      }, 100); 
    }
    
  }, [navigate, isCollapsed, setIsCollapsed]);

  const gerenciarAtivo = ['/pedidos', '/performace', '/faturas'].some(path =>
    location.pathname.startsWith(path)
  );
  const relatoriosAtivo = ['/vendas', '/estoque', '/financeiro'].some(path =>
    location.pathname.startsWith(path)
  );

  const gerenciarAberto = openSubmenu === "gerenciarLoja" || gerenciarAtivo;
  const relatoriosAberto = openSubmenu === "relatorios" || relatoriosAtivo;

  const renderLink = (path, icon, text, isSubItem = false) => {
    let isActive = location.pathname === path;
    if (path !== '/' && location.pathname.startsWith(path)) {
      isActive = true;
    }

    // A classe `submenu-item` é nova para dar um estilo diferente
    const itemClass = isSubItem ? "mobile-link submenu-item" : "mobile-link";

    return (
      <button
        onClick={() => goTo(path)}
        className={isActive ? `${itemClass} active` : itemClass}
      >
        {icon && <span className="icon">{icon}</span>}
        <span className="text">{text}</span>
      </button>
    );
  };

  return (
    <>
      <div className="mobile-top-bar">
        <button className="mobile-toggle-btn" onClick={toggleMobileSidebar}>
          <FaBars />
        </button>
      </div>

      {/* Usando uma nova classe para o header do sidebar */}
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
             <span className="logo-text">Dashboard</span> {/* Título ou Logo */}
            <div className="toggle-button" onClick={toggleSidebar}>
              <FaBars />
            </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>{renderLink("/", <FaHome />, "Início")}</li>

            <li className="menu-group">
              <div
                className={`menu-item-with-arrow ${gerenciarAberto ? "active" : ""}`}
                onClick={() => handleSubmenuClick("gerenciarLoja")}
              >
                <div className="menu-item">
                  <span className="icon"><FaStore /></span>
                  <span className="text">Gerenciar Loja</span>
                </div>
                <span className={`arrow ${gerenciarAberto ? "open" : ""}`}><FaChevronDown /></span>
              </div>
              <ul className={`submenu ${gerenciarAberto ? "open" : ""}`}>
                <li>{renderLink("/pedidos", <MdOutlineDns />, "Pedidos", true)}</li>
                <li>{renderLink("/performace", <FaChartBar />, "Performance", true)}</li>
                <li>{renderLink("/faturas", <FaFileInvoiceDollar />, "Faturas", true)}</li>
              </ul>
            </li>

            <li className="menu-group">
              <div
                className={`menu-item-with-arrow ${relatoriosAberto ? "active" : ""}`}
                onClick={() => handleSubmenuClick("relatorios")}
              >
                <div className="menu-item">
                  <span className="icon"><FaFileInvoiceDollar /></span>
                  <span className="text">Relatórios</span>
                </div>
                <span className={`arrow ${relatoriosAberto ? "open" : ""}`}><FaChevronDown /></span>
              </div>
              <ul className={`submenu ${relatoriosAberto ? "open" : ""}`}>
                <li>{renderLink("/vendas", null, "Vendas", true)}</li>
                <li>{renderLink("/estoque", null, "Estoque", true)}</li>
                <li>{renderLink("/financeiro", null, "Financeiro", true)}</li>
              </ul>
            </li>

            <li>{renderLink("/produto-estoque", <FaBoxOpen />, "Produtos / Estoque")}</li>
            <li>{renderLink("/fechamento-caixa", <FaCashRegister />, "Fechamento de Caixa")}</li>
            <li>{renderLink("/configuracoes", <FaCog />, "Configurações")}</li>

            <li className="logout-section">
              <button className="logout-link" onClick={handleLogout}>
                <span className="icon"><FaSignOutAlt /></span>
                <span className="text">Desconectar</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {mobileOpen && <div className="sidebar-overlay" onClick={toggleMobileSidebar}></div>}
    </>
  );
}

export default Sidebar;