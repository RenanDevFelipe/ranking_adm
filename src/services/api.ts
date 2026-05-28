import api from '../api/axios.ts';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  messagem?: string;
  data: T;
};

type Usuario = {
  id_user: number;
  nome_user: string;
  id_ixc_user: number;
  email_user: string;
  senha_user?: string;
  role: number;
  setor_user: number;
};

type Setor = {
  id_setor: number;
  nome_setor: string;
};

type Role = {
  id_role: number;
  nome_role: string;
  created_at?: string;
  updated_at?: string | null;
};

type Colaborador = {
  id_colaborador: number;
  id_ixc: number | string;
  nome_colaborador: string;
  setor_colaborador: number | string;
  url_image?: string;
  setor?: Setor;
};

type IxcConfig = {
  id: number;
  nome: string;
  base_url: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string | null;
};

type ChecklistItem = {
  id_item?: number;
  id_checklist?: number;
  pergunta: string;
  tipo_resposta: string;
  peso: number | string;
  obrigatorio: boolean;
  ordem: number;
};

type Checklist = {
  id: number;
  nome_checklist: string;
  ativo: boolean;
  itens: ChecklistItem[];
  assuntos?: any[];
  created_at?: string;
  updated_at?: string;
};

type RankingConfiguracao = {
  id?: number;
  meta_pontos_os_diaria: number | string;
  meta_media_avaliacoes: number | string;
  dias_minimos_meta_mensal: number | string;
  meses_minimos_meta_anual: number | string;
  ativo: boolean;
};

const getMessage = (responseData: any, fallback: string) => {
  return responseData?.message || responseData?.messagem || responseData?.error || fallback;
};

const ensureSuccess = <T>(responseData: ApiEnvelope<T>, fallback: string): T => {
  if (!responseData?.success) {
    throw new Error(getMessage(responseData, fallback));
  }

  return responseData.data;
};

const notMigrated = async (name: string) => {
  throw new Error(`${name} ainda nao foi migrado para a API v1.`);
};

const usuarioPayloadFromFormData = (formData: FormData) => ({
  nome_user: String(formData.get('nome_user') || ''),
  id_ixc_user: String(formData.get('id_ixc_user') || ''),
  email_user: String(formData.get('email_user') || ''),
  senha_user: String(formData.get('senha_user') || ''),
  role: String(formData.get('role') || ''),
  setor_user: String(formData.get('setor_user') || '')
});

const setorPayloadFromFormData = (formData: FormData) => ({
  nome_setor: String(formData.get('nome_setor') || '')
});

const colaboradorPayloadFromFormData = (formData: FormData) => ({
  id_ixc: String(formData.get('id_ixc') || ''),
  nome_colaborador: String(formData.get('nome_colaborador') || ''),
  setor_colaborador: String(formData.get('setor_colaborador') || '')
});

const ixcConfigPayloadFromFormData = (formData: FormData) => ({
  nome: String(formData.get('nome') || ''),
  base_url: String(formData.get('base_url') || ''),
  token: String(formData.get('token') || ''),
  ativo: formData.get('ativo') === 'true'
});

const normalizeChecklistItens = (itens: ChecklistItem[] = []) => {
  return itens
    .map((item, index) => ({
      pergunta: item.pergunta,
      tipo_resposta: item.tipo_resposta,
      peso: Number(item.peso || 0),
      obrigatorio: Boolean(item.obrigatorio),
      ordem: index + 1
    }))
    .filter(item => item.pergunta.trim());
};

const checklistPayload = (checklist: { nome_checklist: string; ativo: boolean; itens: ChecklistItem[] }) => ({
  nome_checklist: checklist.nome_checklist,
  ativo: Boolean(checklist.ativo),
  itens: normalizeChecklistItens(checklist.itens)
});

const checklistHeaderPayload = (checklist: { nome_checklist: string; ativo: boolean }) => ({
  nome_checklist: checklist.nome_checklist,
  ativo: Boolean(checklist.ativo)
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('auth/login', {
      email_user: email,
      senha_user: password
    });

    return ensureSuccess(response.data, 'Credenciais invalidas');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao fazer login');
  }
};

export const getDashboardResumo = async (data?: string) => {
  try {
    const response = await api.get('dashboard/resumo', {
      params: data ? { data } : undefined
    });

    return ensureSuccess(response.data, 'Erro ao carregar resumo do dashboard');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar resumo do dashboard');
  }
};

export const getDashboardTopAssuntos = async (dataInicio: string, dataFim: string, limit = 50) => {
  try {
    const response = await api.get('dashboard/top-assuntos', {
      params: {
        data_inicio: dataInicio,
        data_fim: dataFim,
        limit
      }
    });

    return ensureSuccess(response.data, 'Erro ao carregar top assuntos');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar top assuntos');
  }
};

export const getDashboardProducaoPorDia = async (dataInicio: string, dataFim: string, limit = 50) => {
  try {
    const response = await api.get('dashboard/producao-por-dia', {
      params: {
        data_inicio: dataInicio,
        data_fim: dataFim,
        limit
      }
    });

    return ensureSuccess(response.data, 'Erro ao carregar producao por dia');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar producao por dia');
  }
};

export const getUsuarios = async (_token: string): Promise<Usuario[]> => {
  try {
    const response = await api.get('users');
    const data = ensureSuccess<Usuario[]>(response.data, 'Erro ao carregar usuarios');

    if (!Array.isArray(data)) {
      throw new Error('Formato de dados invalido na resposta da API');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar usuarios');
  }
};

export const getUsuarioById = async (_token: string, id: number) => {
  try {
    const response = await api.get(`users/${id}`);
    return ensureSuccess<Usuario>(response.data, 'Usuario nao encontrado');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar usuario');
  }
};

export const addUsuario = async (_token: string, formData: FormData) => {
  try {
    const response = await api.post('users', usuarioPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar usuario');
  }
};

export const updateUsuario = async (_token: string, formData: FormData) => {
  try {
    const id = formData.get('id_user');
    const response = await api.put(`users/${id}`, usuarioPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar usuario');
  }
};

export const deleteUsuario = async (_token: string, id: number) => {
  try {
    const response = await api.delete(`users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao deletar usuario');
  }
};

export const getSetores = async (_token: string): Promise<Setor[]> => {
  try {
    const response = await api.get('sectors');
    const data = ensureSuccess<Setor[]>(response.data, 'Erro ao carregar setores');

    if (!Array.isArray(data)) {
      throw new Error('Formato de dados invalido na resposta da API');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar setores');
  }
};

export const getSetorById = async (_token: string, id_setor: number) => {
  try {
    const response = await api.get(`sectors/${id_setor}`);
    return ensureSuccess<Setor>(response.data, 'Setor nao encontrado');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar setor');
  }
};

export const addSetor = async (_token: string, formData: FormData) => {
  try {
    const response = await api.post('sectors', setorPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar setor');
  }
};

export const updateSetor = async (_token: string, formData: FormData) => {
  try {
    const id = formData.get('id_setor');
    const response = await api.put(`sectors/${id}`, setorPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar setor');
  }
};

export const deleteSetor = async (_token: string, id_setor: number) => {
  try {
    const response = await api.delete(`sectors/${id_setor}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao deletar setor');
  }
};

export const getRoles = async (_token: string): Promise<Role[]> => {
  try {
    const response = await api.get('roles');
    const data = ensureSuccess<Role[]>(response.data, 'Erro ao carregar roles');

    if (!Array.isArray(data)) {
      throw new Error('Formato de dados invalido na resposta da API');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar roles');
  }
};

export const getRoleById = async (_token: string, id_role: number) => {
  try {
    const response = await api.get(`roles/${id_role}`);
    return ensureSuccess<Role>(response.data, 'Role nao encontrada');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar role');
  }
};

export const addRole = async (_token: string, payload: { nome_role: string }) => {
  try {
    const response = await api.post('roles', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar role');
  }
};

export const updateRole = async (_token: string, id_role: number, payload: { nome_role: string }) => {
  try {
    const response = await api.put(`roles/${id_role}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar role');
  }
};

export const deleteRole = async (_token: string, id_role: number) => {
  try {
    const response = await api.delete(`roles/${id_role}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.messagem || error.message || 'Erro ao deletar role');
  }
};

export const getColaboradores = async (_token: string): Promise<Colaborador[]> => {
  try {
    const response = await api.get('colaborators');
    const data = ensureSuccess<Colaborador[]>(response.data, 'Erro ao carregar colaboradores');

    if (!Array.isArray(data)) {
      throw new Error('Formato de dados invalido na resposta da API');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar colaboradores');
  }
};

export const getColaboradorById = async (_token: string, id: number) => {
  try {
    const response = await api.get(`colaborators/${id}`);
    return ensureSuccess<Colaborador>(response.data, 'Colaborador nao encontrado');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar colaborador');
  }
};

export const addColaborador = async (_token: string, formData: FormData) => {
  try {
    const response = await api.post('colaborators', colaboradorPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar colaborador');
  }
};

export const updateColaborador = async (_token: string, formData: FormData) => {
  try {
    const id = formData.get('id_colaborador');
    const response = await api.put(`colaborators/${id}`, colaboradorPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar colaborador');
  }
};

export const deleteColaborador = async (_token: string, id: number) => {
  try {
    const response = await api.delete(`colaborators/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao deletar colaborador');
  }
};

export const getIxcConfigs = async (_token: string): Promise<IxcConfig[]> => {
  try {
    const response = await api.get('ixc-configs');
    const data = ensureSuccess<IxcConfig[]>(response.data, 'Erro ao carregar configuracoes IXC');

    if (!Array.isArray(data)) {
      throw new Error('Formato de dados invalido na resposta da API');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar configuracoes IXC');
  }
};

export const getIxcConfigById = async (_token: string, id: number) => {
  try {
    const response = await api.get(`ixc-configs/${id}`);
    return ensureSuccess<IxcConfig>(response.data, 'Configuracao IXC nao encontrada');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar configuracao IXC');
  }
};

export const addIxcConfig = async (_token: string, formData: FormData) => {
  try {
    const response = await api.post('ixc-configs', ixcConfigPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar configuracao IXC');
  }
};

export const updateIxcConfig = async (_token: string, formData: FormData) => {
  try {
    const id = formData.get('id');
    const response = await api.put(`ixc-configs/${id}`, ixcConfigPayloadFromFormData(formData));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar configuracao IXC');
  }
};

export const deleteIxcConfig = async (_token: string, id: number) => {
  try {
    const response = await api.delete(`ixc-configs/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao deletar configuracao IXC');
  }
};

export const testarConexaoIxc = async (_token: string) => {
  try {
    const response = await api.get('ixc/testar-conexao');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao testar conexao IXC');
  }
};

export const getChecklists = async (_token: string): Promise<Checklist[]> => {
  try {
    const response = await api.get('checklists');
    const data = ensureSuccess<Checklist[]>(response.data, 'Erro ao carregar checklists');

    if (!Array.isArray(data)) {
      throw new Error('Formato de dados invalido na resposta da API');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar checklists');
  }
};

export const getChecklistById = async (_token: string, id: number) => {
  try {
    const response = await api.get(`checklists/${id}`);
    return ensureSuccess<Checklist>(response.data, 'Checklist nao encontrado');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar checklist');
  }
};

export const addChecklist = async (_token: string, checklist: { nome_checklist: string; ativo: boolean; itens: ChecklistItem[] }) => {
  try {
    const response = await api.post('checklists', checklistPayload(checklist));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar checklist');
  }
};

export const updateChecklist = async (_token: string, id: number | string, checklist: { nome_checklist: string; ativo: boolean }) => {
  try {
    const response = await api.put(`checklists/${id}`, checklistHeaderPayload(checklist));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar checklist');
  }
};

export const deleteChecklist = async (_token: string, id: number) => {
  try {
    const response = await api.delete(`checklists/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao deletar checklist');
  }
};

export const getChecklistItemById = async (_token: string, id_item: number) => {
  try {
    const response = await api.get(`checklist-itens/${id_item}`);
    return ensureSuccess<ChecklistItem>(response.data, 'Item do checklist nao encontrado');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar item do checklist');
  }
};

export const addChecklistItem = async (_token: string, payload: ChecklistItem) => {
  try {
    const response = await api.post('checklist-itens', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao adicionar item do checklist');
  }
};

export const updateChecklistItem = async (_token: string, id_item: number, payload: ChecklistItem) => {
  try {
    const response = await api.put(`checklist-itens/${id_item}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar item do checklist');
  }
};

export const deleteChecklistItem = async (_token: string, id_item: number) => {
  try {
    const response = await api.delete(`checklist-itens/${id_item}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao deletar item do checklist');
  }
};

export const getChecklistAssuntos = async (_token: string) => {
  try {
    const response = await api.get('checklist/assuntos');
    return ensureSuccess<any[]>(response.data, 'Erro ao carregar assuntos vinculados');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar assuntos vinculados');
  }
};

export const getChecklistAssuntoById = async (_token: string, id_assunto: number) => {
  try {
    const response = await api.get(`checklist/assuntos/${id_assunto}`);
    const data = ensureSuccess<any>(response.data, 'Assunto vinculado nao encontrado');
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar assunto vinculado');
  }
};

export const getChecklistByAssuntoIxc = async (_token: string, assunto_ixc: number | string) => {
  try {
    const response = await api.get(`checklist/assuntos/ixc/${assunto_ixc}`);
    return ensureSuccess<any>(response.data, 'Checklist nao encontrado para o assunto IXC');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar checklist por assunto IXC');
  }
};

export const addChecklistAssunto = async (_token: string, payload: any) => {
  try {
    const response = await api.post('checklist/assuntos', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao vincular assunto');
  }
};

export const updateChecklistAssunto = async (_token: string, id_assunto: number, payload: any) => {
  try {
    const response = await api.put(`checklist/assuntos/${id_assunto}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar vinculo de assunto');
  }
};

export const deleteChecklistAssunto = async (_token: string, id_assunto: number) => {
  try {
    const response = await api.delete(`checklist/assuntos/${id_assunto}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao remover vinculo de assunto');
  }
};

export const getPontuacoesAssunto = async (_token: string) => {
  try {
    const response = await api.get('pontuacao-assunto');
    return ensureSuccess<any[]>(response.data, 'Erro ao carregar pontuacoes');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar pontuacoes');
  }
};

export const getPontuacaoAssuntoById = async (_token: string, id_score: number) => {
  try {
    const response = await api.get(`pontuacao-assunto/${id_score}`);
    return ensureSuccess<any>(response.data, 'Pontuacao nao encontrada');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar pontuacao');
  }
};

export const addPontuacaoAssunto = async (_token: string, payload: any) => {
  try {
    const response = await api.post('pontuacao-assunto', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao cadastrar pontuacao');
  }
};

export const updatePontuacaoAssunto = async (_token: string, id_score: number, payload: any) => {
  try {
    const response = await api.put(`pontuacao-assunto/${id_score}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar pontuacao');
  }
};

export const deletePontuacaoAssunto = async (_token: string, id_score: number) => {
  try {
    const response = await api.delete(`pontuacao-assunto/${id_score}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao remover pontuacao');
  }
};

export const getIxcFinalizacaoConfigs = async (_token: string, params: any = {}) => {
  try {
    const response = await api.get('ixc-finalizacao-configs', { params });
    const data = ensureSuccess<any>(response.data, 'Erro ao carregar configuracoes de finalizacao IXC');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.registros)) return data.registros;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar configuracoes de finalizacao IXC');
  }
};

export const getIxcFinalizacaoConfigById = async (_token: string, id: number | string) => {
  try {
    const response = await api.get(`ixc-finalizacao-configs/${id}`);
    const data = ensureSuccess<any>(response.data, 'Configuracao de finalizacao IXC nao encontrada');
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar configuracao de finalizacao IXC');
  }
};

export const addIxcFinalizacaoConfig = async (_token: string, payload: any) => {
  try {
    const response = await api.post('ixc-finalizacao-configs', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao criar configuracao de finalizacao IXC');
  }
};

export const updateIxcFinalizacaoConfig = async (_token: string, id: number | string, payload: any) => {
  try {
    const response = await api.put(`ixc-finalizacao-configs/${id}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar configuracao de finalizacao IXC');
  }
};

export const deleteIxcFinalizacaoConfig = async (_token: string, id: number | string) => {
  try {
    const response = await api.delete(`ixc-finalizacao-configs/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao remover configuracao de finalizacao IXC');
  }
};

export const ChecklistGetFiltered = async (_token: string, assunto_ixc: number | string) => {
  const vinculo = await getChecklistByAssuntoIxc(_token, assunto_ixc);
  const itens = vinculo?.checklist?.itens || [];

  return {
    vinculo,
    id_checklist: vinculo?.id_checklist || vinculo?.checklist?.id_checklist || vinculo?.checklist?.id,
    checklist: itens
      .slice()
      .sort((a: ChecklistItem, b: ChecklistItem) => Number(a.ordem) - Number(b.ordem))
      .map((item: ChecklistItem) => ({
        id: item.id_item,
        label: item.pergunta,
        type: item.tipo_resposta === 'texto' ? 'text' : 'checkbox',
        max_score: item.peso,
        ...item
      }))
  };
};

export const getOrdensServicoFinalizadas = async (_token: string, id_tecnico: number | string, data: string) => {
  try {
    const response = await api.get('ixc/ordens-servico/finalizadas', {
      params: {
        id_tecnico,
        data_inicio: data,
        data_fim: data,
        rp: 100
      }
    });

    return ensureSuccess<any>(response.data, 'Erro ao carregar ordens de servico finalizadas');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar ordens de servico finalizadas');
  }
};

export const addAvaliacaoN3 = async (_token: string, payload: any) => {
  try {
    const response = await api.post('avaliacoes-n3', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao registrar avaliacao N3');
  }
};

export const getAvaliacaoN3ById = async (_token: string, id_avaliacao: number | string) => {
  try {
    const response = await api.get(`avaliacoes-n3/${id_avaliacao}`);
    return ensureSuccess<any>(response.data, 'Avaliacao N3 nao encontrada');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar avaliacao N3');
  }
};

export const updateAvaliacaoN3 = async (_token: string, id_avaliacao: number | string, payload: any) => {
  try {
    const response = await api.put(`avaliacoes-n3/${id_avaliacao}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar avaliacao N3');
  }
};

export const verificarAvaliacaoN3 = async (_token: string, id_os: number | string) => {
  try {
    const response = await api.get(`avaliacoes-n3/verificar-os/${id_os}`);
    return ensureSuccess<any>(response.data, 'Erro ao verificar avaliacao da OS');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao verificar avaliacao da OS');
  }
};

export const ajustarPontuacao = async (_token: string, modulo: 'n2' | 'estoque' | 'rh', payload: any) => {
  try {
    const response = await api.post(`ajustes-pontuacao/${modulo}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao ajustar pontuacao');
  }
};

export const getHistoricosPontuacao = async (_token: string, modulo: 'n2' | 'estoque' | 'rh', params: any = {}) => {
  try {
    const response = await api.get(`historicos/${modulo}`, { params });
    return ensureSuccess<any>(response.data, 'Erro ao carregar historico');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar historico');
  }
};

const rankingConfiguracaoPayload = (payload: RankingConfiguracao) => ({
  meta_pontos_os_diaria: Number(payload.meta_pontos_os_diaria || 0),
  meta_media_avaliacoes: Number(payload.meta_media_avaliacoes || 0),
  dias_minimos_meta_mensal: Number(payload.dias_minimos_meta_mensal || 0),
  meses_minimos_meta_anual: Number(payload.meses_minimos_meta_anual || 0),
  ativo: Boolean(payload.ativo)
});

export const getRankingConfiguracaoAtiva = async (_token: string) => {
  try {
    const response = await api.get('ranking-configuracoes/ativa');
    return ensureSuccess<any>(response.data, 'Configuracao ativa nao encontrada');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar configuracao ativa');
  }
};

export const getRankingConfiguracoes = async (_token: string) => {
  try {
    const response = await api.get('ranking-configuracoes');
    const data = ensureSuccess<any[]>(response.data, 'Erro ao carregar configuracoes do ranking');
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar configuracoes do ranking');
  }
};

export const getRankingConfiguracaoById = async (_token: string, id: number | string) => {
  try {
    const response = await api.get(`ranking-configuracoes/${id}`);
    const data = ensureSuccess<any>(response.data, 'Configuracao do ranking nao encontrada');
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao buscar configuracao do ranking');
  }
};

export const addRankingConfiguracao = async (_token: string, payload: RankingConfiguracao) => {
  try {
    const response = await api.post('ranking-configuracoes', rankingConfiguracaoPayload(payload));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao criar configuracao do ranking');
  }
};

export const updateRankingConfiguracao = async (_token: string, id: number | string, payload: RankingConfiguracao) => {
  try {
    const response = await api.put(`ranking-configuracoes/${id}`, rankingConfiguracaoPayload(payload));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao atualizar configuracao do ranking');
  }
};

export const deleteRankingConfiguracao = async (_token: string, id: number | string) => {
  try {
    const response = await api.delete(`ranking-configuracoes/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao remover configuracao do ranking');
  }
};

export const getDailyRanking = async (_token: string, data: string) => getRankingDiario(_token, data);

export const getRankingDiario = async (_token: string, data: string) => {
  try {
    const response = await api.get('ranking/diario', { params: { data } });
    const dataResponse = ensureSuccess<any[]>(response.data, 'Erro ao carregar ranking diario');
    return Array.isArray(dataResponse) ? dataResponse : [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar ranking diario');
  }
};

export const getRankingMensal = async (_token: string, mesOuData: string | number, ano?: string | number) => {
  try {
    const dateParts = String(mesOuData).split('-');
    const mes = Number(ano ? mesOuData : dateParts[1]);
    const anoRanking = Number(ano || dateParts[0]);
    const response = await api.get('ranking/mensal', {
      params: {
        mes,
        ano: anoRanking
      }
    });
    const data = ensureSuccess<any[]>(response.data, 'Erro ao carregar ranking mensal');
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar ranking mensal');
  }
};

export const getRankingAnual = async (_token: string, ano?: string | number) => {
  try {
    const response = await api.get('ranking/anual', {
      params: ano ? { ano } : undefined
    });
    const data = ensureSuccess<any[]>(response.data, 'Erro ao carregar ranking anual');
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao carregar ranking anual');
  }
};

export const syncProducaoOs = async (_token: string, payload: { data_inicio: string; data_fim: string; rp?: number | string }) => {
  try {
    const response = await api.post('producao-os/sync', {
      data_inicio: payload.data_inicio,
      data_fim: payload.data_fim,
      rp: Number(payload.rp || 500)
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Erro ao sincronizar producao');
  }
};

export const getAvaliacoes = (..._args: any[]) => notMigrated('Avaliacoes N3');
export const getAvaliacoesN3 = (..._args: any[]) => notMigrated('OS finalizadas do dia');
export const getAvaliacoesN3Mensal = (..._args: any[]) => notMigrated('OS finalizadas do mes');
export const getRelatorio = (..._args: any[]) => notMigrated('Relatorio mensal');
export const getTutoriais = (..._args: any[]) => notMigrated('Tutoriais');
export const addTutorial = (..._args: any[]) => notMigrated('Tutoriais');
export const deleteTutorial = (..._args: any[]) => notMigrated('Tutoriais');
export const updateTutorial = (..._args: any[]) => notMigrated('Tutoriais');
export const getTutorialById = (..._args: any[]) => notMigrated('Tutoriais');
export const addAssunto = (..._args: any[]) => notMigrated('Assuntos');
export const getAssuntos = (..._args: any[]) => notMigrated('Assuntos');
export const getAssuntoById = (..._args: any[]) => notMigrated('Assuntos');
export const updateAssunto = (..._args: any[]) => notMigrated('Assuntos');
export const deleteAssunto = (..._args: any[]) => notMigrated('Assuntos');
export const addAvaliacao = (..._args: any[]) => notMigrated('Avaliacao N3');
export const addAvaliacaoN2 = (..._args: any[]) => notMigrated('Avaliacao N2');
export const addAvaliacaoEstoque = (..._args: any[]) => notMigrated('Avaliacao estoque');
export const addAvaliacaoRH = (..._args: any[]) => notMigrated('Avaliacao RH');
export const getHistorico = (..._args: any[]) => notMigrated('Historico N2');
export const getHistoricoEstoque = (..._args: any[]) => notMigrated('Historico estoque');
export const getHistoricoRH = (..._args: any[]) => notMigrated('Historico RH');
