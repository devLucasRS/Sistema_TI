const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, cargo: user.cargo },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                cargo: user.cargo,
                setor: user.setor
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// Cadastro
router.post('/register', async (req, res) => {
    try {
        const { nome, email, setor, senha, cargo } = req.body;

        // Verificar se o email já existe
        const [existingUsers] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado.' });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // Inserir novo usuário
        const [result] = await pool.query(
            'INSERT INTO usuarios (nome, email, setor, senha, cargo) VALUES (?, ?, ?, ?, ?)',
            [nome, email, setor, hashedPassword, cargo || 'Usuario']
        );

        res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

module.exports = router; 