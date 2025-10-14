// src/components/dashboard/sidebar/Sidebar.js
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaStore, FaChartBar, FaFileInvoiceDollar,
  FaBoxOpen, FaCashRegister, FaCog, FaBars, FaSignOutAlt
} from 'react-icons/fa';
import { MdOutlineDns } from "react-icons/md";
import './Styles.css';

function Sidebar({ isCollapsed, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = React.useState(null);

  // Função para abrir/fechar submenu
  const handleSubmenuClick = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem("id_usuario");
    localStorage.removeItem("nome_usuario");
    navigate("/login");
  };

  // Detecta se alguma rota está ativa para manter submenu aberto
  const gerenciarAtivo = ['/pedidos', '/performace', '/faturas'].some(path => location.pathname.startsWith(path));
  const relatoriosAtivo = ['/vendas', '/estoque', '/financeiro'].some(path => location.pathname.startsWith(path));

  const gerenciarAberto = openSubmenu === 'gerenciarLoja' || gerenciarAtivo;
  const relatoriosAberto = openSubmenu === 'relatorios' || relatoriosAtivo;

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botão toggle */}
      <div className="toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaHome /></span>
              <span className="text">Início</span>
            </NavLink>
          </li>

          {/* Gerenciar Loja */}
          <li>
            <div
              className={`menu-item-with-arrow ${gerenciarAberto ? 'active' : ''}`}
              onClick={() => handleSubmenuClick('gerenciarLoja')}
            >
              <div className="menu-item">
                <span className="icon"><FaStore /></span>
                <span className="text">Gerenciar Loja</span>
              </div>
              <span className="arrow">{gerenciarAberto ? '▲' : '▼'}</span>
            </div>
            <ul className={`submenu ${gerenciarAberto ? 'open' : ''}`}>
              <li>
                <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="text"><MdOutlineDns /> Pedidos</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/performace" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="text"><FaChartBar /> Performance Geral</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/faturas" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="text"><FaFileInvoiceDollar /> Faturas</span>
                </NavLink>
              </li>
            </ul>
          </li>

          {/* Relatórios */}
          <li>
            <div
              className={`menu-item-with-arrow ${relatoriosAberto ? 'active' : ''}`}
              onClick={() => handleSubmenuClick('relatorios')}
            >
              <div className="menu-item">
                <span className="icon"><FaFileInvoiceDollar /></span>
                <span className="text">Relatórios</span>
              </div>
              <span className="arrow">{relatoriosAberto ? '▲' : '▼'}</span>
            </div>
            <ul className={`submenu ${relatoriosAberto ? 'open' : ''}`}>
              <li>
                <NavLink to="/vendas" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="text">Vendas</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/estoque" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="text">Estoque</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/financeiro" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="text">Financeiro</span>
                </NavLink>
              </li>
            </ul>
          </li>

          {/* Produtos / Estoque */}
          <NavLink to="/produto-estoque" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="icon"><FaBoxOpen /></span>
            <span className="text">Produtos / Estoque</span>
          </NavLink>

          <li>
            <NavLink to="/fechamento-caixa" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaCashRegister /></span>
              <span className="text">Fechamento de Caixa</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/configuracoes" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaCog /></span>
              <span className="text">Configurações</span>
            </NavLink>
          </li>

          {/* 🚪 Desconectar */}
          <li>
            <button className="logout-link" onClick={handleLogout}>
              <span className="icon"><FaSignOutAlt /></span>
              <span className="text">Desconectar</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
