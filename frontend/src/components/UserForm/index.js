import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import CloseIcon from '@mui/icons-material/Close';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    setor: '',
    senha: '',
    cargo: 'Usuario'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        setor: user.setor,
        cargo: user.cargo,
        senha: '' // Senha não é preenchida na edição
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (user) {
        // Edição de usuário
        const dataToSend = { ...formData };
        if (!dataToSend.senha) delete dataToSend.senha;
        
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/usuarios/${user.id}`,
          dataToSend,
          { headers }
        );
      } else {
        // Novo usuário
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/register`,
          formData,
          { headers }
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Ocorreu um erro ao salvar o usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button onClick={onClose} className="close-button">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setor">Setor</label>
            <input
              type="text"
              id="setor"
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha {user && '(deixe em branco para manter a atual)'}</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required={!user}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cargo">Cargo</label>
            <select
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            >
              <option value="Usuario">Usuário</option>
              <option value="Tecnico">Técnico</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Salvando...' : user ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 