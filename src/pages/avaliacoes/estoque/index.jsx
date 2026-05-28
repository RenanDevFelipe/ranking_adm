import AjustePontuacaoPage from '../AjustePontuacaoPage.jsx';
import { avaliacaoConfigs } from '../ajusteConfig.js';

export default function AvaliarEstoque() {
    return <AjustePontuacaoPage config={avaliacaoConfigs.estoque} />;
}
