import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { 
  Visibility,
  Subject,
  Category,
  AccessTime,
  Update,
  Description,
  CheckCircleOutline,
  Close,
  Person,
  Send,
  SupportAgent,
  Assignment,
  CheckCircle,
  HourglassEmpty,
  Warning,
  Download,
  Chat,
  Schedule,
  PlayArrow,
  Stop,
  AttachFile,
  Image,
  PictureAsPdf,
  VideoLibrary
} from '@mui/icons-material';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Box,
  Button
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import './styles.css';

const GestaoChamados = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    atendidos: 0,
    aguardando: 0,
    slaEstourado: 0
  });
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [loadingAtendimento, setLoadingAtendimento] = useState(false);
  const [loadingFinalizacao, setLoadingFinalizacao] = useState(false);
  const [anexosSelecionados, setAnexosSelecionados] = useState([]);
  const fileInputRef = useRef(null);

  // Estados para os filtros
  const [filtros, setFiltros] = useState({
    numero: '',
    assunto: '',
    categoria: '',
    solicitante: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    sla: ''
  });

  // Adicionar estado para a modal de finalização
  const [modalFinalizacao, setModalFinalizacao] = useState(false);
  const [acaoTomada, setAcaoTomada] = useState('');

  useEffect(() => {
    fetchChamados();
  }, []);

  const fetchChamados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chamados/gestao`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const chamados = Array.isArray(response.data) ? response.data : [];
      setChamados(chamados);
      
      // Calcular estatísticas
      const total = chamados.length;
      const atendidos = chamados.filter(c => c.status.toLowerCase() === 'fechado').length;
      const aguardando = chamados.filter(c => c.status.toLowerCase() === 'aberto').length;
      const slaEstourado = chamados.filter(c => c.sla_estourado === 1).length;

      setStats({
        total,
        atendidos,
        aguardando,
        slaEstourado
      });

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      setError('Não foi possível carregar os chamados. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const handleViewChamado = async (chamado) => {
    setChamadoSelecionado(chamado);
    setModalOpen(true);
    setLoadingComentarios(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chamados/${chamado.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setChamadoSelecionado(response.data);
      setComentarios(response.data.comentarios || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes do chamado:', error);
      setError('Não foi possível carregar os detalhes do chamado');
    } finally {
      setLoadingComentarios(false);
    }
  };

  const handleAdicionarComentario = async () => {
    if (!novoComentario.trim() && anexosSelecionados.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('texto', novoComentario);
      
      // Adiciona os anexos ao FormData
      anexosSelecionados.forEach(file => {
        formData.append('anexos', file);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chamados/${chamadoSelecionado.id}/comentarios`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Adiciona o novo comentário à lista
      setComentarios(prev => [...prev, response.data]);
      setNovoComentario('');
      setAnexosSelecionados([]);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      if (error.response?.status === 403) {
        alert('Você não tem permissão para comentar neste chamado.');
      } else {
        alert('Erro ao adicionar comentário. Tente novamente.');
      }
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAnexosSelecionados(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAnexosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image />;
    if (type.startsWith('video/')) return <VideoLibrary />;
    if (type === 'application/pdf') return <PictureAsPdf />;
    return <AttachFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'aberto':
        return <CheckCircleOutline style={{ fontSize: 18 }} />;
      case 'em-andamento':
        return <Update style={{ fontSize: 18 }} />;
      case 'fechado':
        return <Close style={{ fontSize: 18 }} />;
      default:
        return null;
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filtrarChamados = () => {
    return chamados.filter(chamado => {
      const matchNumero = !filtros.numero || chamado.id.toString().padStart(5, '0').toLowerCase().includes(filtros.numero.toLowerCase());
      const matchAssunto = !filtros.assunto || chamado.assunto.toLowerCase().includes(filtros.assunto.toLowerCase());
      const matchCategoria = !filtros.categoria || chamado.categoria.toLowerCase() === filtros.categoria.toLowerCase();
      const matchSolicitante = !filtros.solicitante || chamado.solicitante.toLowerCase().includes(filtros.solicitante.toLowerCase());
      const matchStatus = !filtros.status || chamado.status.toLowerCase() === filtros.status.toLowerCase();
      const matchSLA = !filtros.sla || (filtros.sla === 'estourado' && chamado.sla_estourado === 1) || (filtros.sla === 'ok' && chamado.sla_estourado === 0);
      
      let matchData = true;
      if (filtros.dataInicio && filtros.dataFim) {
        const dataChamado = new Date(chamado.data_abertura);
        const dataInicio = new Date(filtros.dataInicio);
        const dataFim = new Date(filtros.dataFim);
        matchData = dataChamado >= dataInicio && dataChamado <= dataFim;
      }

      return matchNumero && matchAssunto && matchCategoria && matchSolicitante && matchStatus && matchSLA && matchData;
    });
  };

  const exportarParaExcel = () => {
    const chamadosFiltrados = filtrarChamados();
    const dadosParaExportar = chamadosFiltrados.map(chamado => ({
      'Número': `#${chamado.id.toString().padStart(5, '0')}`,
      'Assunto': chamado.assunto,
      'Categoria': chamado.categoria,
      'Solicitante': chamado.solicitante,
      'Status': chamado.status,
      'Data de Abertura': format(new Date(chamado.data_abertura), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'SLA': chamado.sla_estourado === 1 ? 'Estourado' : 'OK'
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chamados');
    XLSX.writeFile(wb, 'chamados.xlsx');
  };

  const handleIniciarAtendimento = async (chamadoId) => {
    try {
      setLoadingAtendimento(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chamados/${chamadoId}/iniciar-atendimento`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Atualiza a lista de chamados
      await fetchChamados();
      alert('Atendimento iniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      if (error.response?.status === 403) {
        alert('Você não tem permissão para iniciar o atendimento deste chamado.');
      } else {
        alert('Erro ao iniciar atendimento. Tente novamente.');
      }
    } finally {
      setLoadingAtendimento(false);
    }
  };

  const handleFinalizarAtendimento = async () => {
    if (!acaoTomada.trim()) {
      alert('Por favor, descreva a ação tomada para finalizar o atendimento');
      return;
    }

    try {
      await axios.post(`/api/chamados/${chamadoSelecionado.id}/finalizar-atendimento`, 
        { acao_tomada: acaoTomada },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setModalFinalizacao(false);
      setAcaoTomada('');
      setModalOpen(false);
      fetchChamados();
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      alert(error.response?.data?.message || 'Erro ao finalizar atendimento');
    }
  };

  const handleReabrirChamado = async () => {
    try {
      await axios.post(`/api/chamados/${chamadoSelecionado.id}/reabrir`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setModalOpen(false);
      fetchChamados();
    } catch (error) {
      console.error('Erro ao reabrir chamado:', error);
      alert(error.response?.data?.message || 'Erro ao reabrir chamado');
    }
  };

  const chamadosFiltrados = filtrarChamados();

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-wrapper">
        <Navbar user={user} />
        <div className="content-wrapper">
          <div className="gestao-chamados-container">
            <div className="gestao-chamados-header">
              <h1>Gestão de Chamados</h1>
            </div>

            <div className="stats-cards">
              <div className="stat-card total">
                <div className="stat-icon">
                  <Assignment />
                </div>
                <div className="stat-info">
                  <h3>Total de Chamados</h3>
                  <span className="stat-value">{stats.total}</span>
                </div>
              </div>

              <div className="stat-card atendidos">
                <div className="stat-icon">
                  <CheckCircle />
                </div>
                <div className="stat-info">
                  <h3>Chamados Atendidos</h3>
                  <span className="stat-value">{stats.atendidos}</span>
                </div>
              </div>

              <div className="stat-card aguardando">
                <div className="stat-icon">
                  <HourglassEmpty />
                </div>
                <div className="stat-info">
                  <h3>Aguardando Atendimento</h3>
                  <span className="stat-value">{stats.aguardando}</span>
                </div>
              </div>

              <div className="stat-card sla">
                <div className="stat-icon">
                  <Warning />
                </div>
                <div className="stat-info">
                  <h3>SLA Estourado</h3>
                  <span className="stat-value">{stats.slaEstourado}</span>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filtros */}
            <Card className="filtros-card">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Número"
                      name="numero"
                      value={filtros.numero}
                      onChange={handleFiltroChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Assunto"
                      name="assunto"
                      value={filtros.assunto}
                      onChange={handleFiltroChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Categoria"
                      name="categoria"
                      value={filtros.categoria}
                      onChange={handleFiltroChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Solicitante"
                      name="solicitante"
                      value={filtros.solicitante}
                      onChange={handleFiltroChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      label="Status"
                      name="status"
                      value={filtros.status}
                      onChange={handleFiltroChange}
                      size="small"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Aberto">Aberto</MenuItem>
                      <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                      <MenuItem value="Fechado">Fechado</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      label="SLA"
                      name="sla"
                      value={filtros.sla}
                      onChange={handleFiltroChange}
                      size="small"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="ok">OK</MenuItem>
                      <MenuItem value="estourado">Estourado</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Data Início"
                      name="dataInicio"
                      value={filtros.dataInicio}
                      onChange={handleFiltroChange}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Data Fim"
                      name="dataFim"
                      value={filtros.dataFim}
                      onChange={handleFiltroChange}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Download />}
                      onClick={exportarParaExcel}
                      size="small"
                    >
                      Exportar Excel
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {loading ? (
              <div className="loading-message">Carregando chamados...</div>
            ) : chamados.length === 0 ? (
              <div className="empty-message">
                Não há chamados para exibir.
              </div>
            ) : (
              <div className="chamados-table-container">
                <TableContainer component={Paper} className="chamados-table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Assunto</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Solicitante</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Data de Abertura</TableCell>
                        <TableCell>SLA</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chamadosFiltrados.map((chamado) => (
                        <TableRow key={chamado.id} className={chamado.sla_estourado ? 'sla-estourado' : ''}>
                          <TableCell>#{chamado.id.toString().padStart(5, '0')}</TableCell>
                          <TableCell>{chamado.assunto}</TableCell>
                          <TableCell>{chamado.categoria}</TableCell>
                          <TableCell>{chamado.solicitante}</TableCell>
                          <TableCell>
                            <span className={`status-badge ${chamado.status.toLowerCase().replace(' ', '-')}`}>
                              {getStatusIcon(chamado.status)}
                              {chamado.status}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(chamado.data_abertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                          <TableCell>
                            <span className={`sla-badge ${chamado.sla_estourado === 1 ? 'estourado' : 'ok'}`}>
                              {chamado.sla_estourado === 1 ? 'Estourado' : 'OK'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="action-buttons">
                              <button 
                                className="view-button"
                                onClick={() => handleViewChamado(chamado)}
                                title="Ver detalhes"
                              >
                                <Visibility />
                              </button>
                              {chamado.status === 'Aberto' && (
                                <button 
                                  className="start-button"
                                  onClick={() => handleIniciarAtendimento(chamado.id)}
                                  title="Iniciar atendimento"
                                  disabled={loadingAtendimento}
                                >
                                  <PlayArrow />
                                </button>
                              )}
                              {(chamado.status === 'Em Andamento' || chamado.status === 'Em-Andamento') && (
                                <button 
                                  className="finish-button"
                                  onClick={() => {
                                    setChamadoSelecionado(chamado);
                                    setModalFinalizacao(true);
                                  }}
                                  title="Finalizar atendimento"
                                  disabled={loadingFinalizacao}
                                >
                                  <Stop />
                                </button>
                              )}
                              {chamado.status === 'Fechado' && (
                                <button 
                                  className="reopen-button"
                                  onClick={() => {
                                    setChamadoSelecionado(chamado);
                                    handleReabrirChamado();
                                  }}
                                  title="Reabrir chamado"
                                >
                                  <PlayArrow />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {modalOpen && chamadoSelecionado && (
              <div className="modal-overlay" onClick={() => {
                setModalOpen(false);
                setNovoComentario('');
                setComentarios([]);
              }}>
                <div className="modal-content zendesk-style" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title">
                      <h2>
                        <span>Chamado #{chamadoSelecionado.id.toString().padStart(5, '0')}</span>
                      </h2>
                      <span className={`status-badge ${chamadoSelecionado.status.toLowerCase()}`}>
                        {getStatusIcon(chamadoSelecionado.status)}
                        {chamadoSelecionado.status}
                      </span>
                    </div>
                    <button className="close-button" onClick={() => {
                      setModalOpen(false);
                      setNovoComentario('');
                      setComentarios([]);
                    }}>&times;</button>
                  </div>

                  <div className="modal-body">
                    <div className="modal-sidebar">
                      <div className="ticket-details">
                        <h3>Detalhes do Chamado</h3>
                        <div className="detail-item">
                          <Subject className="detail-icon" />
                          <div>
                            <label>Assunto</label>
                            <span>{chamadoSelecionado.assunto}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <Category className="detail-icon" />
                          <div>
                            <label>Categoria</label>
                            <span>{chamadoSelecionado.categoria}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <AccessTime className="detail-icon" />
                          <div>
                            <label>Aberto em</label>
                            <span>{format(new Date(chamadoSelecionado.data_abertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <Person className="detail-icon" />
                          <div>
                            <label>Solicitante</label>
                            <span>{chamadoSelecionado.solicitante}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <SupportAgent className="detail-icon" />
                          <div>
                            <label>Atendente</label>
                            <div className="atendente-info">
                              {chamadoSelecionado.atendente && chamadoSelecionado.atendente !== 'Aguardando atendimento' ? (
                                <>
                                  <img 
                                    src={`https://ui-avatars.com/api/?name=${chamadoSelecionado.atendente.replace(' ', '+')}&background=random`} 
                                    alt={chamadoSelecionado.atendente} 
                                    className="avatar" 
                                  />
                                  <div>
                                    <span className="nome">{chamadoSelecionado.atendente}</span>
                                    <span className="cargo">{chamadoSelecionado.cargo_atendente}</span>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <span className="nome">Aguardando atendimento</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-main">
                      <div className="ticket-description">
                        <h3>Descrição</h3>
                        <p>{chamadoSelecionado.descricao}</p>
                      </div>

                      <div className="ticket-comments">
                        <h3>
                          <Chat style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle' }} />
                          Comentários
                        </h3>
                        <div className="comments-list">
                          {loadingComentarios ? (
                            <div className="loading">Carregando comentários...</div>
                          ) : (
                            <>
                              {comentarios.map((comentario) => (
                                <div key={comentario.id} className="comment">
                                  <img src={comentario.foto} alt={comentario.autor} className="avatar" />
                                  <div className="comment-content">
                                    <div className="comment-header">
                                      <div>
                                        <span className="author">{comentario.autor}</span>
                                        <span className="role">{comentario.cargo}</span>
                                      </div>
                                      <span className="date">
                                        <Schedule style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                                        {format(new Date(comentario.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                      </span>
                                    </div>
                                    <div className="comment-text">{comentario.texto}</div>
                                    {comentario.anexos && comentario.anexos.length > 0 && (
                                      <div className="comment-attachments">
                                        {comentario.anexos.map((anexo, index) => (
                                          <a 
                                            key={anexo.id} 
                                            href={`${process.env.REACT_APP_API_URL}/${anexo.caminho_arquivo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="attachment-item"
                                          >
                                            {getFileIcon(anexo.tipo_arquivo)}
                                            <span className="attachment-name">{anexo.nome_arquivo}</span>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="novo-comentario">
                                <textarea
                                  value={novoComentario}
                                  onChange={(e) => setNovoComentario(e.target.value)}
                                  placeholder="Digite seu comentário..."
                                  rows="3"
                                />
                                <div className="comment-actions">
                                  <div className="selected-files">
                                    {anexosSelecionados.map((file, index) => (
                                      <div key={index} className="selected-file">
                                        {getFileIcon(file.type)}
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">({formatFileSize(file.size)})</span>
                                        <button onClick={() => handleRemoveFile(index)} className="remove-file">
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="comment-buttons">
                                    <button 
                                      className="attach-button"
                                      onClick={() => fileInputRef.current.click()}
                                      title="Anexar arquivos"
                                    >
                                      <AttachFile />
                                    </button>
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleFileSelect}
                                      multiple
                                      style={{ display: 'none' }}
                                    />
                                    <button 
                                      className="send-button"
                                      onClick={handleAdicionarComentario}
                                      disabled={!novoComentario.trim() && anexosSelecionados.length === 0}
                                    >
                                      <Send />
                                      Enviar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modalFinalizacao && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>Finalizar Atendimento</h2>
                  <div className="form-group">
                    <label>Ação Tomada</label>
                    <textarea
                      value={acaoTomada}
                      onChange={(e) => setAcaoTomada(e.target.value)}
                      placeholder="Descreva a ação tomada para resolver o chamado"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => setModalFinalizacao(false)}>Cancelar</button>
                    <button onClick={handleFinalizarAtendimento} className="primary">Finalizar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestaoChamados; 