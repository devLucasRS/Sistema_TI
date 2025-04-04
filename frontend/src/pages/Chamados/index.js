import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, Save, ArrowBack } from '@mui/icons-material';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import './styles.css';

const NovoChamado = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        categoria: '',
        prioridade: 'media',
        anexos: []
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/chamados', formData);
            setSuccess('Chamado aberto com sucesso!');
            setFormData({
                titulo: '',
                descricao: '',
                categoria: '',
                prioridade: 'media',
                anexos: []
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao abrir chamado');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="app-container">
            <Sidebar user={user} />
            <div className="main-wrapper">
                <Navbar 
                    user={user}
                    pageTitle="Abrir Novo Chamado"
                    breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Chamados', path: '/chamados/meus' },
                        { label: 'Novo Chamado', path: '/chamados/novo' }
                    ]}
                />
                <div className="content-wrapper">
                    <div className="page-header">
                        <Assignment />
                        <div className="header-content">
                            <h1>Abrir Novo Chamado</h1>
                            <span className="subtitle">Preencha os dados do chamado</span>
                        </div>
                    </div>

                    <div className="novo-chamado-container">
                        <h2>
                            <Assignment />
                            Informações do Chamado
                        </h2>

                        {error && (
                            <div className="error-message">
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="success-message">
                                <span>{success}</span>
                            </div>
                        )}

                        <form className="novo-chamado-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="titulo">Título</label>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="prioridade">Prioridade</label>
                                    <select
                                        id="prioridade"
                                        name="prioridade"
                                        value={formData.prioridade}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="baixa">Baixa</option>
                                        <option value="media">Média</option>
                                        <option value="alta">Alta</option>
                                        <option value="urgente">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="descricao">Descrição</label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => navigate('/chamados/meus')}
                                >
                                    <ArrowBack style={{ marginRight: '8px' }} />
                                    Voltar
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save style={{ marginRight: '8px' }} />
                                    Abrir Chamado
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