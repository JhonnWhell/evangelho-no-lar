# Evangelho no Lar — Roteiro

App de apoio à condução do Evangelho no Lar semanal da família: roteiro em
etapas, Prece de Cáritas legível, mensagem do WhatsApp, memória das leituras e
registro dos encontros. A especificação vive no projeto do Claude
(`ESPECIFICACAO.md`), não aqui.

**Este repositório é público e tem só código, fonte e ícones.**
Nenhum texto dos livros, nenhum dado de encontro, nenhum link de sala.
Textos e dados ficam no Google Drive privado (D-03, D-05, D-14).

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | estrutura das telas |
| `app.js` | lógica do app (telas da v1) |
| `dados-exemplo.js` | valores iniciais da primeira abertura: roteiro, Prece de Cáritas, modelo da mensagem, onde a leitura parou. Sem link da sala, sem nomes, sem texto dos livros. |
| `parser.js` | leitor do formato de texto 1. **Cópia exata** do repositório `jhonnwhell/fitilho` (parser 1.0.1). Não editar aqui: atualizar copiando de lá. |
| `style.css` | aparência |
| `manifest.webmanifest` | instalação como app |
| `sw.js` | funcionamento sem internet |
| `fonts/` | Atkinson Hyperlegible (SIL OFL 1.1, ver `fonts/OFL.txt`) |
| `icons/` | ícones (provisórios até a escolha do nome curto, P-14) |

## Onde ficam os dados (por enquanto)

Até o passo 4 (Apps Script + Drive), tudo fica só no aparelho, no
armazenamento do navegador, com prefixo `enl.`: roteiro, leituras,
encontro em andamento, registros, anotações e textos dos livros.
Cada aparelho tem os seus. O link da sala é cadastrado em
**Modo edição › Sala e mensagem**.

## Registro de eventos e relatório de teste (D-15)

Cada aparelho guarda os últimos 500 eventos em `enl.log`: telas abertas,
ações (nome do botão), capítulos analisados e gravados (só contagens),
encontros iniciados e registrados (só contagens), erros de código e falhas de
armazenamento.

**Nunca entra no log (D-05):** texto de anotação, nomes de presentes, texto dos
livros, link da sala, conteúdo do registro de encontro.

Botão **Relatar** no topo (desligável em Modo edição › Testes): a pessoa
descreve o problema e o app gera `relato-<aparelho>-<data>-<hora>.txt` com
versão, aparelho, navegador, tela de origem, descrição e todos os eventos.
Compartilhar (Android: menu de compartilhar → WhatsApp), Baixar ou Copiar.

Cada evento é um objeto autossuficiente
(`{"t","ap","v","n","c","tela","m","d"}`), pronto para virar uma linha de
`logs/<aparelho>.jsonl` no Drive quando o envio automático entrar (backlog
da v2).

## Convivência com o Fitilho

Os dois apps ficam em `jhonnwhell.github.io` e dividem o armazenamento do
aparelho. Regras deste app:

- tudo que guarda no aparelho começa com `enl` (localStorage `enl.`,
  IndexedDB `enl`, caches `enl-`);
- o service worker só apaga caches `enl-`;
- "Limpar dados do site" no Chrome apaga os dados dos **dois** apps.

## Fluxo de trabalho (PC com Windows)

O Claude grava os arquivos em `Documentos\evangelho-no-lar`. Você confere e
sobe:

```powershell
cd $HOME\Documents\evangelho-no-lar
git status
git add -A
git commit -m "mensagem que o Claude passar"
git push
```

`git status` antes do commit: conferir que nenhum `.txt` de capítulo aparece.
O `.gitignore` bloqueia `*.txt`, mas o upload pelo site do GitHub ignora o
`.gitignore`. Não usar upload pelo site neste repositório.

## Publicar no GitHub Pages (uma vez)

```powershell
gh api -X POST repos/JhonnWhell/evangelho-no-lar/pages -f "source[branch]=main" -f "source[path]=/"
```

Endereço, em 1 a 2 minutos: `https://jhonnwhell.github.io/evangelho-no-lar/`

## Atualizar depois

Ao trocar qualquer arquivo, aumentar `VERSAO` no topo do `sw.js` e
`VERSAO_APP` no `app.js`. Sem isso o aparelho continua usando a versão
guardada.
