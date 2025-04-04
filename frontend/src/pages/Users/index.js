import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import UserForm from '../../components/UserForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import { Tooltip } from '@mui/material';

const Users = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setError('');
    } catch (error) {
      setError('Não foi possível carregar os usuários. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        setDeleteLoading(userId);
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/usuarios/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        setError('Erro ao excluir usuário. Por favor, tente novamente.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchUsers();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.setor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="loading-container">
        <CircularProgress size={24} />
        <span>Carregando...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-wrapper">
        <Navbar 
          user={user}
          pageTitle="Usuários"
          breadcrumbs={[
            { label: 'Home', path: '/dashboard' },
            { label: 'Usuários', path: '/usuarios' }
          ]}
        />
        <div className="content-wrapper">
          <div className="page-header">
            <div className="header-content">
              <h1>Usuários</h1>
              <p className="subtitle">Gerencie os usuários do sistema</p>
            </div>
            
          </div>

          <div className="search-bar">
            <div className="search-input-wrapper">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="add-button" onClick={handleAddUser}>
              <PersonAddIcon />
            </button>
          </div>

          {error && (
            <div className="error-message">
              <ErrorOutlineIcon />
              {error}
            </div>
          )}

          <div className="users-table-card">
            <div className="table-responsive">
              {loading ? (
                <div className="loading-container">
                  <CircularProgress size={24} />
                  <span>Carregando usuários...</span>
                </div>
              ) : filteredUsers.length > 0 ? (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Setor</th>
                      <th>Cargo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.nome}</td>
                        <td>{u.email}</td>
                        <td>{u.setor}</td>
                        <td>
                          <span className={`role-badge ${u.cargo.toLowerCase()}`}>
                            {u.cargo}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Tooltip title="Editar usuário">
                              <button
                                onClick={() => handleEditUser(u)}
                                className="edit-button"
                                disabled={deleteLoading === u.id}
                              >
                                <EditIcon />
                              </button>
                            </Tooltip>
                            <Tooltip title="Excluir usuário">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="delete-button"
                                disabled={deleteLoading === u.id}
                              >
                                {deleteLoading === u.id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  <DeleteIcon />
                                )}
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <PeopleOutlineIcon />
                  <h3>Nenhum usuário encontrado</h3>
                  <p>
                    {searchTerm
                      ? 'Nenhum usuário corresponde aos critérios de busca.'
                      : 'Não há usuários cadastrados no sistema.'}
                  </p>
                  <button className="add-button" onClick={handleAddUser}>
                    <PersonAddIcon />
                    <span>Adicionar Usuário</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Users; 