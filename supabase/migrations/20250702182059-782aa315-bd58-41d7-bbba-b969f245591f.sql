-- Função para dimensionar sistema solar
CREATE OR REPLACE FUNCTION dimensionar_sistema_solar(
    p_consumo_medio_kwh numeric,
    p_estado text
) RETURNS jsonb AS $$
DECLARE
    v_irradiacao numeric;
    v_config record;
    v_potencia_necessaria numeric;
BEGIN
    SELECT irradiacao_media_kwh_m2_dia INTO v_irradiacao
    FROM irradiacao_estados WHERE estado = p_estado;
    
    SELECT * INTO v_config FROM energia_solar_configuracoes WHERE ativo = true LIMIT 1;
    
    v_potencia_necessaria := (p_consumo_medio_kwh * 12) / 
                           (v_irradiacao * 365 * v_config.fator_perdas_sistema) * 
                           v_config.fator_seguranca;
    
    RETURN jsonb_build_object(
        'potencia_necessaria_kwp', round(v_potencia_necessaria, 2),
        'irradiacao_local', v_irradiacao,
        'geracao_estimada_anual', round(v_potencia_necessaria * v_irradiacao * 365 * v_config.fator_perdas_sistema, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para selecionar painéis solares
CREATE OR REPLACE FUNCTION selecionar_paineis_solares(
    p_potencia_kwp numeric,
    p_tipo_telhado text DEFAULT 'ceramico'
) RETURNS jsonb AS $$
DECLARE
    v_painel record;
    v_opcoes jsonb[] := '{}';
BEGIN
    FOR v_painel IN
        SELECT 
            id, fabricante, modelo, potencia_wp, preco_unitario,
            largura_m, altura_m,
            ceil((p_potencia_kwp * 1000) / potencia_wp) as quantidade
        FROM paineis_solares
        WHERE ativo = true
            AND tipos_telhado_compativeis @> jsonb_build_array(p_tipo_telhado)
        ORDER BY (preco_unitario / potencia_wp) ASC
        LIMIT 5
    LOOP
        v_opcoes := v_opcoes || jsonb_build_object(
            'id', v_painel.id,
            'fabricante', v_painel.fabricante,
            'modelo', v_painel.modelo,
            'quantidade', v_painel.quantidade,
            'potencia_total_kwp', (v_painel.quantidade * v_painel.potencia_wp) / 1000.0,
            'area_ocupada_m2', v_painel.quantidade * v_painel.largura_m * v_painel.altura_m,
            'preco_total', v_painel.quantidade * v_painel.preco_unitario
        );
    END LOOP;
    
    RETURN jsonb_build_object(
        'opcoes', v_opcoes,
        'recomendado', v_opcoes[1]
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cálculo financeiro solar
CREATE OR REPLACE FUNCTION calcular_financeiro_solar(
    p_custo_equipamentos numeric,
    p_potencia_kwp numeric,
    p_geracao_anual_kwh numeric,
    p_consumo_anual_kwh numeric,
    p_tarifa_kwh numeric
) RETURNS jsonb AS $$
DECLARE
    v_config record;
    v_custo_instalacao numeric;
    v_custo_total numeric;
    v_economia_anual numeric;
    v_payback numeric;
BEGIN
    SELECT * INTO v_config FROM energia_solar_configuracoes WHERE ativo = true LIMIT 1;
    
    v_custo_instalacao := p_potencia_kwp * 1000 * v_config.custo_instalacao_wp;
    v_custo_total := (p_custo_equipamentos + v_custo_instalacao) * (1 + v_config.margem_comercial);
    
    v_economia_anual := LEAST(p_geracao_anual_kwh, p_consumo_anual_kwh) * p_tarifa_kwh;
    v_payback := v_custo_total / v_economia_anual;
    
    RETURN jsonb_build_object(
        'custo_equipamentos', p_custo_equipamentos,
        'custo_instalacao', v_custo_instalacao,
        'custo_total', round(v_custo_total, 2),
        'economia_anual', round(v_economia_anual, 2),
        'payback_anos', round(v_payback, 1),
        'economia_25_anos', round(v_economia_anual * 25 - v_custo_total, 2)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;