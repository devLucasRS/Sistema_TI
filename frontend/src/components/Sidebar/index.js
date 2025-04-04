import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.css';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ComputerIcon from '@mui/icons-material/Computer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import InventoryIcon from '@mui/icons-material/Inventory';
import DevicesIcon from '@mui/icons-material/Devices';

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      allowedRoles: ['Administrador', 'Tecnico', 'Usuario']
    },
    {
      path: '/usuarios',
      icon: <PeopleIcon />,
      label: 'Usuários',
      allowedRoles: ['Administrador']
    },
    {
      id: 'chamados',
      icon: <ConfirmationNumberIcon />,
      label: 'Chamados',
      allowedRoles: ['Administrador', 'Tecnico', 'Usuario'],
      submenu: [
        {
          path: '/chamados/novo',
          icon: <AddIcon />,
          label: 'Abrir Chamado',
          allowedRoles: ['Administrador', 'Tecnico', 'Usuario']
        },
        {
          path: '/chamados/meus',
          icon: <ListAltIcon />,
          label: 'Meus Chamados',
          allowedRoles: ['Administrador', 'Tecnico', 'Usuario']
        },
        {
          path: '/chamados/gestao',
          icon: <ManageSearchIcon />,
          label: 'Gestão de Chamados',
          allowedRoles: ['Administrador', 'Tecnico']
        }
      ]
    },
    {
      id: 'inventario',
      icon: <InventoryIcon />,
      label: 'Controle Inventário',
      allowedRoles: ['Administrador', 'Tecnico'],
      submenu: [
        {
          path: '/inventario/cadastrar',
          icon: <AddIcon />,
          label: 'Cadastrar Equipamento',
          allowedRoles: ['Administrador', 'Tecnico']
        },
        {
          path: '/inventario/gestao',
          icon: <DevicesIcon />,
          label: 'Gestão de Inventário',
          allowedRoles: ['Administrador', 'Tecnico']
        }
      ]
    },
    {
      path: '/relatorios',
      icon: <AssessmentIcon />,
      label: 'Relatórios',
      allowedRoles: ['Administrador', 'Tecnico']
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      setOpenSubmenu(null);
    }
  };

  const toggleSubmenu = (menuId) => {
    if (isCollapsed) return;
    setOpenSubmenu(openSubmenu === menuId ? null : menuId);
  };

  const renderMenuItem = (item) => {
    if (!item.allowedRoles.includes(user?.cargo)) {
      return null;
    }

    if (item.submenu) {
      const hasAllowedSubmenuItems = item.submenu.some(subItem => 
        subItem.allowedRoles.includes(user?.cargo)
      );

      if (!hasAllowedSubmenuItems) {
        return null;
      }

      return (
        <div key={item.id}>
          <div
            className={`menu-item with-submenu ${openSubmenu === item.id ? 'active' : ''}`}
            onClick={() => toggleSubmenu(item.id)}
          >
            <div className="menu-item-content">
              <span className="menu-icon">{item.icon}</span>
              {!isCollapsed && <span className="menu-label">{item.label}</span>}
            </div>
            {!isCollapsed && (
              <span className="menu-icon">
                {openSubmenu === item.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </span>
            )}
          </div>
          <div className={`submenu ${openSubmenu === item.id ? 'open' : ''}`}>
            {item.submenu.map((subItem) => {
              if (subItem.allowedRoles.includes(user?.cargo)) {
                return (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                  >
                    <span className="menu-icon">{subItem.icon}</span>
                    {!isCollapsed && <span>{subItem.label}</span>}
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
      >
        <span className="menu-icon">{item.icon}</span>
        {!isCollapsed && <span className="menu-label">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon"><ComputerIcon /></span>
          {!isCollapsed && <span className="logo-text">Sistema Tec</span>}
        </div>
        <button className="collapse-btn" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map(renderMenuItem)}
      </div>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{user?.nome}</div>
            <div className="user-role">{user?.cargo}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 