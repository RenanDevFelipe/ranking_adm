import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ticonnecte.com.br/ranking_api/api/public/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 segundos
});

interface LoginResponse {
  access_token: string;
  email: string;
  nome: string;
  id_ixc: number;
}

interface Colaborador {
  id_colaborador: number;
  nome_colaborador: string;
  setor_colaborador: number;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('Account/login', { email, password });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Credenciais inválidas');
      }
      throw new Error(`Erro no servidor: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Sem resposta do servidor. Verifique sua conexão.');
    } else {
      throw new Error('Erro ao configurar a requisição: ' + error.message);
    }
  }
};


interface MediaSetor {
  id_setor: number;
  nome_setor?: string;
  total_registros: number;
  media_diaria: string;
  soma_pontuacao: string;
}

interface RankingApiResponse {
  media_n3: string;
  media_rh: string;
  media_n2: string;
  media_estoque: string;
  media_sucesso: string;
  media_setor: MediaSetor[];
  media_total: string;
}

export const getDailyRanking = async (date: string, id: number, token: string): Promise<RankingApiResponse> => {
  try {
    const response = await api.post('Ranking/RankingDiario', {
      id: id,
      data_request: date
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar ranking diário:', error);
    throw new Error('Erro ao buscar ranking diário');
  }
};


export const getColaboradores = async (token: string): Promise<Colaborador[]> => {
  try {
    const response = await api.get(
      'Colaborador/GetAll',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.registros || !Array.isArray(response.data.registros)) {
      throw new Error('Formato de dados inválido na resposta da API');
    }

    return response.data.registros;
  } catch (error: any) {
    console.error('Erro ao buscar colaboradores:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar colaboradores');
  }
};



interface RankingItem {
  id: number;
  colaborador_id: number;
  data: string;
  media_geral: string;
  media_estoque: string;
  media_n2: string;
  media_n3: string;
  media_rh: string;
  media_sucesso: string;
  posicao?: number;
}


interface Setores {
  id_setor: number;
  nome_setor: string;
}


export const getSetores = async (token: string): Promise<Setores[]> => {
  try {
    const response = await api.get(
      'Departamento/getAll',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.registros || !Array.isArray(response.data.registros)) {
      throw new Error('Formato de dados inválido na resposta da API');
    }

    return response.data.registros;
  } catch (error: any) {
    console.error('Erro ao buscar Setores:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar colaboradores');
  }
};

interface Avaliacoes {
  id: string;
  id_cliente: string;
  cliente: string;
  finalizacao: string;
  mensagem: string;
  checklist: string;
  status: string;
  avaliador: string;
}

export const getAvaliacoes = async (
  token: string,
  query: string, // Agora explicitamente string
  data_fechamento: string
): Promise<Avaliacoes[]> => {
  try {
    const response = await api.post(
      'IXCSoft/listOSFinTec',
      {
        query, // Já é string
        data_fechamento
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.registros || !Array.isArray(response.data.registros)) {
      throw new Error('Formato de dados inválido na resposta da API');
    }

    return response.data.registros;
  } catch (error: any) {
    console.error('Erro ao buscar Avaliações:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar Avaliações');
  }
}

export const getRankingMensal = async (token: string, data_request: string): Promise<RankingMensalItem[]> => {
  try {
    const response = await api.post(
      'Ranking/GetRankingMensal',
      { data_request },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Verifica se a resposta tem a estrutura esperada
    if (!response.data || !response.data.ranking_mensal || !Array.isArray(response.data.ranking_mensal)) {
      throw new Error('Formato de dados inválido na resposta da API');
    }

    return response.data.ranking_mensal;
  } catch (error: any) {
    console.error('Erro ao buscar ranking mensal:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar ranking mensal');
  }
};

interface SetorData {
  id_setor: number;
  setor: string;
  total_registros: number;
  media_mensal: string;
  soma_pontuacao: string;
}

interface RankingMensalItem {
  tecnico: string;
  colocacao: number;
  total_registros: number;
  media_mensal: string;
  media_setor: SetorData[];
}

interface tutorial {
  id: number;
  title: string;
  descricao: string;
  url_view: string;
  url_download: string;
  criado_por: string;
  data_criacao: string;
  name_icon: string;
}


export const getTutoriais = async (token: string): Promise<tutorial[]> => {
  try {
    const response = await api.get(
      'Tutorial/getAll',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.registros || !Array.isArray(response.data.registros)) {
      throw new Error('Formato de dados inválido na resposta da API');
    }

    return response.data.registros;
  } catch (error: any) {
    console.error('Erro ao buscar Tutoriais:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar Tutoriais');
  }
};

export const deleteColaborador = async (token: string, id: number) => {
  try {
    const response = await api.delete(
      `Colaborador/Delete`,
      
      {
        data: { id },   
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
    );

    return response.data;
  } catch (error: any) {
    console.error('Erro ao deletar colaborador:', error);
    throw new Error(error.response?.data?.message || 'Erro ao deletar colaborador');
  }
}

export const getColaboradorById = async (token: string, id: number) => {
  try {
    const response = await api.post(
      `Colaborador/getOne`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

    );
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar colaborador:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar colaborador');
  }
}

export const addColaborador = async (token: string, formData: FormData) => {
  try {
    const response = await api.post("Colaborador/Post", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao adicionar colaborador:', error);

    // Verificação mais segura do erro
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Erro ao adicionar colaborador';

    throw new Error(errorMessage);
  }
};

export const updateColaborador = async (token: string, formData: FormData) => {

  try {
    const response = await api.post("Colaborador/Post", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(error);

    // Verificação mais segura do erro
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Erro ao adicionar colaborador';

    throw new Error(errorMessage);
  }
}