import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="page-title">
          <h1>Sistema</h1>
          <span className="breadcrumb">Tecnologia da Informação</span>
        </div>

        <div className="navbar-actions">
          <div className="notifications">
            <button className="icon-button">
              <NotificationsIcon />
              <span className="badge">2</span>
            </button>
          </div>

          <div className="user-menu">
            <div className="user-info">
              <span className="welcome">Bem-vindo,</span>
              <span className="user-name">{user?.nome}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <LogoutIcon />
              <span className="text">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 