/* =====================================================================
   app.js — Evangelho no Lar (app de condução)
   Entrega 1: fundação. Confere fonte, parser, service worker e
   armazenamento com prefixo próprio. As telas da v1 substituem isto.

   Convivência com o Fitilho (ESPECIFICACAO 3.5): tudo que este app
   guarda no aparelho usa o prefixo "enl" (localStorage "enl.",
   IndexedDB "enl", caches "enl-"). Nunca ler nem gravar "fitilho".
   ===================================================================== */
(function () {
  'use strict';

  var VERSAO_APP = '0.1.0';
  var PREFIXO_LS = 'enl.';

  var lista = document.getElementById('verificacoes');
  document.getElementById('versao').textContent = VERSAO_APP;

  function marcar(ok, texto) {
    var li = document.createElement('li');
    li.className = ok ? 'ok' : 'falha';
    li.textContent = texto;
    lista.appendChild(li);
  }

  // 1. Parser copiado do Fitilho
  var P = window.FormatoTexto1;
  if (P && P.VERSAO) {
    var exemplo = [
      '@formato: 1', '@livro: ESE', '@edicao: EXEMPLO', '@capitulo: 99',
      '@titulo: Exemplo', '', '### 1', '@pagina: 10', '',
      'Texto inventado, sem relação com livro algum,', 'que vira de página [[11]] aqui.'
    ].join('\n');
    var r = P.analisar(exemplo, { nomeArquivo: 'ese-cap-99.txt' });
    var bom = r.chave === 'ESE:99' && r.estatisticas.paginaFinal === 11;
    marcar(bom, 'Leitor do formato de texto 1: versão ' + P.VERSAO + (bom ? '' : ' (resultado inesperado)'));
  } else {
    marcar(false, 'Leitor do formato de texto 1 não carregou');
  }

  // 2. Fonte Atkinson Hyperlegible
  if (document.fonts && document.fonts.load) {
    document.fonts.load('22px "Atkinson Hyperlegible"').then(function (f) {
      marcar(f.length > 0, f.length > 0 ? 'Fonte Atkinson Hyperlegible carregada' : 'Fonte Atkinson Hyperlegible não carregou');
    });
  }

  // 3. Armazenamento com prefixo próprio
  try {
    localStorage.setItem(PREFIXO_LS + 'teste', '1');
    var lido = localStorage.getItem(PREFIXO_LS + 'teste') === '1';
    localStorage.removeItem(PREFIXO_LS + 'teste');
    marcar(lido, 'Armazenamento no aparelho com prefixo "enl."');
  } catch (e) {
    marcar(false, 'Armazenamento no aparelho indisponível');
  }

  // 4. Service worker (funcionar sem internet)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      marcar(true, 'Funcionamento sem internet ativado (escopo ' + new URL(reg.scope).pathname + ')');
    }).catch(function () {
      marcar(false, 'Funcionamento sem internet não ativou');
    });
  } else {
    marcar(false, 'Este navegador não permite funcionar sem internet');
  }
})();
