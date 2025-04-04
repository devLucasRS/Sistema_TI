const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const chamadosRouter = require('./routes/chamados');
const usuariosRouter = require('./routes/usuarios');
const inventarioRouter = require('./routes/inventario');

app.use('/api/chamados', chamadosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/inventario', inventarioRouter);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Configurar porta
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 