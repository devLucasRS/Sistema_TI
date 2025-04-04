-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 04/04/2025 às 16:28
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sistema_tec`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `anexos_chamados`
--

CREATE TABLE `anexos_chamados` (
  `id` int(11) NOT NULL,
  `chamado_id` int(11) NOT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(255) NOT NULL,
  `tipo_arquivo` varchar(100) NOT NULL,
  `tamanho_arquivo` bigint(20) NOT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `anexos_comentarios`
--

CREATE TABLE `anexos_comentarios` (
  `id` int(11) NOT NULL,
  `comentario_id` int(11) NOT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(255) NOT NULL,
  `tipo_arquivo` varchar(100) NOT NULL,
  `tamanho_arquivo` bigint(20) NOT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `anexos_comentarios`
--

INSERT INTO `anexos_comentarios` (`id`, `comentario_id`, `nome_arquivo`, `caminho_arquivo`, `tipo_arquivo`, `tamanho_arquivo`, `data_upload`) VALUES
(1, 7, '1737972550157.jpeg', 'uploads\\chamados\\1743727768042-1737972550157.jpeg', 'image/jpeg', 152763, '2025-04-04 00:49:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `chamados`
--

CREATE TABLE `chamados` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero` varchar(20) NOT NULL,
  `solicitante_id` int(11) NOT NULL,
  `assunto` varchar(255) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `prioridade` enum('Baixa','Média','Alta','Urgente') DEFAULT 'Média',
  `descricao` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Aberto',
  `sla_horas` int(11) DEFAULT 24,
  `data_abertura` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_fechamento` timestamp NULL DEFAULT NULL,
  `ultima_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `atendente_id` int(11) DEFAULT NULL,
  `sla_estourado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `chamados`
--

INSERT INTO `chamados` (`id`, `numero`, `solicitante_id`, `assunto`, `categoria`, `prioridade`, `descricao`, `status`, `sla_horas`, `data_abertura`, `data_fechamento`, `ultima_atualizacao`, `data_atualizacao`, `atendente_id`, `sla_estourado`) VALUES
(1, '', 1, 'teste de chamado', 'hardware', 'Média', '000000000000000000000000000000000001', 'Fechado', 24, '2025-04-03 19:58:41', '2025-04-04 00:43:46', '2025-04-04 00:43:46', '2025-04-04 00:43:46', 1, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `comentarios_chamados`
--

CREATE TABLE `comentarios_chamados` (
  `id` int(11) NOT NULL,
  `chamado_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `data_comentario` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `comentarios_chamados`
--

INSERT INTO `comentarios_chamados` (`id`, `chamado_id`, `usuario_id`, `texto`, `data_comentario`) VALUES
(1, 1, 1, 'teste', '2025-04-03 20:29:38'),
(5, 1, 1, 'Atendimento iniciado', '2025-04-04 00:30:58'),
(6, 1, 1, 'Atendimento finalizado', '2025-04-04 00:43:46'),
(7, 1, 1, '', '2025-04-04 00:49:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `equipamentos`
--

CREATE TABLE `equipamentos` (
  `id` int(11) NOT NULL,
  `equipamento` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `numero_serie` varchar(100) NOT NULL,
  `portador_id` int(11) DEFAULT NULL,
  `estado` enum('Novo','Bom','Regular','Ruim','Manutenção','Descartado') NOT NULL DEFAULT 'Novo',
  `observacao` text DEFAULT NULL,
  `status` enum('Em uso','Disponível','','') NOT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `equipamentos`
--

INSERT INTO `equipamentos` (`id`, `equipamento`, `modelo`, `numero_serie`, `portador_id`, `estado`, `observacao`, `status`, `data_cadastro`, `ultima_atualizacao`) VALUES
(3, 'teste de equipamento', 'modelo', '111111111111111111', NULL, 'Novo', 'aaaaaaa123', 'Em uso', '2025-04-04 13:18:17', '2025-04-04 13:42:40');

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_equipamentos`
--

CREATE TABLE `historico_equipamentos` (
  `id` int(11) NOT NULL,
  `equipamento_id` int(11) NOT NULL,
  `portador_anterior_id` int(11) DEFAULT NULL,
  `novo_portador_id` int(11) DEFAULT NULL,
  `data_movimentacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `responsavel_id` int(11) NOT NULL,
  `observacao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `setor` varchar(50) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` enum('Administrador','Tecnico','Usuario') NOT NULL DEFAULT 'Usuario',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `setor`, `senha`, `cargo`, `created_at`, `updated_at`) VALUES
(1, 'Lucas', 'lucas.santos@bbragrolog.com', 'TI', '$2a$10$gNHJa5ZsddiPJhFfOuxN/ekjWdfnrhaNqYY1ZfZHs1MrpF/iXbRGy', 'Administrador', '2025-04-03 15:35:22', '2025-04-03 15:35:22'),
(2, 'Teste', 'teste@teste.com', '1', '$2a$10$4AhWmIfZfcwUCoUohj4qp.nVdSvtpLA73HaKnUwMSBeA2PQRf5ufC', 'Usuario', '2025-04-04 13:47:21', '2025-04-04 13:47:21');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `anexos_chamados`
--
ALTER TABLE `anexos_chamados`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `anexos_comentarios`
--
ALTER TABLE `anexos_comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comentario_id` (`comentario_id`);

--
-- Índices de tabela `chamados`
--
ALTER TABLE `chamados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `solicitante_id` (`solicitante_id`),
  ADD KEY `idx_chamados_atendente` (`atendente_id`);

--
-- Índices de tabela `comentarios_chamados`
--
ALTER TABLE `comentarios_chamados`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `equipamentos`
--
ALTER TABLE `equipamentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_serie_UNIQUE` (`numero_serie`),
  ADD KEY `fk_equipamento_portador_idx` (`portador_id`);

--
-- Índices de tabela `historico_equipamentos`
--
ALTER TABLE `historico_equipamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipamento_id` (`equipamento_id`),
  ADD KEY `portador_anterior_id` (`portador_anterior_id`),
  ADD KEY `novo_portador_id` (`novo_portador_id`),
  ADD KEY `responsavel_id` (`responsavel_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `anexos_chamados`
--
ALTER TABLE `anexos_chamados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `anexos_comentarios`
--
ALTER TABLE `anexos_comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `chamados`
--
ALTER TABLE `chamados`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `comentarios_chamados`
--
ALTER TABLE `comentarios_chamados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `equipamentos`
--
ALTER TABLE `equipamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `historico_equipamentos`
--
ALTER TABLE `historico_equipamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `anexos_comentarios`
--
ALTER TABLE `anexos_comentarios`
  ADD CONSTRAINT `anexos_comentarios_ibfk_1` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios_chamados` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `chamados`
--
ALTER TABLE `chamados`
  ADD CONSTRAINT `chamados_ibfk_1` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `chamados_ibfk_2` FOREIGN KEY (`atendente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `chamados_ibfk_3` FOREIGN KEY (`atendente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_chamados_atendente` FOREIGN KEY (`atendente_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `equipamentos`
--
ALTER TABLE `equipamentos`
  ADD CONSTRAINT `fk_equipamento_portador` FOREIGN KEY (`portador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `historico_equipamentos`
--
ALTER TABLE `historico_equipamentos`
  ADD CONSTRAINT `historico_equipamentos_ibfk_1` FOREIGN KEY (`equipamento_id`) REFERENCES `equipamentos` (`id`),
  ADD CONSTRAINT `historico_equipamentos_ibfk_2` FOREIGN KEY (`portador_anterior_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `historico_equipamentos_ibfk_3` FOREIGN KEY (`novo_portador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `historico_equipamentos_ibfk_4` FOREIGN KEY (`responsavel_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
