# 🚀 Documentação: Skill Geradora de PDF (LinkedIn)

Este guia documenta a infraestrutura automatizada para geração de carrosséis de alto impacto para o LinkedIn. O objetivo desta ferramenta é minimizar o atrito operacional e traduzir sua visão estratégica em um formato editorial elegante e escalável, focado 100% na mensagem, na conexão com pessoas e no resultado final.

---

## 📂 1. Estrutura de Arquivos Necessária

Para que a inteligência de renderização funcione perfeitamente, a sua pasta de trabalho deve conter exatamente os seguintes arquivos:

*   **`generate_pdf.js`**: O motor principal em Node.js que orquestra a montagem dinâmica e injeção de imagens.
*   **`template.html`**: O coração visual, contendo as regras de CSS, máscaras de degradê e tipografia.
*   **`content.json`**: Onde você estrutura o texto e as diretrizes de layout de cada slide.
*   **`logo-light.png`**: Sua logo com texto branco/creme (usada automaticamente em fundos escuros).
*   **`logo-dark.png`**: Sua logo com texto original escuro (usada automaticamente em fundos claros).
*   **`minha-foto.png`** *(Opcional)*: Sua foto pessoal com fundo transparente para gerar conexão.

---

## 🛠️ 2. Instalação e Configuração (Setup Inicial)

Como a ferramenta utiliza o Puppeteer para garantir uma renderização de nível estúdio, você precisa preparar o ambiente uma única vez:

1.  Certifique-se de ter o **Node.js** instalado na sua máquina.
2.  Abra o terminal dentro da pasta do projeto e execute a instalação da dependência:
    ```bash
    npm install puppeteer
    ```

---

## 📝 3. Como Construir sua Narrativa (O `content.json`)

Você não precisa editar código para criar novos posts. Toda a atualização acontece no `content.json`. Cada bloco dentro do array `"slides"` representa uma página do seu carrossel.

### Exemplo de Estrutura de um Slide Completo:
```json
{
  "theme": "dark",
  "photo_position": "bottom-right",
  "flip": true,
  "scale": 1.15,
  "tag": "CUSTOMER SUCCESS",
  "title": "A excelência técnica não basta.",
  "content": "Se o cliente não percebe o valor na ponta, a arquitetura perde o propósito."
}

```

### Dicionário de Propriedades:

* **`theme`** *(Obrigatório)*: Define a paleta de cores e o gradiente do fundo.
* `"dark"`: Fundo Midnight Slate. Aplica a logo clara.
* `"light"`: Fundo Gelo/Branco. Aplica a logo escura.
* `"gold"`: Fundo Golden Harvest. Aplica a logo escura.


* **`tag`** *(Opcional)*: Uma etiqueta de contexto superior (ex: "VISÃO SÊNIOR", "IMPACTO").
* **`title`** *(Obrigatório)*: O gancho principal da tela (Montserrat 88px).
* **`content`** *(Opcional)*: O texto descritivo de apoio da mensagem.
* **`photo_position`** *(Opcional)*: Ativa a injeção da sua foto `minha-foto.png` com o efeito de fusão (fade-out) na base.
* `"bottom-right"`: Imagem ancorada à direita. O texto recua para a esquerda.
* `"bottom-left"`: Imagem ancorada à esquerda. O texto avança para a direita.


* **`flip`** *(Opcional)*: Aceita `true` ou `false`. Espelha sua imagem horizontalmente. Ideal para garantir que o seu olhar na fotografia esteja sempre direcionado para o texto da página, aumentando a retenção.
* **`scale`** *(Opcional)*: Redimensiona a foto. Aceita números decimais (ex: `1.2` representa 120%, `0.9` representa 90%). Perfeito para ajustar o enquadramento de fotos mais distantes diretamente via código.

---

## ▶️ 4. Gerando o Carrossel Final

Com a sua narrativa definida no JSON, abra o terminal na pasta do projeto e dispare o motor:

```bash
node generate_pdf.js

```

O sistema irá ler o conteúdo, calcular os redimensionamentos, embutir todas as imagens em Base64 e gerar o arquivo de saída **`Carrossel_Linkedin_Final.pdf`**.

```