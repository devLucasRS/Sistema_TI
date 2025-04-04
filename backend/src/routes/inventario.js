const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Middleware para verificar se o usuário é técnico ou administrador
const verificarPermissao = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.cargo === 'Tecnico' || decoded.cargo === 'Administrador') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ message: 'Acesso negado. Apenas técnicos e administradores podem acessar.' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

// Cadastrar novo equipamento
router.post('/', verificarPermissao, async (req, res) => {
    try {
        const { equipamento, modelo, numero_serie, portador_id, estado, observacao } = req.body;

        // Verificar se o número de série já existe
        if (numero_serie) {
            const [existingEquip] = await pool.query(
                'SELECT id FROM equipamentos WHERE numero_serie = ?',
                [numero_serie]
            );
            if (existingEquip.length > 0) {
                return res.status(400).json({ message: 'Número de série já cadastrado.' });
            }
        }

        // Inserir equipamento
        const [result] = await pool.query(
            'INSERT INTO equipamentos (equipamento, modelo, numero_serie, portador_id, estado, observacao) VALUES (?, ?, ?, ?, ?, ?)',
            [equipamento, modelo, numero_serie, portador_id || null, estado, observacao]
        );

        // Se houver portador, registrar no histórico
        if (portador_id) {
            await pool.query(
                'INSERT INTO historico_equipamentos (equipamento_id, novo_portador_id, responsavel_id, observacao) VALUES (?, ?, ?, ?)',
                [result.insertId, portador_id, req.user.id, 'Cadastro inicial do equipamento']
            );
        }

        res.status(201).json({ message: 'Equipamento cadastrado com sucesso.', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar equipamento:', error);
        res.status(500).json({ message: 'Erro ao cadastrar equipamento.' });
    }
});

// Listar todos os equipamentos
router.get('/', verificarPermissao, async (req, res) => {
    try {
        const [equipamentos] = await pool.query(`
            SELECT e.*, u.nome as portador_nome
            FROM equipamentos e
            LEFT JOIN usuarios u ON e.portador_id = u.id
            ORDER BY e.data_cadastro DESC
        `);
        res.json(equipamentos);
    } catch (error) {
        console.error('Erro ao listar equipamentos:', error);
        res.status(500).json({ message: 'Erro ao listar equipamentos.' });
    }
});

// Buscar equipamento por ID
router.get('/:id', verificarPermissao, async (req, res) => {
    try {
        const [equipamento] = await pool.query(`
            SELECT e.*, u.nome as portador_nome
            FROM equipamentos e
            LEFT JOIN usuarios u ON e.portador_id = u.id
            WHERE e.id = ?
        `, [req.params.id]);

        if (equipamento.length === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado.' });
        }

        // Buscar histórico do equipamento
        const [historico] = await pool.query(`
            SELECT h.*, 
                   u1.nome as portador_anterior_nome,
                   u2.nome as novo_portador_nome,
                   u3.nome as responsavel_nome
            FROM historico_equipamentos h
            LEFT JOIN usuarios u1 ON h.portador_anterior_id = u1.id
            LEFT JOIN usuarios u2 ON h.novo_portador_id = u2.id
            LEFT JOIN usuarios u3 ON h.responsavel_id = u3.id
            WHERE h.equipamento_id = ?
            ORDER BY h.data_movimentacao DESC
        `, [req.params.id]);

        res.json({
            equipamento: equipamento[0],
            historico
        });
    } catch (error) {
        console.error('Erro ao buscar equipamento:', error);
        res.status(500).json({ message: 'Erro ao buscar equipamento.' });
    }
});

// Atualizar equipamento
router.put('/:id', verificarPermissao, async (req, res) => {
    try {
        const { equipamento, modelo, numero_serie, portador_id, estado, observacao } = req.body;
        const equipamentoId = req.params.id;

        // Verificar se o equipamento existe
        const [existingEquip] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [equipamentoId]);
        if (existingEquip.length === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado.' });
        }

        // Verificar se o novo número de série já existe em outro equipamento
        if (numero_serie && numero_serie !== existingEquip[0].numero_serie) {
            const [duplicateSerial] = await pool.query(
                'SELECT id FROM equipamentos WHERE numero_serie = ? AND id != ?',
                [numero_serie, equipamentoId]
            );
            if (duplicateSerial.length > 0) {
                return res.status(400).json({ message: 'Número de série já cadastrado em outro equipamento.' });
            }
        }

        // Atualizar equipamento
        await pool.query(
            'UPDATE equipamentos SET equipamento = ?, modelo = ?, numero_serie = ?, portador_id = ?, estado = ?, observacao = ? WHERE id = ?',
            [equipamento, modelo, numero_serie, portador_id, estado, observacao, equipamentoId]
        );

        // Se houve mudança de portador, registrar no histórico
        if (portador_id !== existingEquip[0].portador_id) {
            await pool.query(
                'INSERT INTO historico_equipamentos (equipamento_id, portador_anterior_id, novo_portador_id, responsavel_id, observacao) VALUES (?, ?, ?, ?, ?)',
                [equipamentoId, existingEquip[0].portador_id, portador_id, req.user.id, 'Atualização de portador']
            );
        }

        res.json({ message: 'Equipamento atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ message: 'Erro ao atualizar equipamento.' });
    }
});

// Excluir equipamento
router.delete('/:id', verificarPermissao, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM equipamentos WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado.' });
        }

        res.json({ message: 'Equipamento excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        res.status(500).json({ message: 'Erro ao excluir equipamento.' });
    }
});

module.exports = router; 