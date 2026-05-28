import HistoricoPontuacaoPage from '../HistoricoPontuacaoPage.jsx';
import { avaliacaoConfigs } from '../ajusteConfig.js';

export default function MovimentacoesRH() {
    return <HistoricoPontuacaoPage config={avaliacaoConfigs.rh} />;
}
