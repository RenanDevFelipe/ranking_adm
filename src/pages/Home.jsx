import Sidebar from '../components/sidebar';
import "./styles.css";
import logo from "../utils/img/jadson.png"
import Card from '../components/card';
import {colaboradorService} from "../services/colaboradorService.ts"


export default function Home() {
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await colaboradorService.colaborador();
                if (!response.ok) {
                    throw new Error('Erro ao carregar colaboradores');
                }
                const data = await response.json();
                setColaboradores(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchColaboradores();
    }, []);

    // Filtrar colaboradores baseado no termo de busca
    const filteredColaboradores = colaboradores.filter(colab =>
        colab.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="app-container">Carregando...</div>;
    }

    if (error) {
        return <div className="app-container">Erro: {error}</div>;
    }
    return (
        <div className="app-container">
            <Sidebar />
            <div className="sidebar-footer">
                <div className='search-box'>
                    <input placeholder='Pesquise pelo nome do tecnico' className="search" type="text" />
                </div>
                <div className='container-user'>
                    <div className="user-info">
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />
                        <Card
                            logo={logo}
                            name="Eliyson Alves"
                            role="Suporte Nivel 2"
                            action="Avaliar"
                        />

                    </div>
                </div>
            </div>
        </div>
    );
}