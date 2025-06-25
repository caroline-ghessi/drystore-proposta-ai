
-- Primeiro, remover as referências nas propostas
DELETE FROM proposal_payment_conditions;

-- Agora limpar condições existentes para reorganizar
DELETE FROM payment_conditions;

-- Inserir as 6 condições de pagamento conforme especificado
INSERT INTO payment_conditions (name, installments, discount_percentage, interest_percentage, active) VALUES
('À Vista', 1, 5.0, 0, true),
('Faturado', 1, 3.0, 0, true),
('Até 4x', 4, 0, 0, true),
('De 5x a 10x', 10, 0, 2.5, true),
('De 11x a 14x', 14, 0, 5.0, true),
('De 15x a 18x', 18, 0, 7.5, true);
