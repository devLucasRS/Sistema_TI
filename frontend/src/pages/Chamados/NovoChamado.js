import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const NovoChamado = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assunto: '',
    categoria: '',
    descricao: '',
    anexo: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      anexo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('solicitante_id', user.id);
      formDataToSend.append('assunto', formData.assunto);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('descricao', formData.descricao);
      if (formData.anexo) {
        formDataToSend.append('anexo', formData.anexo);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chamados`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Resposta do servidor:', response.data);
      navigate('/chamados/meus');
    } catch (error) {
      console.error('Erro completo:', error);
      setError(error.response?.data?.message || 'Erro ao criar chamado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-wrapper">
        <Navbar user={user} />
        <div className="content-wrapper">
          <div className="novo-chamado-container">
            <div className="novo-chamado-header">
              <h1>Abrir Chamado</h1>
              <span className="chamado-numero">INC00001</span>
            </div>

            <form onSubmit={handleSubmit} className="novo-chamado-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Solicitante</label>
                  <input
                    type="text"
                    value={user?.nome || ''}
                    disabled
                    className="form-control disabled"
                  />
                </div>
                <div className="form-group">
                  <label>Setor</label>
                  <input
                    type="text"
                    value={user?.setor || ''}
                    disabled
                    className="form-control disabled"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assunto">Assunto</label>
                  <input
                    type="text"
                    id="assunto"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoria">Categoria</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="rede">Rede</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição do chamado</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="form-control"
                  rows="5"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="anexo">Anexo</label>
                <input
                  type="file"
                  id="anexo"
                  name="anexo"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Enviando...' : 'Abrir Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovoChamado; 