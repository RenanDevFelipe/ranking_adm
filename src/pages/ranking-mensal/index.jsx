import { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import { getRankingMensal, getColaboradores, getRelatorio } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Collapse,
    IconButton,
    Typography,
    Card,
    CardContent,
    Grid,
    useTheme,
    TextField,
    Box
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
} from '@mui/icons-material';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function RankingMensal() {
    const theme = useTheme();
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankingData, setRankingData] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchDate, setSearchDate] = useState('');
    const [token, setToken] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };



    // Aplica o tema ao body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Define a data inicial (mês atual)
    useEffect(() => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}`;
        setSearchDate(formattedDate);
        setToken(localStorage.getItem('access_token'));
    }, []);

    // Carrega dados do ranking e colaboradores
    useEffect(() => {
        if (searchDate) {
            fetchData(searchDate);
        }
    }, [searchDate]);

    const fetchData = async (date) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        try {
            // Carrega ranking e colaboradores em paralelo
            const [ranking, colaboradoresData] = await Promise.all([
                getRankingMensal(token, date),
                getColaboradores(token)
            ]);

            setRankingData((ranking || []).filter(item => !item?.erro));
            setColaboradores(colaboradoresData || []);

            console.log('rankingData: ', ranking)

        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            if (err.response?.status === 401) {
                setError('Sessão expirada. Redirecionando para login...');
                logout();
            } else {
                setError(err.message || 'Erro ao carregar dados');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setSearchDate(e.target.value);
    };


    // E modifique a função getColaboradorFoto para ser mais resiliente
    const getColaboradorFoto = (nome) => {
        if (!nome || !colaboradores || colaboradores.length === 0) {
            return 'https://ticonnecte.com.br/ranking_api/api/uploads/default.png';
        }

        const colaborador = colaboradores.find(colab =>
            colab.nome_colaborador && colab.nome_colaborador.toLowerCase() === nome.toLowerCase()
        );

        // Verifica se a URL da imagem começa com http, se não, adiciona https://
        const url = colaborador?.url_image || 'default.png';
        return url.startsWith('http') ? url : `https://${url}`;
    };

    const handleRowClick = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleRelatorio = async () => {
        try {
            const response = await getRelatorio(token, searchDate);

            // Cria um Blob com o conteúdo XML
            const blob = new Blob([response], { type: 'application/vnd.ms-excel' });

            // Cria um link para download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Define o nome do arquivo com a data do relatório
            const formattedDate = searchDate.replace('-', '_');
            link.download = `Relatorio_Mensal_${formattedDate}.xls`;

            // Dispara o download
            document.body.appendChild(link);
            link.click();

            // Limpa o objeto URL
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            // Adicione aqui a lógica para exibir mensagem de erro ao usuário
        }
    };

    // Estilo do avatar baseado na posição
    const getAvatarStyle = (position) => {
        const baseStyle = {
            width: 70,
            height: 70,
            borderWidth: 4,
            borderStyle: 'solid',
            objectFit: 'cover'
        };

        switch (position) {
            case 1:
                return {
                    ...baseStyle,
                    borderColor: '#FFD700', // Ouro
                    width: 100,
                    height: 100,
                    objectPosition: 'center top',
                };
            case 2:
                return {
                    ...baseStyle,
                    borderColor: '#C0C0C0', // Prata
                    width: 80,
                    height: 80,
                    objectPosition: 'center top'
                };
            case 3:
                return {
                    ...baseStyle,
                    borderColor: '#CD7F32', // Bronze
                    objectPosition: 'center top'
                };
            default:
                return {
                    ...baseStyle,
                    borderColor: theme.palette.primary.main
                };
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando Ranking...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar isVisible={isSidebarVisible} />
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }



    return (
        <div className="app-container">
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-mensal">
                <button
                    className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                    onClick={toggleSidebar}
                >
                    {isSidebarVisible ? <DehazeIcon /> : '►'}
                </button>
                <div className="ranking-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <h1>Ranking Mensal</h1>
                        <Box display="flex" alignItems="center">
                            <TextField
                                label="Mês/Ano"
                                type="month"
                                value={searchDate}
                                onChange={handleDateChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    max: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
                                }}
                                variant="outlined"
                                sx={{ mr: 2 }}
                            />
                            {/* <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Search />}
                                onClick={handleSearch}
                            >
                                Buscar
                            </Button> */}
                        </Box>
                        <button
                            onClick={() => handleRelatorio()}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}
                        >
                            GERAR RELATÓRIO EXCEL
                        </button>
                    </Box>

                    {/* Pódio - Top 3 */}
                    <div className="podium-container">
                        <Grid container spacing={3} justifyContent="center" alignItems="flex-end">
                            {/* Segundo lugar */}
                            {rankingData.length > 1 && (
                                <Grid item xs={12} sm={4} className="podium-item second-place">
                                    <Avatar
                                        src={getColaboradorFoto(rankingData[1].tecnico)}
                                        sx={getAvatarStyle(2)}
                                    />
                                    <Typography variant="h6">{rankingData[1].tecnico}</Typography>
                                    <Typography variant="subtitle1">Média: {rankingData[1].media_mensal}</Typography>
                                    <Typography variant="body2">Dias com nota 10: {rankingData[1].meta_mensal.total_dias_batidos}</Typography>
                                </Grid>
                            )}

                            {/* Primeiro lugar */}
                            {rankingData.length > 0 && (
                                <Grid item xs={12} sm={4} className="podium-item first-place">
                                    <Avatar
                                        src={getColaboradorFoto(rankingData[0].tecnico)}
                                        sx={getAvatarStyle(1)}
                                    />
                                    <Typography variant="h5">{rankingData[0].tecnico}</Typography>
                                    <Typography variant="subtitle1">Média: {rankingData[0].media_mensal}</Typography>
                                    <Typography variant="body2">Dias com nota 10: {rankingData[0].meta_mensal.total_dias_batidos}</Typography>
                                </Grid>
                            )}

                            {/* Terceiro lugar */}
                            {rankingData.length > 2 && (
                                <Grid item xs={12} sm={4} className="podium-item third-place">
                                    <Avatar
                                        src={getColaboradorFoto(rankingData[2].tecnico)}
                                        sx={getAvatarStyle(3)}
                                    />
                                    <Typography variant="h6">{rankingData[2].tecnico}</Typography>
                                    <Typography variant="subtitle1">Média: {rankingData[2].media_mensal}</Typography>
                                    <Typography variant="body2">Dias com nota 10: {rankingData[2].meta_mensal.total_dias_batidos}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </div>

                    {/* Tabela completa */}
                    <TableContainer component={Paper} sx={{ marginTop: 4 }}>
                        <Table aria-label="ranking table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Posição</TableCell>
                                    <TableCell>Colaborador</TableCell>
                                    <TableCell align="right">Total Avaliações</TableCell>
                                    <TableCell align="right">Média Mensal</TableCell>
                                    <TableCell align="right">Dias Nota 10</TableCell>
                                    <TableCell align="right">Meta do Mês</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rankingData.map((row, index) => (

                                    <>
                                        <TableRow
                                            key={row.tecnico}
                                            sx={{
                                                '& > *': { borderBottom: 'unset' },
                                                cursor: 'pointer',
                                                backgroundColor: expandedRows[index] ? theme.palette.action.selected : 'inherit'
                                            }}
                                            onClick={() => handleRowClick(index)}
                                        >
                                            <TableCell className='avatar-colocacao'>
                                                <p>{row.colocacao}°</p>
                                                <Avatar
                                                    src={getColaboradorFoto(row.tecnico)}
                                                    sx={getAvatarStyle(row.colocacao)}
                                                />
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {row.tecnico}
                                            </TableCell>
                                            <TableCell align="right">{row.total_registros}</TableCell>
                                            <TableCell align="right">{row.media_mensal}</TableCell>
                                            <TableCell align="right">{row.meta_mensal.total_dias_batidos}</TableCell>
                                            <TableCell align="right">{row.meta_mensal.meta_do_mes}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    aria-label="expand row"
                                                    size="small"
                                                    onClick={() => handleRowClick(index)}
                                                >
                                                    {expandedRows[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                                                    <Card sx={{ margin: 1 }}>
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom>
                                                                Desempenho por Setor
                                                            </Typography>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Setor</TableCell>
                                                                        <TableCell align="right">Avaliações</TableCell>
                                                                        <TableCell align="right">Média</TableCell>
                                                                        <TableCell align="right">Pontuação Total</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {row.media_setor.map((setor) => (
                                                                        <TableRow key={setor.id_setor}>
                                                                            <TableCell component="th" scope="row">
                                                                                {setor.setor}
                                                                            </TableCell>
                                                                            <TableCell align="right">{setor.total_registros}</TableCell>
                                                                            <TableCell align="right">{setor.media_mensal}</TableCell>
                                                                            <TableCell align="right">{setor.soma_pontuacao}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </CardContent>
                                                    </Card>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    );
}