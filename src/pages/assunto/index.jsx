import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default function Assunto() {

    const navigate = useNavigate();

    return (
        <div className="app-container">
            <Sidebar />



            {/* Botão flutuante para adicionar novo colaborador */}
            <button
                className="add-button"
                onClick={() => navigate('/assunto/0')}
            >
                <FaPlus />
            </button>

        </div>
    );
}