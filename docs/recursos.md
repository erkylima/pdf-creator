# Recursos do PDF Creator

O PDF Creator cria carrosséis em PDF a partir de slides editáveis. O preview e o PDF usam o mesmo template e a mesma renderização.

## Configuração geral

### Modelo

O seletor oferece **Impacto** e **Documental**. Ambos geram páginas de **1080 × 1350 px**; o nome do modelo é incluído no nome do PDF e na configuração JSON.

### Fotos

- É possível carregar até **três fotos**, nos formatos de imagem aceitos pelo navegador.
- Cada slide com uma posição de foto pode usar uma foto específica ou a opção automática.
- A seleção automática usa a primeira foto carregada; se nenhuma tiver sido enviada, o gerador tenta usar `shared/assets/minha-foto.png`.
- Remover uma foto também limpa as seleções explícitas de slides que apontavam para aquele slot.
- Cada foto pode ser **espelhada horizontalmente** e ajustada pela escala do slide.
- Fotos e arquivos de background não são incluídos no JSON exportado; precisam ser carregados novamente depois de importar uma configuração.

### Background personalizado

Na configuração geral, carregue uma imagem personalizada. Em seguida, escolha em cada slide se ela será usada. Remover o arquivo personalizado desativa essa opção nos slides que a utilizavam.

O seletor individual de background também oferece três PNGs transparentes, todos em **1080 × 1350 px**:

- **Arcos dourados** (`gold-arcs`)
- **Brilho azul** (`blue-glow`)
- **Partículas nas bordas** (`edge-specks`)
- **Imagem personalizada** (`custom`), quando houver um arquivo carregado
- **Nenhum** (`none`), que deixa visível apenas o fundo do tema

Overlays ficam à frente do fundo do tema e atrás das fotos e do conteúdo. Imagens personalizadas são ajustadas para cobrir toda a página e podem perder partes nas bordas dependendo da proporção da imagem.

## Edição dos slides

É possível adicionar slides e remover slides existentes. O editor mantém pelo menos um slide.

### Tema visual

Cada slide pode usar um dos temas:

- **Dark**: fundo escuro e texto claro, com acentos dourados.
- **Light**: fundo claro e texto escuro.
- **Gold**: fundo dourado e texto escuro.

### Background por slide

O background é escolhido individualmente no editor de cada slide. Os overlays incluídos e o arquivo personalizado são independentes do tema visual; selecionar **Nenhum** preserva o gradiente do tema.

### Foto e posição

As posições disponíveis são:

- **Sem foto**: não adiciona uma foto ao slide.
- **Centralizada**: posiciona a foto no centro da composição.
- **Inferior direita** e **inferior esquerda**: posicionam a foto lateralmente, próxima à borda inferior.

Quando uma posição é escolhida, também ficam disponíveis:

- **Foto neste slide**: escolha uma das fotos carregadas ou use a seleção automática.
- **Escala da foto (1–20)**: aceita incrementos de 0,1. O valor 1 representa o tamanho normal; o valor máximo corresponde a aproximadamente 2,9×.
- **Espelhar foto**: inverte a foto horizontalmente.

### Texto

- **Tag**: texto opcional exibido como chamada acima do título.
- **Título**: título do slide.
- **Conteúdo**: texto opcional; quebras de linha são preservadas na composição.

### Card principal e cards internos

Ative **Exibir conteúdo em card** para usar o layout estruturado. Nesse layout, é possível adicionar/remover cards internos, cada um com:

- Título.
- Detalhe opcional.
- Tema próprio (**Dark**, **Light** ou **Gold**). Se não houver tema salvo no JSON, o tema do slide é usado como padrão.

O posicionamento depende da imagem:

- **Com foto**: o texto do conteúdo e os cards internos ficam dentro do card principal.
- **Sem foto**: o texto do conteúdo fica fora do card principal; somente os cards internos ficam dentro dele.
- **Foto centralizada**: os cards internos usam até três colunas. A última linha se expande para ocupar toda a largura: um card ocupa a linha inteira, dois dividem a linha e três ficam lado a lado.

### Logo e paginação

- **Ocultar logo** remove a logo daquele slide.
- A numeração de página é exibida automaticamente no rodapé.
- O gerador seleciona a variante clara ou escura da logo conforme o tema.

## Preview e geração

- O preview é atualizado automaticamente após mudanças no modelo, nos slides ou nos arquivos carregados.
- Use as setas para navegar entre as páginas e **Ocultar/Mostrar** para recolher ou exibir o preview.
- **Gerar PDF** cria e baixa `carrossel-impacto.pdf` ou `carrossel-documental.pdf`.
- A geração de PDF e o preview usam o mesmo endpoint de composição e template HTML.

## Importar e exportar JSON

Use **Exportar JSON** para salvar `model` e `slides`; use **Carregar JSON** para restaurar uma configuração.

Formato atual:

```json
{
  "model": "impacto",
  "slides": [
    {
      "theme": "dark",
      "background": "gold-arcs",
      "photo_position": "bottom-right",
      "photo_id": 1,
      "photo_flip": false,
      "scale": 1,
      "tag": "EXEMPLO",
      "title": "Título do slide",
      "content": "Texto do slide.",
      "cards_enabled": true,
      "cards": [
        {
          "title": "Destaque",
          "content": "Detalhe opcional",
          "theme": "gold"
        }
      ],
      "hidden_logo": false
    }
  ]
}
```

Campos reconhecidos:

| Campo | Valores / tipo | Observações |
|---|---|---|
| `model` | `impacto`, `documental` | Opcional ao importar; sem ele, mantém o modelo atualmente selecionado. |
| `theme` | `dark`, `light`, `gold` | Opcional; o tema padrão é `dark`. |
| `background` | `none`, `gold-arcs`, `blue-glow`, `edge-specks`, `custom` | Opcional. `custom` requer carregar novamente o arquivo de imagem na configuração geral. |
| `photo_position` | `bottom-right`, `bottom-left`, `center` | Opcional; sem posição, a foto não é exibida. |
| `photo_id` | `1`, `2`, `3` | Opcional; referência a um dos três slots de foto. |
| `photo_flip` | `true`, `false` | Opcional; espelhamento horizontal. |
| `scale` | número de `1` a `20` | Opcional; escala da foto. |
| `tag` | texto | Opcional. |
| `title` | texto | Obrigatório em cada slide. |
| `content` | texto | Opcional; aceita `\n` para quebras de linha. |
| `cards_enabled` | `true`, `false` | Opcional; ativa o layout estruturado com card principal. |
| `cards` | array de cards | Cada card tem `title` obrigatório e `content` e `theme` opcionais. |
| `hidden_logo` | `true`, `false` | Opcional. |

O importador também aceita configurações antigas com slides em `content.slides` e arquivos no formato `{ "slides": [...] }`. O tema legado `centered` é convertido para `dark` e ativa o card de conteúdo. Arquivos com fotos/backgrounds não são empacotados junto do JSON; recarregue as imagens e confirme os respectivos `photo_id`/backgrounds após importar.

## Limites de upload

A API aceita até três arquivos de foto, um background personalizado e os overlays usados pelos slides. O limite de upload configurado é **50 MiB por arquivo**.

## API

- `GET /health`: informa se a API está ativa.
- `POST /api/pdf/preview`: recebe configuração e imagens em `multipart/form-data`; retorna páginas PNG codificadas em Base64.
- `POST /api/pdf/generate`: recebe a mesma configuração e imagens; retorna o PDF.

Nos dois endpoints, os campos `multipart/form-data` são:

| Campo | Conteúdo |
|---|---|
| `config` | JSON serializado com `model` e `content.slides`. |
| `photo1`, `photo2`, `photo3` | Arquivos dos slots de fotos. O campo legado `photo` também é aceito como primeira foto. |
| `background` | Arquivo de background personalizado. |
| `background-gold-arcs`, `background-blue-glow`, `background-edge-specks` | Overlays PNG incluídos, enviados quando ao menos um slide os seleciona. |

## Modelos de exemplo

Os JSONs prontos em [`../modelo-impacto/`](../modelo-impacto/) demonstram como estruturar carrosséis para importar no editor:

- [`content.json`](../modelo-impacto/content.json)
- [`content_futuro_trabalho.json`](../modelo-impacto/content_futuro_trabalho.json)
- [`content_user_paradigm.json`](../modelo-impacto/content_user_paradigm.json)
