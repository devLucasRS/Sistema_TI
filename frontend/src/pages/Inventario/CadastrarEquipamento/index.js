import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Computer, Save, ArrowBack } from '@mui/icons-material';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import Navbar from '../../../components/Navbar';
import './styles.css';

const CadastrarEquipamento = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({
        equipamento: '',
        modelo: '',
        numero_serie: '',
        estado: 'Novo',
        portador_id: '',
        observacao: '',
        status: 'Disponível'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            
            // Se o campo alterado for portador_id
            if (name === 'portador_id') {
                // Se o portador estiver vazio
                if (!value.trim()) {
                    newData.portador_id = null;
                    newData.status = 'Disponível';
                } else {
                    newData.status = 'Em uso';
                }
            }
            
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/inventario', formData);
            setSuccess('Equipamento cadastrado com sucesso!');
            setFormData({
                equipamento: '',
                modelo: '',
                numero_serie: '',
                estado: 'Novo',
                portador_id: null,
                observacao: '',
                status: 'Disponível'
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao cadastrar equipamento');
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
                    pageTitle="Cadastrar Equipamento"
                    breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Inventário', path: '/inventario/gestao' },
                        { label: 'Cadastrar Equipamento', path: '/inventario/cadastrar' }
                    ]}
                />
                <div className="content-wrapper">
                    <div className="page-header">
                        <Computer />
                        <div className="header-content">
                            <h1>Cadastrar Equipamento</h1>
                            <p className="subtitle">Preencha os dados do equipamento</p>
                        </div>
                    </div>

                    <div className="form-container">
                        <div className="form-header">
                            <Computer />
                            <h2>Informações do Equipamento</h2>
                        </div>

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

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="equipamento">Equipamento</label>
                                    <input
                                        type="text"
                                        id="equipamento"
                                        name="equipamento"
                                        value={formData.equipamento}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modelo">Modelo</label>
                                    <input
                                        type="text"
                                        id="modelo"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="numero_serie">Número de Série</label>
                                    <input
                                        type="text"
                                        id="numero_serie"
                                        name="numero_serie"
                                        value={formData.numero_serie}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="estado">Estado</label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Novo">Novo</option>
                                        <option value="Bom">Bom</option>
                                        <option value="Regular">Regular</option>
                                        <option value="Ruim">Ruim</option>
                                        <option value="Manutenção">Manutenção</option>
                                        <option value="Descartado">Descartado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="portador_id">Portador</label>
                                    <select
                                        id="portador_id"
                                        name="portador_id"
                                        value={formData.portador_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecione um portador</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        disabled
                                    >
                                        <option value="Disponível">Disponível</option>
                                        <option value="Em uso">Em uso</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="observacao">Observações</label>
                                    <textarea
                                        id="observacao"
                                        name="observacao"
                                        value={formData.observacao || ''}
                                        onChange={handleChange}
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => navigate('/inventario/gestao')}
                                >
                                    <ArrowBack style={{ marginRight: '8px' }} />
                                    Voltar
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save style={{ marginRight: '8px' }} />
                                    Cadastrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CadastrarEquipamento; 