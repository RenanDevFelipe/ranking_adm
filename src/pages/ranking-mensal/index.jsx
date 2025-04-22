import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import { getRankingMensal } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
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
  useTheme
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp,
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium
} from '@mui/icons-material';

export default function RankingMensal() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankingData, setRankingData] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});

    // Aplica o tema ao body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Carrega dados do ranking
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const dataRequest = `${year}-${month.toString().padStart(2, '0')}`;
        
        const fetchRankingData = async () => {
            try {
                const data = await getRankingMensal(token, dataRequest);
                console.log(data);
                setRankingData(data || []);
                console.log(rankingData);
            } catch (err) {
                console.error("Erro ao carregar ranking mensal:", err);
                if (err.response?.status === 401) {
                    setError('Sessão expirada. Redirecionando para login...');
                    logout();
                } else {
                    setError(err.message || 'Erro ao carregar ranking mensal');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRankingData();
    }, []);

    const handleRowClick = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getMedalIcon = (position) => {
        switch(position) {
            case 1: return <EmojiEvents sx={{ color: '#FFD700', fontSize: 40 }} />;
            case 2: return <MilitaryTech sx={{ color: '#C0C0C0', fontSize: 40 }} />;
            case 3: return <WorkspacePremium sx={{ color: '#CD7F32', fontSize: 40 }} />;
            default: return position;
        }
    };

    const getAvatarStyle = (position) => {
        switch(position) {
            case 1: return { bgcolor: '#FFD700', width: 60, height: 60 };
            case 2: return { bgcolor: '#C0C0C0', width: 50, height: 50 };
            case 3: return { bgcolor: '#CD7F32', width: 50, height: 50 };
            default: return { bgcolor: theme.palette.primary.main };
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando ranking...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
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
            <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="main-content">
                <div className="ranking-container">
                    <h1>Ranking Mensal</h1>
                    
                    {/* Pódio - Top 3 */}
                    <div className="podium-container">
                        <Grid container spacing={3} justifyContent="center" alignItems="flex-end">
                            {/* Segundo lugar */}
                            {rankingData.length > 1 && (
                                <Grid item xs={12} sm={4} className="podium-item second-place">
                                    <Avatar sx={getAvatarStyle(2)}>
                                        {getMedalIcon(2)}
                                    </Avatar>
                                    <Typography variant="h6">{rankingData[1].tecnico}</Typography>
                                    <Typography variant="subtitle1">Média: {rankingData[1].media_mensal}</Typography>
                                    <Typography variant="body2">Dias com nota 10: {rankingData[1].meta_mensal.total_dias_batidos}</Typography>
                                </Grid>
                            )}
                            
                            {/* Primeiro lugar */}
                            {rankingData.length > 0 && (
                                <Grid item xs={12} sm={4} className="podium-item first-place">
                                    <Avatar sx={getAvatarStyle(1)}>
                                        {getMedalIcon(1)}
                                    </Avatar>
                                    <Typography variant="h5">{rankingData[0].tecnico}</Typography>
                                    <Typography variant="subtitle1">Média: {rankingData[0].media_mensal}</Typography>
                                    <Typography variant="body2">Dias com nota 10: {rankingData[0].meta_mensal.total_dias_batidos}</Typography>
                                </Grid>
                            )}
                            
                            {/* Terceiro lugar */}
                            {rankingData.length > 2 && (
                                <Grid item xs={12} sm={4} className="podium-item third-place">
                                    <Avatar sx={getAvatarStyle(3)}>
                                        {getMedalIcon(3)}
                                    </Avatar>
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
                                            <TableCell>
                                                {row.colocacao <= 3 ? getMedalIcon(row.colocacao) : row.colocacao}
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