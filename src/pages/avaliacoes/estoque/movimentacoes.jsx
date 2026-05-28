import HistoricoPontuacaoPage from '../HistoricoPontuacaoPage.jsx';
import { avaliacaoConfigs } from '../ajusteConfig.js';

export default function MovimentacoesEstoque() {
    return <HistoricoPontuacaoPage config={avaliacaoConfigs.estoque} />;
}
