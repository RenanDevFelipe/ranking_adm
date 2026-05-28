export const avaliacaoConfigs = {
    n2: {
        modulo: 'n2',
        titulo: 'Avaliacao N2',
        movimentacoesPath: '/movimentacoes',
        campos: [
            { campo: 'ponto_finalizacao_os', titulo: 'Finalizacao de OS', pontos: 10 },
            { campo: 'ponto_lavagem_carro', titulo: 'Lavagem de carro', pontos: 10 },
            { campo: 'organizacao_material', titulo: 'Organizacao de material', pontos: 10 },
            { campo: 'ponto_fardamento', titulo: 'Fardamento', pontos: 10 }
        ]
    },
    estoque: {
        modulo: 'estoque',
        titulo: 'Avaliacao Estoque',
        movimentacoesPath: '/estoque/movimentacoes',
        campos: [
            { campo: 'pnt_pedido', titulo: 'Pedido', pontos: 2 },
            { campo: 'pnt_prazo', titulo: 'Prazo', pontos: 1 },
            { campo: 'pnt_etiqueta', titulo: 'Etiqueta', pontos: 1 },
            { campo: 'pnt_baixa_mat', titulo: 'Baixa de material', pontos: 2 },
            { campo: 'pnt_troca_equip', titulo: 'Troca de equipamento', pontos: 2 },
            { campo: 'pnt_transferencia', titulo: 'Transferencia', pontos: 2 }
        ]
    },
    rh: {
        modulo: 'rh',
        titulo: 'Avaliacao RH',
        movimentacoesPath: '/rh/movimentacoes',
        campos: [
            { campo: 'pnt_ponto', titulo: 'Ponto', pontos: 10 },
            { campo: 'pnt_atestado', titulo: 'Atestado', pontos: 10 },
            { campo: 'pnt_falta', titulo: 'Falta', pontos: 10 }
        ]
    }
};
