const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Listar todos os usuários (apenas Administrador)
router.get('/', auth, checkRole(['Administrador']), async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, nome, email, setor, cargo FROM usuarios');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// Obter usuário por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, nome, email, setor, cargo FROM usuarios WHERE id = ?', [req.params.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// Atualizar usuário (apenas Administrador)
router.put('/:id', auth, checkRole(['Administrador']), async (req, res) => {
    try {
        const { nome, email, setor, cargo, senha } = req.body;
        
        // Verificar se o email já existe para outro usuário
        const [existingUsers] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [email, req.params.id]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email já está em uso por outro usuário.' });
        }

        if (senha) {
            // Se a senha foi fornecida, atualiza com a nova senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);
            
            await pool.query(
                'UPDATE usuarios SET nome = ?, email = ?, setor = ?, cargo = ?, senha = ? WHERE id = ?',
                [nome, email, setor, cargo, hashedPassword, req.params.id]
            );
        } else {
            // Se a senha não foi fornecida, atualiza sem alterar a senha
            await pool.query(
                'UPDATE usuarios SET nome = ?, email = ?, setor = ?, cargo = ? WHERE id = ?',
                [nome, email, setor, cargo, req.params.id]
            );
        }

        res.json({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// Deletar usuário (apenas Administrador)
router.delete('/:id', auth, checkRole(['Administrador']), async (req, res) => {
    try {
        await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

module.exports = router; 