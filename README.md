# Ranking ADM

Painel administrativo do Ranking TI da Ti Connect. A aplicacao concentra login, dashboard, ranking, avaliacoes, cadastros e consultas operacionais usadas pelos setores internos.

Este README deve acompanhar a migracao para a nova API `/api/v1`. Sempre que uma rota, tela, regra de negocio, cor, tipografia ou fluxo mudar, documente aqui.

## Status da Migracao

Em andamento.

Modulo ja atualizado:
- Autenticacao: login, logout e leitura do usuario autenticado.
- Dashboard inicial apos login.
- Usuarios: listagem, detalhe, criacao, atualizacao e remocao.
- Setores: listagem, detalhe, criacao, atualizacao e remocao.
- Roles: listagem e contrato CRUD da API v1.
- Colaboradores: listagem, detalhe, criacao, atualizacao e remocao.
- Configuracoes IXC: CRUD e teste de conexao.
- Checklists: CRUD, itens ordenaveis por drag-and-drop, vinculos de assuntos e pontuacao por assunto.
- Ranking: diario, mensal, anual, configuracoes de metas e sincronizacao de producao OS.
- Base HTTP centralizada com token automatico.

Proximos modulos a revisar:
- Avaliacoes N3, N2, Estoque e RH.
- Cadastros de assuntos e tutoriais.

Rotas antigas:
- `src/services/api.ts` nao deve chamar endpoints antigos.
- Modulos ainda nao migrados mantem exports com erro controlado: `ainda nao foi migrado para a API v1`.
- Isso evita chamadas acidentais para rotas antigas enquanto a migracao continua.

## Stack

- React 19.
- React Router DOM 7.
- React Hook Form.
- Zod.
- Axios.
- Material UI e MUI Icons.
- React Icons.
- React Toastify.
- Chart.js e React Chart.js 2.
- Create React App / React Scripts.
- TypeScript em services e algumas paginas.

## Ambiente

O frontend le a URL base da API pelo arquivo `.env`.

```env
REACT_APP_API_BASE_URL=https://api-ranking.ticonnecte.com.br
```

Regras:
- A variavel precisa comecar com `REACT_APP_`, porque o React Scripts so expoe variaveis com esse prefixo.
- Nao incluir `/api/v1` no valor da variavel.
- O frontend adiciona `/api/v1/` automaticamente em `src/config/api.ts`.
- Depois de alterar `.env`, reinicie o `npm start`.

Exemplo final usado pelo app:

```txt
https://api-ranking.ticonnecte.com.br/api/v1/auth/login
```

## Scripts

```bash
npm start
npm run build
npm test
```

O projeto usa `homepage` como:

```txt
https://ticonnecte.com.br/ranking_adm/
```

Em desenvolvimento, a aplicacao abre em:

```txt
http://localhost:3000/ranking_adm/
```

## Estrutura Principal

```txt
src/
  api/
    axios.ts              Cliente HTTP base com token automatico
  config/
    api.ts                Montagem da URL base a partir do .env
  context/
    ThemeContext.js       Controle de dark/light mode
  components/
    sidebar/              Menu lateral e logout
    avaliacaoCard/        Card usado nas avaliacoes
    card/                 Card de colaborador
    inputs/               Inputs reutilizados no login
  pages/
    Login.jsx
    dashboard/
      index.jsx
    ranking-diario/
    ranking-mensal/
    avaliacoes/
    colaborador/
    user/
    setor/
    assunto/
    checklist/
    tutorial/
  routes/
    PrivateRoute.jsx
  services/
    authService.ts        Auth da API v1
    api.ts                Endpoints da aplicacao
  utils/
    auth.js               LocalStorage de autenticacao
```

## Autenticacao

### Login

Endpoint:

```http
POST /api/v1/auth/login
```

Payload:

```json
{
  "email_user": "renan3301@outlook.com",
  "senha_user": "mudar@123"
}
```

Resposta esperada:

```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "data": {
    "token_type": "Bearer",
    "access_token": "token",
    "user": {
      "id_user": 2,
      "nome_user": "Renan Felipe",
      "email_user": "renan3301@outlook.com",
      "role": 1,
      "setor_user": 5
    }
  }
}
```

Fluxo no frontend:
- `Login.jsx` envia `email` e `password` do formulario.
- `authService.login` converte para `email_user` e `senha_user`.
- `authService.login` valida `success` e `access_token`.
- `utils/auth.js` salva os dados no `localStorage`.
- Apos login, o usuario navega para `/dashboard`.

Chaves salvas no `localStorage`:
- `access_token`
- `user_id`
- `user_bd_id`
- `user_email`
- `user_name`
- `user_role`
- `user_setor`
- `auth_user`

Observacao: algumas telas antigas ainda leem `user_id`, por isso o helper mantem compatibilidade com `id_ixc`, `id_ixc_user` e `id_user`.

### Logout

Endpoint:

```http
POST /api/v1/auth/logout
```

O token e enviado automaticamente pelo interceptor do Axios.

### Usuario Autenticado

Endpoint:

```http
GET /api/v1/auth/me
```

## Cliente HTTP

Arquivo:

```txt
src/api/axios.ts
```

Responsabilidades:
- Usar `API_BASE_URL` de `src/config/api.ts`.
- Definir headers JSON.
- Aplicar timeout de `100000ms`.
- Injetar `Authorization: Bearer <token>` em toda request autenticada.

Arquivo:

```txt
src/config/api.ts
```

Responsabilidade:
- Ler `REACT_APP_API_BASE_URL` do `.env`.
- Remover barras finais duplicadas.
- Adicionar `/api/v1/`.

## Rotas Frontend

Rotas principais:
- `/`: login.
- `/dashboard`: dashboard inicial apos login.
- `/home`: selecao de colaboradores para avaliacao.
- `/ranking-diario`: ranking diario.
- `/ranking-mensal`: ranking mensal.
- `/ranking-anual`: ranking anual.
- `/ranking-configuracoes`: configuracoes do ranking.
- `/ranking-configuracao/:id`: formulario de configuracao do ranking.
- `/avaliar/N3/:id`: avaliacao N3.
- `/avaliar/N2/:id`: avaliacao N2.
- `/avaliar/estoque/:id`: avaliacao Estoque.
- `/avaliar/rh/:id`: avaliacao RH.
- `/movimentacoes/:id`: historico N2.
- `/estoque/movimentacoes/:id`: historico Estoque.
- `/rh/movimentacoes/:id`: historico RH.
- `/usuarios`: usuarios.
- `/usuario/:id`: formulario de usuario.
- `/setores`: setores.
- `/setor/:id`: formulario de setor.
- `/colaboradores`: colaboradores.
- `/colaborador/:id`: formulario de colaborador.
- `/ixc-configs`: configuracoes de integracao IXC.
- `/ixc-config/:id`: formulario de configuracao IXC.
- `/checklists`: checklists.
- `/checklist/:id`: formulario de checklist.
- `/assuntos`: vinculos entre assunto IXC e checklist.
- `/assunto/:id`: formulario de vinculo de assunto IXC.
- `/checklist-scores`: pontuacoes dos assuntos vinculados.
- `/checklist-score/:id`: formulario de pontuacao por assunto.
- `/tutoriais`: tutoriais.
- `/tutorial/:id`: formulario de tutorial.
Todas as rotas privadas passam por `src/routes/PrivateRoute.jsx`, que valida `access_token`.

## Ranking

Arquivos:

```txt
src/pages/ranking-diario/index.jsx
src/pages/ranking-mensal/index.jsx
src/pages/ranking-anual/index.jsx
src/pages/ranking-config/index.jsx
src/pages/ranking-config/form.jsx
```

Menu:
- Ranking > Ranking Diario.
- Ranking > Ranking Mensal.
- Ranking > Ranking Anual.
- Configuracoes > Ranking.

### Ranking Diario

Endpoint:

```http
GET /api/v1/ranking/diario?data=2026-05-14
```

Uso no frontend:
- Um campo de data filtra o dia consultado.
- Cada tecnico aparece em um card ordenado pelo retorno da API.
- O card mostra OS, pontos, media geral e percentual da meta.
- Ao expandir, exibe nota de producao, nota de qualidade, qualidade por setor e detalhes das OS.

Campos principais:
- `id_tecnico`
- `nome_tecnico`
- `producao.total_os`
- `producao.total_pontos`
- `producao.meta_diaria`
- `producao.percentual_meta`
- `producao.detalhes`
- `ranking.nota_producao`
- `ranking.nota_qualidade`
- `ranking.media_geral`
- `qualidade.por_setor`

### Sincronizacao de Producao OS

Endpoint:

```http
POST /api/v1/producao-os/sync
```

Payload:

```json
{
  "data_inicio": "2026-05-01",
  "data_fim": "2026-05-22",
  "rp": 500
}
```

Uso no frontend:
- Fica dentro do Ranking Diario.
- Possui data de inicio, data de fim e limite `rp`.
- Depois de sincronizar, o ranking diario e recarregado.

### Ranking Mensal

Endpoint:

```http
GET /api/v1/ranking/mensal?mes=5&ano=2026
```

Uso no frontend:
- Um campo `month` escolhe mes e ano.
- Cada tecnico mostra total de OS, pontos de producao, media geral mensal e progresso da meta mensal.
- Ao expandir, exibe os dias do mes com OS, pontos, qualidade e media geral.

### Ranking Anual

Endpoint:

```http
GET /api/v1/ranking/anual
```

Uso no frontend:
- Um campo de ano filtra a consulta.
- Cada tecnico mostra total de OS, pontos de producao, media geral anual e progresso da meta anual.
- Ao expandir, exibe os 12 meses com OS, pontos, qualidade e media mensal.

### Configuracoes do Ranking

Endpoints:

```http
GET /api/v1/ranking-configuracoes/ativa
GET /api/v1/ranking-configuracoes
GET /api/v1/ranking-configuracoes/:id_configuration
POST /api/v1/ranking-configuracoes
PUT /api/v1/ranking-configuracoes/:id_configuration
DELETE /api/v1/ranking-configuracoes/:id_configuration
```

Payload:

```json
{
  "meta_pontos_os_diaria": 100,
  "meta_media_avaliacoes": 10,
  "dias_minimos_meta_mensal": 13,
  "meses_minimos_meta_anual": 10,
  "ativo": true
}
```

Regras no frontend:
- A listagem destaca a configuracao ativa.
- O formulario cria e edita metas de producao, qualidade e recorrencia.
- O campo `ativo` e booleano.

## Dashboard

Arquivo:

```txt
src/pages/dashboard/index.jsx
```

O dashboard e a primeira tela apos o login.

### Endpoints

Resumo:

```http
GET /api/v1/dashboard/resumo?data=2026-05-24
```

Top assuntos:

```http
GET /api/v1/dashboard/top-assuntos?data_inicio=2026-05-01&data_fim=2026-05-24&limit=50
```

Producao por dia:

```http
GET /api/v1/dashboard/producao-por-dia?data_inicio=2026-05-01&data_fim=2026-05-24&limit=50
```

### Filtros

Existem dois grupos de filtro:

1. Resumo
- Usa apenas uma data.
- Fica na barra superior do dashboard, ao lado do titulo.
- Campo: `Data do resumo`.
- Parametro enviado: `data`.
- Exemplo: `2026-05-24`.

2. Graficos e listas
- Usa intervalo de datas.
- Fica abaixo dos cards de resumo e acima dos paineis de graficos.
- Campos: `Inicio` e `Fim`.
- Parametros enviados: `data_inicio` e `data_fim`.
- Afeta `top-assuntos` e `producao-por-dia`.

### Limite de Data

Nao e permitido pesquisar pela data atual.

Motivo:
- O banco atualiza as OS do dia apenas no final do dia.
- Pesquisar a data atual pode exibir dados incompletos.

Regra aplicada:
- A data maxima dos filtros e sempre ontem.
- O valor padrao do resumo e ontem.
- O valor padrao do fim dos graficos e ontem.
- O valor padrao do inicio dos graficos e o primeiro dia do mes, desde que nao seja maior que ontem.

### Cards do Resumo

Campos exibidos:
- Tecnicos ativos.
- OS finalizadas.
- Pontos producao.
- Media qualidade.
- Bateram meta.
- Meta diaria.

### Paineis

Top assuntos:
- Mostra ate 12 assuntos.
- Exibe nome do assunto, total de OS e total de pontos.
- Barra proporcional baseada no maior `total_os` retornado.

Producao por dia:
- Exibe data, total de OS e pontos.
- Barra proporcional baseada no maior `total_pontos` retornado.

## Sidebar

Arquivo:

```txt
src/components/sidebar/index.jsx
```

Responsabilidades:
- Navegacao entre modulos.
- Toggle de tema.
- Logout integrado com `/auth/logout`.
- Acesso ao dashboard.
- Modais de OS do dia e OS do mes para usuarios do setor adequado.

Permissoes atuais baseadas em `localStorage`:
- `user_role`
- `user_setor`
- `user_id`

## Design System Atual

O projeto usa variaveis CSS globais em:

```txt
src/pages/styles.css
```

### Tipografia

Fonte principal:

```css
font-family: "Poppins", sans-serif;
```

Import:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
```

Uso atual:
- Titulos de tela: 24px a 32px.
- Titulos de painel: 18px a 20px.
- Texto auxiliar: 13px a 14px.
- Numeros de destaque no dashboard: 26px.

### Cores

Cor primaria:

```txt
#FF6200
```

Dark mode:

```txt
--colorPrimary-dark: #FF6200
--colorSecundary-dark: #fff
--colorBlack-dark: #000
--colorDark-dark: #262233
--colorDarkForm-dark: #342E45
--textColor-dark: #fff
--BSPrimary-dark: rgba(109, 108, 108, 0.24) 0px 3px 8px
```

Light mode:

```txt
--colorPrimary-light: #FF6200
--colorSecundary-light: #fff
--colorBlack-light: #000
--colorDark-light: #f5f4f4
--colorDarkForm-light: #ffffff
--textColor-light: #333
--BSprimary-light: #FF6200 0px 3px 8px
```

Variaveis ativas:

```txt
--colorPrimary
--colorSecundary
--colorBlack
--colorDark
--colorDarkForm
--textColor
--BSPrimary
--colorPrimary-rgb
```

### Tema

Contexto:

```txt
src/context/ThemeContext.js
```

Regras:
- Dark mode e o padrao inicial.
- Light mode usa a classe `.light-mode`.
- Preferencia e persistida em `localStorage` pela chave `darkMode`.

### Componentes Visuais

Padroes atuais:
- Cards com `border-radius` entre 8px e 10px.
- Fundo de paineis em `--colorDarkForm`.
- Fundo geral em `--colorDark`.
- Texto principal em `--textColor`.
- Destaques e botoes primarios em `--colorPrimary`.
- Sidebar fixa com opcao de esconder.
- Botoes de acao usam icones do MUI quando disponiveis.

## Regras de Codigo

Padroes adotados nesta migracao:
- Centralizar chamadas HTTP em `src/api/axios.ts`.
- Centralizar URL da API em `src/config/api.ts`.
- Usar `authService.ts` apenas para autenticacao.
- Usar `services/api.ts` para endpoints de negocio.
- Nao repetir header `Authorization` quando o interceptor ja cobre.
- Validar o envelope da API nova com `success` e `data`.
- Manter compatibilidade de `localStorage` ate todas as telas antigas serem migradas.
- Comentarios devem explicar regra de negocio ou compatibilidade, nao o obvio.

## Build e Validacao

Comando usado para validar:

```bash
npm run build
```

Status atual:
- Build compila.
- Existem warnings antigos de lint em `sidebar`.
- Esses warnings nao bloqueiam o build e ainda nao fazem parte da migracao atual.

Warnings conhecidos:
- Comparacao com `==` em `sidebar`.
- Dependencias faltantes em alguns `useEffect`.

## Observacoes Importantes

- O backend novo retorna dados no envelope `{ success, message, data }`.
- Rotas antigas foram desvinculadas do service principal.
- A migracao deve ser feita por modulo para evitar quebrar telas ja usadas em producao.
- A data atual nao deve ser usada em consultas de OS no dashboard porque o banco so fecha os dados do dia ao final do dia.

## Usuarios

Arquivo de listagem:

```txt
src/pages/user/index.jsx
```

Arquivo de formulario:

```txt
src/pages/user/usuario.jsx
```

Funcoes de API:

```txt
src/services/api.ts
```

### Endpoints

Listar usuarios:

```http
GET /api/v1/users
```

Resposta:

```json
{
  "success": true,
  "message": "Operacao realizada com sucesso.",
  "data": [
    {
      "id_user": 54,
      "nome_user": "api",
      "id_ixc_user": 9999,
      "email_user": "api@ticonnecte.com.br",
      "role": 3,
      "setor_user": 5
    }
  ]
}
```

Buscar usuario por ID:

```http
GET /api/v1/users/:id_user
```

Criar usuario:

```http
POST /api/v1/users
```

Payload:

```json
{
  "nome_user": "",
  "id_ixc_user": "",
  "email_user": "",
  "senha_user": "",
  "role": "",
  "setor_user": ""
}
```

Atualizar usuario:

```http
PUT /api/v1/users/:id_user
```

Payload:

```json
{
  "nome_user": "Nelson N4",
  "id_ixc_user": "229",
  "email_user": "nelson@ticonnecte.com.br",
  "senha_user": "",
  "role": "1",
  "setor_user": "5"
}
```

Remover usuario:

```http
DELETE /api/v1/users/:id_user
```

### Regras no Frontend

- A tela ainda monta `FormData`, mas `services/api.ts` converte para JSON antes de enviar para a API v1.
- `senha_user` e obrigatoria na criacao.
- `senha_user` pode ser enviada vazia na atualizacao para manter a senha atual.
- O token e enviado pelo interceptor do Axios, sem repetir `Authorization` nas funcoes de usuarios.

## Setores

Arquivo de listagem:

```txt
src/pages/setor/index.jsx
```

Arquivo de formulario:

```txt
src/pages/setor/setor.jsx
```

Funcoes de API:

```txt
src/services/api.ts
```

### Endpoints

Listar setores:

```http
GET /api/v1/sectors
```

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id_setor": 21,
      "nome_setor": "Atendimento"
    }
  ]
}
```

Buscar setor por ID:

```http
GET /api/v1/sectors/:id_setor
```

Criar setor:

```http
POST /api/v1/sectors
```

Payload:

```json
{
  "nome_setor": "Teste Api"
}
```

Atualizar setor:

```http
PUT /api/v1/sectors/:id_setor
```

Payload:

```json
{
  "nome_setor": "Teste Api v2"
}
```

Remover setor:

```http
DELETE /api/v1/sectors/:id_setor
```

### Regras no Frontend

- As telas de usuarios dependem de `getSetores` para exibir o nome do setor.
- A tela ainda monta `FormData`, mas `services/api.ts` converte para JSON antes de enviar para a API v1.
- O token e enviado pelo interceptor do Axios, sem repetir `Authorization` nas funcoes de setores.

## Roles

Funcoes de API:

```txt
src/services/api.ts
```

Uso atual:
- O formulario de usuarios carrega roles por `GET /api/v1/roles`.
- O select de nivel de acesso nao deve ficar hardcoded.

### Endpoints

Listar roles:

```http
GET /api/v1/roles
```

Buscar role por ID:

```http
GET /api/v1/roles/:id_role
```

Criar role:

```http
POST /api/v1/roles
```

Atualizar role:

```http
PUT /api/v1/roles/:id_role
```

Remover role:

```http
DELETE /api/v1/roles/:id_role
```

Formato principal:

```json
{
  "id_role": 1,
  "nome_role": "Administrador",
  "created_at": "2026-05-19T00:02:25.000000Z",
  "updated_at": null
}
```

## Colaboradores

Arquivo de listagem:

```txt
src/pages/colaborador/index.jsx
```

Arquivo de formulario:

```txt
src/pages/colaborador/colaborador.jsx
```

Funcoes de API:

```txt
src/services/api.ts
```

### Endpoints

Listar colaboradores:

```http
GET /api/v1/colaborators
```

Buscar colaborador por ID:

```http
GET /api/v1/colaborators/:id_colaborador
```

Criar colaborador:

```http
POST /api/v1/colaborators
```

Payload:

```json
{
  "id_ixc": "232",
  "nome_colaborador": "Nelson N4",
  "setor_colaborador": "5"
}
```

Atualizar colaborador:

```http
PUT /api/v1/colaborators/:id_colaborador
```

Payload:

```json
{
  "id_ixc": "232",
  "nome_colaborador": "Nelson N3",
  "setor_colaborador": "5"
}
```

Remover colaborador:

```http
DELETE /api/v1/colaborators/:id_colaborador
```

### Regras no Frontend

- A tela ainda monta `FormData`, mas `services/api.ts` converte para JSON antes de enviar para a API v1.
- A tela de cadastro/edicao nao envia foto, porque a API v1 documentada para colaboradores nao recebe imagem nesse fluxo.
- `url_image` vindo da API e usado apenas na listagem para exibir a imagem do colaborador.
- O token e enviado pelo interceptor do Axios, sem repetir `Authorization` nas funcoes de colaboradores.

## Configuracoes IXC

Arquivo de listagem:

```txt
src/pages/ixc-config/index.jsx
```

Arquivo de formulario:

```txt
src/pages/ixc-config/form.jsx
```

Funcoes de API:

```txt
src/services/api.ts
```

Menu:
- Configuracoes > IXC.

### Endpoints

Listar configuracoes IXC:

```http
GET /api/v1/ixc-configs
```

Buscar configuracao por ID:

```http
GET /api/v1/ixc-configs/:id
```

Criar configuracao:

```http
POST /api/v1/ixc-configs
```

Payload:

```json
{
  "nome": "IXCSoft",
  "base_url": "https://central.ticonnecte.com.br/webservice/v1",
  "token": "210:token",
  "ativo": true
}
```

Atualizar configuracao:

```http
PUT /api/v1/ixc-configs/:id
```

Payload:

```json
{
  "nome": "IXCSoft V1",
  "base_url": "https://central.ticonnecte.com.br/webservice/v1",
  "token": "",
  "ativo": true
}
```

Remover configuracao:

```http
DELETE /api/v1/ixc-configs/:id
```

Testar conexao:

```http
GET /api/v1/ixc/testar-conexao
```

### Regras no Frontend

- O token e obrigatorio na criacao.
- Na edicao, o token pode ficar vazio para manter o token atual no backend.
- O campo `ativo` e um checkbox booleano.
- A listagem mostra `nome`, `base_url` e status ativo/inativo.
- A acao `Testar conexao` chama `GET /ixc/testar-conexao` usando apenas a autenticacao do usuario logado.

## Checklists

Arquivo de listagem:

```txt
src/pages/checklist/index.jsx
```

Arquivo de formulario:

```txt
src/pages/checklist/checklist.jsx
```

Funcoes de API:

```txt
src/services/api.ts
```

### Endpoints de Checklist

Listar checklists:

```http
GET /api/v1/checklists
```

Buscar checklist por ID:

```http
GET /api/v1/checklists/:id_checklist
```

Criar checklist:

```http
POST /api/v1/checklists
```

Atualizar checklist:

```http
PUT /api/v1/checklists/:id_checklist
```

Remover checklist:

```http
DELETE /api/v1/checklists/:id_checklist
```

Payload de criacao:

```json
{
  "nome_checklist": "Checklist Instalacao Fibra",
  "ativo": true,
  "itens": [
    {
      "pergunta": "ONU foi fixada corretamente?",
      "tipo_resposta": "sim_nao",
      "peso": 2,
      "obrigatorio": true,
      "ordem": 1
    }
  ]
}
```

Payload de atualizacao do checklist:

```json
{
  "nome_checklist": "Checklist Instalacao Fibra",
  "ativo": true
}
```

Importante:
- `PUT /checklists/:id_checklist` altera apenas nome e status do checklist.
- Para adicionar item em um checklist existente, use `POST /checklist-itens` passando `id_checklist`.
- Para alterar ou remover itens existentes, use as rotas de `checklist-itens`.

### Itens do Checklist

Buscar item:

```http
GET /api/v1/checklist-itens/:id_item
```

Criar item:

```http
POST /api/v1/checklist-itens
```

Payload:

```json
{
  "id_checklist": 1,
  "pergunta": "Cliente assinou o termo?",
  "tipo_resposta": "sim_nao",
  "peso": 2,
  "obrigatorio": false,
  "ordem": 2
}
```

Atualizar item:

```http
PUT /api/v1/checklist-itens/:id_item
```

Remover item:

```http
DELETE /api/v1/checklist-itens/:id_item
```

### Vinculo Checklist x Assunto IXC

Arquivo:

```txt
src/pages/assunto/index.jsx
src/pages/assunto/assunto.jsx
```

A rota `/assuntos` nao cadastra mais uma tabela antiga de assuntos. Ela lista e gerencia os vinculos retornados por `checklist/assuntos`, relacionando:

- `id_assunto_ixc`: ID do assunto no IXC.
- `nome_assunto_ixc`: nome exibido para o assunto.
- `id_checklist`: checklist usado quando uma OS desse assunto for avaliada.

Listar vinculos:

```http
GET /api/v1/checklist/assuntos
```

Buscar vinculo por ID:

```http
GET /api/v1/checklist-assuntos/:id_assunto
```

Buscar checklist por assunto IXC:

```http
GET /api/v1/checklist/assuntos/ixc/:assunto_ixc
```

Criar vinculo:

```http
POST /api/v1/checklist/assuntos
```

Atualizar vinculo:

```http
PUT /api/v1/checklist/assuntos/:id_assunto
```

Remover vinculo:

```http
DELETE /api/v1/checklist/assuntos/:id_assunto
```

### Pontuacao por Assunto

Arquivo:

```txt
src/pages/checklist-score/index.jsx
src/pages/checklist-score/form.jsx
```

A rota `/checklist-scores` gerencia a pontuacao de cada vinculo `Checklist x Assunto IXC`. Essa pontuacao representa quantos pontos uma OS daquele assunto deve somar no futuro ranking de quantidade.

Campos usados:

- `id_checklist_assunto`: vinculo criado em `/assuntos`.
- `pontos`: pontuacao aplicada ao assunto.
- `ativo`: define se a pontuacao esta disponivel para uso.

Listar pontuacoes:

```http
GET /api/v1/pontuacao-assunto
```

Buscar pontuacao:

```http
GET /api/v1/pontuacao-assunto/:id_score
```

Criar pontuacao:

```http
POST /api/v1/pontuacao-assunto
```

Atualizar pontuacao:

```http
PUT /api/v1/pontuacao-assunto/:id_score
```

Remover pontuacao:

```http
DELETE /api/v1/pontuacao-assunto/:id_score
```

## Avaliacoes N3

Arquivos:

```txt
src/pages/avaliacoes/n3/index.jsx
src/components/avaliacaoN3Card/index.jsx
src/components/avaliacaoN3Card/styles.css
```

Fluxo:

- A tela inicial de colaboradores envia o `id_ixc` do tecnico na rota `/avaliar/N3/:id`.
- O `id_colaborador` interno segue no query param `?bd=...` para registrar a avaliacao.
- A tela N3 possui apenas um campo de data.
- Essa mesma data e enviada como `data_inicio` e `data_fim`.
- Cada OS encontrada consulta se ja foi avaliada.
- Ao avaliar, o checklist e carregado pelo `id_assunto_ixc` da OS.

Listar OS finalizadas do tecnico no dia:

```http
GET /api/v1/ixc/ordens-servico/finalizadas?id_tecnico=:id_ixc&data_inicio=2026-05-19&data_fim=2026-05-19
```

Registrar avaliacao:

```http
POST /api/v1/avaliacoes-n3
```

Verificar se a OS ja foi avaliada:

```http
GET /api/v1/avaliacoes-n3/verificar-os/:id_os
```

Buscar avaliacao:

```http
GET /api/v1/avaliacoes-n3/:id_avaliacao
```

Atualizar avaliacao:

```http
PUT /api/v1/avaliacoes-n3/:id_avaliacao
```

Payload de criacao:

```json
{
  "id_os": 546579,
  "id_assunto_ixc": 10,
  "id_checklist": 2,
  "desc_os": "teste api",
  "data_finalizacao_os": "2026-05-25",
  "data_finalizacao": "2026-05-25",
  "id_tecnico": 8,
  "id_setor": 5,
  "respostas": [
    {
      "id_item": 5,
      "resposta": false,
      "pontuacao": 0
    }
  ]
}
```

Payload de atualizacao:

```json
{
  "desc_os": "Cliente solicitou mudanca de ONU.",
  "id_assunto_ixc": 425,
  "id_checklist": 1,
  "data_finalizacao_os": "2026-05-19",
  "data_finalizacao": "2026-05-19",
  "id_tecnico": 123,
  "id_setor": 5,
  "respostas": [
    {
      "id_item": 1,
      "resposta": true,
      "pontuacao": 2
    }
  ]
}
```

## Ajustes De Pontuacao

Arquivos:

```txt
src/pages/avaliacoes/AjustePontuacaoPage.jsx
src/pages/avaliacoes/HistoricoPontuacaoPage.jsx
src/pages/avaliacoes/ajusteConfig.js
```

As avaliacoes de N2, Estoque e RH usam o mesmo fluxo: selecionar data de referencia, campo do checklist, tipo de movimentacao, pontos e observacao.

Rotas de ajuste:

```http
POST /api/v1/ajustes-pontuacao/n2
POST /api/v1/ajustes-pontuacao/estoque
POST /api/v1/ajustes-pontuacao/rh
```

Payload:

```json
{
  "id_tecnico": 21,
  "data_referencia": "2026-05-15",
  "campo": "ponto_finalizacao_os",
  "pontos": 10,
  "tipo_movimentacao": "REMOCAO",
  "observacao": "O.S finalizada no lugar errado"
}
```

`tipo_movimentacao`:

- `REMOCAO`: remove pontos.
- `DEVOLUCAO`: adiciona/devolve pontos.

Rotas de historico:

```http
GET /api/v1/historicos/n2?id_tecnico=21&tipo_movimentacao=REMOCAO&data_inicio=2026-05-01&data_fim=2026-05-15
GET /api/v1/historicos/estoque?id_tecnico=24&tipo_movimentacao=DEVOLUCAO&data_inicio=2026-05-01&data_fim=2026-05-15
GET /api/v1/historicos/rh?id_tecnico=10&tipo_movimentacao=REMOCAO&data_inicio=2026-05-01&data_fim=2026-05-15
```

Campos configurados no frontend:

N2:
- `ponto_finalizacao_os`
- `ponto_lavagem_carro`
- `organizacao_material`
- `ponto_fardamento`

Estoque:
- `pnt_pedido`
- `pnt_prazo`
- `pnt_etiqueta`
- `pnt_baixa_mat`
- `pnt_troca_equip`
- `pnt_transferencia`

RH:
- `pnt_ponto`
- `pnt_atestado`
- `pnt_falta`

### Regras no Frontend

- A listagem mostra nome, status e preview dos primeiros itens.
- O formulario permite editar nome, status e itens.
- Cada item possui pergunta, tipo de resposta, peso, obrigatoriedade e ordem.
- A ordem e gerenciada por arrastar e soltar os itens.
- Ao salvar, o frontend recalcula `ordem` a partir da posicao visual.
- Tipos aceitos no formulario: `sim_nao`, `nota`, `texto`.
- Para avaliacao de OS, `ChecklistGetFiltered` busca o checklist por assunto IXC em `/checklist/assuntos/ixc/:assunto_ixc`.
