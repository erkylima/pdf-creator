# PDF Creator

Monorepo para geração de PDFs com arquitetura hexagonal e micro-frontend.

## Estrutura

```
pdf-creator/
├── api/                    # API Express (arquitetura hexagonal)
│   ├── src/
│   │   ├── domain/         # Camada de domínio
│   │   ├── application/    # Casos de uso
│   │   ├── infrastructure/ # Implementações (Puppeteer)
│   │   └── interface/      # Controllers e rotas
│   └── templates/          # Templates HTML
├── frontend/               # Frontend React + Vite
│   └── src/
│       ├── components/     # Componentes React
│       └── styles.css      # Estilos
├── shared/                 # Assets compartilhados
│   └── assets/             # Logos e fotos
└── docker/                 # Configurações Docker
```

## Desenvolvimento

### Pré-requisitos

- Node.js 20+
- Docker (opcional, para orquestração)
- npm ou yarn

### Instalação

```bash
# Instalar dependências da API
cd api && npm install

# Instalar dependências do Frontend
cd ../frontend && npm install
```

### Executar sem Docker

```bash
# Terminal 1 - API
cd api
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

O frontend estará disponível em http://localhost:3000
A API estará disponível em http://localhost:3001

### Executar com Docker

**Produção:**
```bash
docker-compose up
```

**Desenvolvimento:**
```bash
docker-compose -f docker-compose.dev.yml up
```

## Arquitetura Hexagonal (API)

A API segue o padrão hexagonal com as seguintes camadas:

- **Domain**: Entidades e ports (interfaces)
- **Application**: Casos de uso (use cases)
- **Infrastructure**: Implementações concretas (PuppeteerPdfGenerator)
- **Interface**: Controllers e rotas Express

## Micro-Frontend (React + Vite)

O frontend está configurado como micro-frontend usando Vite:
- Build rápido com Vite
- HMR (Hot Module Replacement) em desenvolvimento
- Configuração para ser consumido como micro-frontend
- CORS habilitado para comunicação com a API

## Uso

Para a descrição completa dos recursos, campos JSON, backgrounds, fotos, cards e endpoints, consulte o [Guia de recursos do PDF Creator](./docs/recursos.md).

1. Acesse http://localhost:3000
2. Selecione o modelo (Impacto ou Documental)
3. Edite os slides com o editor visual e escolha um dos três temas (dark, light ou gold). Em cada slide, escolha uma das até três fotos carregadas, ajuste sua escala e selecione seu próprio background (overlay transparente, imagem personalizada ou nenhum). A imagem personalizada é carregada uma vez na configuração geral e pode ser aplicada individualmente aos slides desejados. Cada card interno pode ter seu próprio tema; no layout com foto centralizada são organizados até três cards por linha, e a última linha expande os cards para preencher o espaço disponível. Sem foto, o texto do conteúdo fica fora do card principal e somente os cards internos permanecem nele.
4. Opcionalmente, carregue uma imagem de background personalizada na configuração geral; selecione em cada slide se deseja usá-la.
5. Acompanhe o preview, atualizado automaticamente com a mesma renderização do PDF
6. Clique em "Gerar PDF"
7. O PDF será baixado automaticamente

Os overlays incluídos são PNGs transparentes de **1080x1350 px**, mesma resolução dos slides. Backgrounds enviados pelo usuário são ajustados para cobrir a página e só aparecem nos slides que selecionarem a opção personalizada.

O JSON exportado contém `model` e `slides` na raiz. O carregador também aceita arquivos antigos no formato `{ "slides": [...] }` e configurações com os slides em `content.slides`. Fotos e backgrounds são enviados separadamente; ao importar um JSON que usa `photo_id`, carregue novamente as imagens nos slots correspondentes.

## Scripts

```bash
# Desenvolvimento
cd api && npm run dev
cd frontend && npm run dev

# Build
cd api && npm run build
cd frontend && npm run build
```

## Resoluções

- **Impacto**: 1080x1350px
- **Documental**: 1080x1350px
