const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3001;
const path = require('path');
const fs = require('fs');

// Criar pastas de uploads se não existirem
const uploadsDir = path.join(__dirname, '../uploads');
const chamadosDir = path.join(uploadsDir, 'chamados');
const comentariosDir = path.join(uploadsDir, 'comentarios');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(chamadosDir)) {
  fs.mkdirSync(chamadosDir);
}
if (!fs.existsSync(comentariosDir)) {
  fs.mkdirSync(comentariosDir);
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar o servidor para servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
const chamadosRouter = require('./routes/chamados');
const usuariosRouter = require('./routes/usuarios');
const authRouter = require('./routes/auth');
const relatoriosRouter = require('./routes/relatorios');
const inventarioRouter = require('./routes/inventario');

app.use('/api/chamados', chamadosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/auth', authRouter);
app.use('/api/relatorios', relatoriosRouter);
app.use('/api/inventario', inventarioRouter);

// Configurar porta
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app; 