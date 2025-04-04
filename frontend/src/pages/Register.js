import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    setor: '',
    senha: '',
    cargo: 'Usuario'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, formData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
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
            <label htmlFor="email">Email:</label>
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
            <label htmlFor="setor">Setor:</label>
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
            <label htmlFor="senha">Senha:</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cargo">Cargo:</label>
            <select
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
            >
              <option value="Usuario">Usuário</option>
              <option value="Tecnico">Técnico</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          <button type="submit">Registrar</button>
        </form>
        <p>
          Já tem uma conta? <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default Register; 