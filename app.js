/* =====================================================================
   app.js — Evangelho no Lar (app de condução) · v1, passo 3
   Telas da v1 com dados de exemplo, guardados só no aparelho.
   O Drive (Apps Script) entra no passo 4 e substitui o módulo Local
   como fonte; a interface das telas não muda.

   Convivência com o Fitilho (ESPECIFICACAO 3.5): tudo que este app
   guarda no aparelho começa com "enl." (localStorage). Nunca ler nem
   gravar chaves "fitilho." nem o banco "fitilho".
   ===================================================================== */
(function () {
  'use strict';

  var VERSAO_APP = '0.2.0';
  var FT = window.FormatoTexto1;
  var SEMENTE = window.ENL_SEMENTE;
  var $app = document.getElementById('app');
  var $sobre = document.getElementById('sobre');

  /* =================================================================
     Utilidades
     ================================================================= */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function pad2(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
  function hojeISO(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function horaHM(d) { d = d || new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function instante(d) {
    d = d || new Date();
    var off = -d.getTimezoneOffset(), s = off >= 0 ? '+' : '-';
    off = Math.abs(off);
    return hojeISO(d) + 'T' + horaHM(d) + ':' + pad2(d.getSeconds()) + s + pad2(Math.floor(off / 60)) + ':' + pad2(off % 60);
  }
  function dataBR(iso) { var p = String(iso).split('-'); return p[2] + '/' + p[1]; }
  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function diaSemana(iso) { var p = iso.split('-').map(Number); return DIAS[new Date(p[0], p[1] - 1, p[2]).getDay()]; }
  function inteiro(v) { var s = String(v == null ? '' : v).trim(); return /^\d+$/.test(s) ? parseInt(s, 10) : null; }
  function romano(n) {
    n = inteiro(n); if (!n) return '';
    var t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    var r = '';
    t.forEach(function (p) { while (n >= p[0]) { r += p[1]; n -= p[0]; } });
    return r;
  }
  function primeirasPalavras(s, n) {
    var p = String(s || '').split(/\s+/).filter(Boolean);
    return p.slice(0, n).join(' ').replace(/[,;:.!?…—–-]+$/, '');
  }

  var ICONE = {
    camera: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"></rect><path d="M16 10l6-3v10l-6-3z"></path></svg>',
    enviar: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>',
    link: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1"></path><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1"></path></svg>',
    anterior: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>',
    proxima: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>',
    cima: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"></path></svg>',
    baixo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>',
    x: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>',
    check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>',
    lapis: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>'
  };

  /* =================================================================
     Armazenamento no aparelho (prefixo "enl.")
     ================================================================= */
  var Local = {
    ler: function (k, padrao) {
      try { var v = localStorage.getItem('enl.' + k); return v === null ? padrao : JSON.parse(v); }
      catch (e) { return padrao; }
    },
    gravar: function (k, v) {
      try { localStorage.setItem('enl.' + k, JSON.stringify(v)); return true; }
      catch (e) { avisar('Não deu para guardar no aparelho (' + (e && e.name) + '). Nada foi perdido do que já estava guardado.'); return false; }
    },
    apagar: function (k) { try { localStorage.removeItem('enl.' + k); } catch (e) { /* nada */ } }
  };

  /* =================================================================
     Dados do app: conteúdo (roteiro, prece, mensagem) e estado (leituras)
     ================================================================= */
  var Dados = {
    conteudo: null,
    estado: null,
    carregar: function () {
      this.conteudo = Local.ler('conteudo', null) || copia(SEMENTE.conteudo);
      this.estado = Local.ler('estado', null) || copia(SEMENTE.estado);
      // completa campos que versões novas acrescentarem
      var sc = SEMENTE.conteudo, se = SEMENTE.estado;
      Object.keys(sc).forEach(function (k) { if (Dados.conteudo[k] === undefined) Dados.conteudo[k] = copia(sc[k]); });
      Object.keys(se.ese).forEach(function (k) { if (Dados.estado.ese[k] === undefined) Dados.estado.ese[k] = se.ese[k]; });
      if (!Local.ler('conteudo', null)) this.gravarConteudo(true);
      if (!Local.ler('estado', null)) this.gravarEstado();
    },
    gravarConteudo: function (semVersao) {
      if (!semVersao) {
        var ant = Local.ler('conteudo', null);
        if (ant) Local.gravar('versoes.conteudo', { em: instante(), conteudo: ant });
      }
      return Local.gravar('conteudo', this.conteudo);
    },
    gravarEstado: function () { return Local.gravar('estado', this.estado); },
    encontro: function () { return this.estado.encontroEmAndamento; }
  };

  function quem() { return Local.ler('quem', ''); }

  /* =================================================================
     Textos dos livros (D-12): .txt no formato de texto 1, um por capítulo.
     Guardado só no aparelho até o passo 4; nunca no repositório.
     ================================================================= */
  var Textos = {
    _cache: {},
    indice: function () { return Local.ler('textos.indice', []); },
    bruto: function (chave) { return Local.ler('texto.' + chave, null); },
    analisado: function (chave) {
      var b = this.bruto(chave);
      if (!b) return null;
      var c = this._cache[chave];
      if (c && c.em === b.importadoEm) return c.cap;
      var cap = FT.analisar(b.txt, { nomeArquivo: b.nomeArquivo });
      this._cache[chave] = { em: b.importadoEm, cap: cap };
      return cap;
    },
    gravar: function (txt, nomeArquivo, origem) {
      var cap = FT.analisar(txt, { nomeArquivo: nomeArquivo });
      var chave = cap.chave;
      if (!chave) return false;
      var ant = this.bruto(chave);
      if (ant) Local.gravar('texto.' + chave + '.anterior', ant);
      var reg = { txt: txt, nomeArquivo: nomeArquivo, origem: origem, importadoEm: instante() };
      if (!Local.gravar('texto.' + chave, reg)) return false;
      var idx = this.indice().filter(function (x) { return x.chave !== chave; });
      idx.push({
        chave: chave, livro: cap.cabecalho.livro, parte: inteiro(cap.cabecalho.parte), capitulo: inteiro(cap.cabecalho.capitulo),
        titulo: cap.cabecalho.titulo || '', nomeArquivo: nomeArquivo, origem: origem, importadoEm: reg.importadoEm,
        itens: cap.itens.length,
        primeiro: cap.itens.length ? cap.itens[0].num : null,
        ultimo: cap.itens.length ? cap.itens[cap.itens.length - 1].num : null,
        paginaInicial: cap.estatisticas.paginaInicial, paginaFinal: cap.estatisticas.paginaFinal
      });
      idx.sort(function (a, b) { return a.chave < b.chave ? -1 : 1; });
      Local.gravar('textos.indice', idx);
      delete this._cache[chave];
      return true;
    },
    itemESE: function (capNum, itemNum) {
      var cap = this.analisado('ESE:' + capNum);
      if (!cap) return null;
      for (var i = 0; i < cap.itens.length; i++) if (cap.itens[i].num === itemNum) return { cap: cap, item: cap.itens[i], idx: i };
      return null;
    },
    perguntaLE: function (num) {
      var lista = this.indice().filter(function (x) { return x.livro === 'LE'; });
      for (var j = 0; j < lista.length; j++) {
        var cap = this.analisado(lista[j].chave);
        if (!cap) continue;
        for (var i = 0; i < cap.itens.length; i++) if (cap.itens[i].num === num) return { cap: cap, item: cap.itens[i], idx: i };
      }
      return null;
    },
    existeESE: function (capNum) { return !!this.bruto('ESE:' + capNum); }
  };

  // Título que vale para o item: o @titulo dele ou o do item anterior na mesma seção
  // (no Evangelho um título costuma cobrir vários itens).
  function tituloEfetivo(achado) {
    var cap = achado.cap, i = achado.idx, sec = cap.itens[i].secao;
    for (; i >= 0 && cap.itens[i].secao === sec; i--) if (cap.itens[i].titulo) return cap.itens[i].titulo;
    return '';
  }
  function secaoDe(achado) {
    var s = achado.cap.secoes[achado.item.secao];
    return s ? s.titulo : '';
  }

  // Classificação da ESPECIFICACAO 5.10: erros impedem gravar; o resto é aviso.
  function classificar(cap) {
    var erros = [], avisos = [];
    cap.avisos.forEach(function (a) {
      var ehErro =
        (a.tipo === 'cabecalho' && /Falta @livro|Livro desconhecido|Falta @capitulo|precisa de @parte/.test(a.mensagem)) ||
        a.tipo === 'arquivo' || a.tipo === 'repetido' || a.tipo === 'formato' || a.tipo === 'codificacao' ||
        (a.tipo === 'campo' && /desconhecido/.test(a.mensagem));
      (ehErro ? erros : avisos).push(a);
    });
    if (!cap.chave && !erros.length) erros.push({ linha: 1, mensagem: 'Cabeçalho incompleto: não dá para saber qual capítulo é.' });
    return { erros: erros, avisos: avisos, conferir: cap.conferir };
  }

  /* =================================================================
     Texto de um parágrafo com itálico e marcas de página
     ================================================================= */
  function htmlParagrafo(p) {
    var t = p.texto, cortes = {}, k;
    cortes[0] = 1; cortes[t.length] = 1;
    (p.italicos || []).forEach(function (r) { cortes[r[0]] = 1; cortes[r[1]] = 1; });
    var marcas = {}, antes = '';
    (p.paginas || []).forEach(function (m) {
      if (m.entre) { antes += '<span class="marca-pagina marca-entre">pág. ' + m.n + '</span>'; return; }
      cortes[m.pos] = 1;
      marcas[m.pos] = (marcas[m.pos] || '') + '<span class="marca-pagina" title="Página ' + m.n + ' começa aqui">' + m.n + '</span>';
    });
    var pos = Object.keys(cortes).map(Number).sort(function (a, b) { return a - b; });
    var out = '';
    for (k = 0; k < pos.length; k++) {
      var a = pos[k];
      if (marcas[a]) out += marcas[a];
      if (k === pos.length - 1) break;
      var b = pos[k + 1], seg = esc(t.slice(a, b));
      var it = (p.italicos || []).some(function (r) { return a >= r[0] && b <= r[1]; });
      out += it ? '<em>' + seg + '</em>' : seg;
    }
    return { antes: antes, html: out };
  }

  var ROTULO_BLOCO = { P: 'Pergunta', R: 'Resposta', C: 'Comentário de Kardec', N: 'Nota' };

  function htmlItemTexto(item, livro, comRegua) {
    var h = '';
    if (livro === 'ESE' && item.titulo) h += '<div class="titulo-item">' + esc(item.titulo) + '</div>';
    var tipoAnt = null;
    item.paragrafos.forEach(function (p, i) {
      var r = htmlParagrafo(p);
      var rot = '';
      if (livro === 'LE' && p.tipo !== tipoAnt && ROTULO_BLOCO[p.tipo]) rot = '<span class="bloco-rotulo">' + ROTULO_BLOCO[p.tipo] + '</span>';
      if (livro === 'ESE' && p.tipo === 'N' && tipoAnt !== 'N') rot = '<span class="bloco-rotulo">Nota</span>';
      tipoAnt = p.tipo;
      h += r.antes;
      h += '<p class="bloco bloco-' + p.tipo + (comRegua && i === ui.regua ? ' atual' : '') + '"' +
        (comRegua ? ' data-bloco="' + i + '"' : '') + '>' + rot + r.html + '</p>';
    });
    if (item.assinatura) h += '<div class="assinatura">' + esc(item.assinatura) + '</div>';
    return h;
  }

  function htmlApoio(item) {
    var a = item.apoio || {}, h = '';
    if (a.recap) h += '<dt>Recapitulando</dt><dd>' + esc(a.recap) + '</dd>';
    if (a.palavrasChave) h += '<dt>Palavras-chave</dt><dd>' + esc(a.palavrasChave.split(';').map(function (s) { return s.trim(); }).filter(Boolean).join(' · ')) + '</dd>';
    if (a.entendimento) h += '<dt>Entendimento</dt><dd>' + esc(a.entendimento) + '</dd>';
    return h ? '<dl class="cartao apoio">' + h + '</dl>' : '';
  }

  /* =================================================================
     Estado da interface (local de cada aparelho; não vai ao Drive)
     ================================================================= */
  var ui = {
    tela: 'inicio', idx: 0, topico: 0, nome: 0, bloco: 0, regua: 0,
    dialogo: null, rascunho: null, analise: null, manual: null,
    notaAberta: {}, mostrarPresentes: false, fim: null, rolarTopo: false, focar: null
  };
  var janelaCaritas = location.hash === '#caritas';

  function etapas() { return Dados.conteudo.etapas; }
  function etapaAtual() { var e = etapas(); return e[Math.max(0, Math.min(ui.idx, e.length - 1))]; }
  function tipoEtapa(e) {
    if (!e) return 'generico';
    if (e.id === 'le' || e.id === 'ese' || e.id === 'caritas' || e.id === 'finalizar' || e.id === 'antes') return e.id;
    if ((e.topicos || []).filter(Boolean).length) return 'prece';
    return 'generico';
  }
  function ehCasa(t) { return /casa/i.test(t || ''); }
  function telaPrece() { return !janelaCaritas && ui.tela === 'etapa' && tipoEtapa(etapaAtual()) === 'prece' && !ui.dialogo; }
  function telaCaritas() { return janelaCaritas || (ui.tela === 'etapa' && tipoEtapa(etapaAtual()) === 'caritas'); }
  function telaLeitura() { var t = tipoEtapa(etapaAtual()); return ui.tela === 'etapa' && (t === 'le' || t === 'ese'); }
  function tamanho() { return Local.ler('tamanho', Dados.conteudo.preferencias.tamanho || 28); }

  /* =================================================================
     Encontro em andamento (rascunho local; recuperação na abertura)
     ================================================================= */
  function garantirEncontro() {
    var est = Dados.estado;
    if (est.encontroEmAndamento) return est.encontroEmAndamento;
    est.encontroEmAndamento = {
      data: hojeISO(), inicio: horaHM(), conduziu: quem(),
      presentes: [], notas: [], etapas: [],
      le: { pergunta: est.le.proxima, lida: false, visto: false },
      ese: { visto: false, lidos: [] }
    };
    Dados.gravarEstado();
    return est.encontroEmAndamento;
  }
  function marcarEtapaVista(e) {
    var enc = garantirEncontro();
    if (enc.etapas.indexOf(e.id) < 0) { enc.etapas.push(e.id); Dados.gravarEstado(); }
  }
  function presentesMarcados() { var enc = Dados.encontro(); return enc ? enc.presentes.slice() : []; }

  function resumoESE(enc) {
    if (!enc.ese.visto || !enc.ese.lidos.length) return 'não lido';
    var grupos = [];
    enc.ese.lidos.forEach(function (x) {
      var g = grupos[grupos.length - 1];
      if (g && g.cap === x.cap) g.itens.push(x.item); else grupos.push({ cap: x.cap, itens: [x.item] });
    });
    return grupos.map(function (g) {
      return 'Cap. ' + romano(g.cap) + ', ' + (g.itens.length > 1 ? 'itens ' + g.itens[0] + ' → ' + g.itens[g.itens.length - 1] : 'item ' + g.itens[0]);
    }).join('; ');
  }
  function resumoLE(enc) {
    if (enc.le.lida) return 'pergunta ' + enc.le.pergunta;
    return 'pergunta ' + enc.le.pergunta + ' (não marcada como lida)';
  }
  function resumoEtapas(enc) {
    var todas = etapas().filter(function (e) { return e.id !== 'finalizar'; });
    var faltam = todas.filter(function (e) { return enc.etapas.indexOf(e.id) < 0; });
    if (!faltam.length) return 'todas';
    if (faltam.length === todas.length) return 'nenhuma aberta no app';
    return 'todas menos ' + faltam.map(function (e) { return e.titulo; }).join(', ');
  }
  function notasValidas(enc) {
    return enc.notas.filter(function (n) { return n.texto && n.texto.trim(); })
      .sort(function (a, b) { return a.t < b.t ? -1 : 1; });
  }

  // Bloco do registro.md (ESPECIFICACAO 5.3)
  function blocoRegistro(enc, fim) {
    var l = [];
    l.push('## ' + enc.data + ' (' + diaSemana(enc.data) + '), ' + enc.inicio + '–' + fim + ' · conduziu: ' + (enc.conduziu || '—'));
    l.push('- O Livro dos Espíritos: ' + resumoLE(enc));
    l.push('- O Evangelho: ' + resumoESE(enc));
    l.push('- Presentes: ' + (enc.presentes.length ? enc.presentes.join(', ') : '—'));
    l.push('- Etapas: ' + resumoEtapas(enc));
    var notas = notasValidas(enc);
    l.push('- Anotações:' + (notas.length ? '' : ' —'));
    notas.forEach(function (n) {
      l.push('  - [' + n.t.slice(11, 16) + ' ' + n.autor + '] ' + n.texto.replace(/\s*\n\s*/g, ' / '));
    });
    return l.join('\n') + '\n';
  }

  function aplicarAoEstado(enc) {
    var est = Dados.estado;
    if (enc.le.lida) { est.le.ultimaPergunta = enc.le.pergunta; est.le.proxima = enc.le.pergunta + 1; }
    if (enc.ese.visto && enc.ese.lidos.length) {
      var ult = enc.ese.lidos[enc.ese.lidos.length - 1];
      if (ult.cap !== est.ese.capitulo) { est.ese.capitulo = ult.cap; est.ese.nomeCapitulo = ''; est.ese.secao = ''; est.ese.titulo = ''; }
      est.ese.ultimoItem = ult.item;
      est.ese.proximoItem = ult.item + 1;
      var lido = Textos.itemESE(ult.cap, ult.item);
      if (lido) {
        est.ese.nomeCapitulo = lido.cap.cabecalho.titulo || est.ese.nomeCapitulo;
        est.ese.secao = secaoDe(lido) || est.ese.secao;
        est.ese.titulo = tituloEfetivo(lido) || est.ese.titulo;
      }
    }
  }

  function registrarEncontro(enc, fim) {
    var regs = Local.ler('registros', []);
    regs.push({ data: enc.data, md: blocoRegistro(enc, fim) });
    // anotações também como lista (formato de anotacoes.jsonl, ESPECIFICACAO 5.4)
    var notas = Local.ler('anotacoes', []);
    notasValidas(enc).forEach(function (n) { notas.push({ t: n.t, autor: n.autor, encontro: enc.data, etapa: n.etapa, texto: n.texto }); });
    if (!Local.gravar('registros', regs)) return false;
    Local.gravar('anotacoes', notas);
    aplicarAoEstado(enc);
    Dados.estado.encontroEmAndamento = null;
    Dados.gravarEstado();
    Local.apagar('mensagem');
    return true;
  }

  /* =================================================================
     Mensagem do WhatsApp (ESPECIFICACAO 6)
     ================================================================= */
  function dadosMensagem() {
    var est = Dados.estado.ese;
    var m = Local.ler('mensagem', null);
    if (m && m.cap === est.capitulo && m.itemBase === est.proximoItem) return m;
    var item = est.proximoItem;
    m = { cap: est.capitulo, itemBase: item, item: String(item), nomeCapitulo: est.nomeCapitulo || '', secao: est.secao || '', titulo: est.titulo || '', trecho: '' };
    var achado = Textos.itemESE(est.capitulo, item);
    if (achado) {
      m.nomeCapitulo = achado.cap.cabecalho.titulo || m.nomeCapitulo;
      m.secao = secaoDe(achado) || m.secao;
      m.titulo = tituloEfetivo(achado) || m.titulo;
      var p1 = achado.item.paragrafos.filter(function (p) { return p.tipo !== 'N'; })[0];
      if (p1) m.trecho = primeirasPalavras(p1.texto, 10);
    }
    return m;
  }
  function montarMensagem(m) {
    var modelo = Dados.conteudo.mensagem.modelo || '';
    var v = {
      romano: romano(m.cap), numero: m.cap, nomeCapitulo: m.nomeCapitulo.trim() || '[nome do capítulo]',
      secao: m.secao.trim(), titulo: m.titulo.trim(), item: m.item.trim() || '?', trecho: m.trecho.trim() || '[começo do item]'
    };
    var txt = modelo.replace(/\{(\w+)\}/g, function (_, k) { return v[k] !== undefined ? v[k] : '{' + k + '}'; });
    // campo vazio: some a linha "**" e a linha em branco que sobra
    txt = txt.split('\n').filter(function (l) { return l.trim() !== '**'; }).join('\n').replace(/\n{3,}/g, '\n\n');
    return txt;
  }
  function abrirWhatsApp(texto) {
    var enc = encodeURIComponent(texto);
    // Windows: app de desktop (C-4, a testar no note). Demais: wa.me abre o app no celular/tablet.
    if (/Windows/i.test(navigator.userAgent)) location.href = 'whatsapp://send?text=' + enc;
    else window.open('https://wa.me/?text=' + enc, '_blank', 'noopener');
  }
  function copiar(texto, ok) {
    function fallback() {
      var t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); avisar(ok); } catch (e) { avisar('Não deu para copiar. Selecione o texto e copie à mão.'); }
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { avisar(ok); }, fallback);
    else fallback();
  }

  /* =================================================================
     Avisos curtos (sem redesenhar a tela)
     ================================================================= */
  var tAviso = null;
  function avisar(msg) {
    clearTimeout(tAviso);
    $sobre.innerHTML = '<div class="toast" role="status">' + esc(msg) + '</div>';
    tAviso = setTimeout(function () { $sobre.innerHTML = ''; }, 4000);
  }

  /* =================================================================
     Desenho das telas
     ================================================================= */
  function topo() {
    if (janelaCaritas) return '';
    var q = quem();
    return '<header class="topo">' +
      '<button type="button" class="topo-nome" data-acao="inicio">Evangelho no Lar</button>' +
      '<span class="topo-espaco"></span>' +
      (q ? '<button type="button" class="chip" data-acao="trocarQuem" aria-label="Quem usa este aparelho: ' + esc(q) + '. Trocar">' + esc(q) + '</button>' : '') +
      '</header>';
  }

  function botoesEnvio(destaque) {
    var c = destaque ? ' btn-cheio' : '';
    return '<div class="grade2">' +
      '<button type="button" class="btn btn-verde' + c + '" data-acao="abrirMensagem">' + ICONE.enviar + 'Enviar mensagem</button>' +
      '<button type="button" class="btn btn-verde' + c + '" data-acao="enviarLink">' + ICONE.link + 'Enviar link</button>' +
      '</div>';
  }

  var TELAS = {};

  TELAS.quem = function () {
    return {
      corpo:
        '<h1>Quem usa este aparelho?</h1>' +
        '<p class="suave">Serve para assinar as anotações. Não muda o que cada um pode fazer. Pergunta uma vez só por aparelho.</p>' +
        '<label class="campo">Nome<input class="entrada" id="campo-quem" type="text" autocomplete="off" value="' + esc(quem()) + '"></label>' +
        '<button type="button" class="btn btn-cheio" data-acao="salvarQuem">Continuar</button>'
    };
  };

  TELAS.inicio = function () {
    var est = Dados.estado, enc = est.encontroEmAndamento, h = '';
    if (enc && enc.data !== hojeISO()) {
      h += '<div class="faixa-aviso"><div><b>O encontro de ' + dataBR(enc.data) + ' não foi finalizado. Registrar agora?</b></div>' +
        '<div class="linha"><button type="button" class="btn btn-escuro btn-cheio btn-medio" data-acao="recuperarRegistrar">Registrar</button>' +
        '<button type="button" class="btn btn-escuro btn-medio" data-acao="recuperarDescartar">Descartar</button></div></div>';
    }
    h += '<div class="suave" style="font-size:20px">Domingo · 21h em ponto · entrar às 20h55</div>';
    h += '<button type="button" class="btn btn-cheio btn-grande" data-acao="entrarNaSala">' + ICONE.camera + 'Entrar na sala</button>';
    if (!Dados.conteudo.meet) h += '<p class="suave pequeno">Link da sala ainda não cadastrado: Modo edição › Sala e mensagem.</p>';
    var agora = new Date(), destaque = agora.getHours() * 60 + agora.getMinutes() >= 20 * 60 + 30;
    if (destaque) h += '<div class="destaque-msg">Já passou das 20h30: hora de mandar no grupo.</div>';
    h += botoesEnvio(destaque);

    var eseAch = Textos.itemESE(est.ese.capitulo, est.ese.proximoItem);
    var tit = eseAch ? tituloEfetivo(eseAch) : '';
    h += '<div class="cartao"><div class="rotulo">Hoje</div>' +
      '<div><div class="suave" style="font-size:19px">O Livro dos Espíritos</div><div class="hoje-num">Pergunta ' + est.le.proxima + '</div></div>' +
      '<div class="separador"></div>' +
      '<div><div class="suave" style="font-size:19px">O Evangelho Segundo o Espiritismo</div>' +
      '<div class="hoje-num">Capítulo ' + romano(est.ese.capitulo) + ' · item ' + est.ese.proximoItem + '</div>' +
      (tit ? '<div class="suave">' + esc(tit) + '</div>' : '') + '</div></div>';

    if (enc && enc.data === hojeISO()) h += '<button type="button" class="btn" data-acao="continuarRoteiro">Continuar o roteiro de hoje</button>';
    else h += '<button type="button" class="btn" data-acao="abrirRoteiro">Abrir o roteiro sem entrar na sala</button>';
    h += '<button type="button" class="link" data-acao="abrirEdicao">Modo edição</button>';
    h += '<p class="suave pequeno">Versão ' + VERSAO_APP + ' · por enquanto os dados ficam só neste aparelho (o Drive entra no passo 4).</p>';
    return { corpo: h };
  };

  TELAS.mensagem = function () {
    var m = dadosMensagem();
    var volta = ui.voltarMensagem && ui.voltarMensagem.tela === 'etapa' ? '‹ Voltar ao roteiro' : '‹ Início';
    var h = '<button type="button" class="link link-azul" data-acao="voltarDaMensagem">' + volta + '</button>' +
      '<h1>Mensagem do WhatsApp</h1>' +
      '<p class="suave pequeno">Capítulo ' + romano(m.cap) + ' (' + m.cap + '). Para mudar de capítulo: Modo edição › Leituras.</p>' +
      '<label class="campo">Nome do capítulo<input class="entrada" type="text" data-campo="msg.nomeCapitulo" value="' + esc(m.nomeCapitulo) + '" placeholder="como está no livro"></label>' +
      '<label class="campo">Seção<input class="entrada" type="text" data-campo="msg.secao" value="' + esc(m.secao) + '"></label>' +
      '<div style="display:grid;grid-template-columns:7em minmax(0,1fr);gap:14px">' +
      '<label class="campo">Item<input class="entrada" type="text" inputmode="numeric" data-campo="msg.item" value="' + esc(m.item) + '"></label>' +
      '<label class="campo">Título do item<input class="entrada" type="text" data-campo="msg.titulo" value="' + esc(m.titulo) + '" placeholder="como está no livro"></label></div>' +
      '<label class="campo">Começo do item (digitar ou colar)<textarea class="entrada" rows="2" data-campo="msg.trecho" placeholder="primeiras palavras do item">' + esc(m.trecho) + '</textarea></label>' +
      '<div class="rotulo">Como vai ficar</div>' +
      '<div id="previa-msg" class="cartao ok-box" style="white-space:pre-line;font-size:18px;line-height:1.55">' + esc(montarMensagem(m)) + '</div>' +
      '<div class="grade2"><button type="button" class="btn btn-verde btn-cheio" data-acao="enviarMensagem">Enviar mensagem</button>' +
      '<button type="button" class="btn btn-verde" data-acao="enviarLink">Enviar link</button></div>' +
      '<button type="button" class="btn btn-medio btn-escuro" style="align-self:flex-start" data-acao="copiarMensagem">Copiar mensagem</button>' +
      '<p class="suave pequeno">O WhatsApp abre com o texto pronto. Você escolhe o grupo e aperta enviar. Primeiro a mensagem, depois o link.</p>';
    return { corpo: h };
  };

  /* ---------- etapa ---------- */
  TELAS.etapa = function () {
    var lista = etapas(), e = etapaAtual(), tipo = tipoEtapa(e), idx = lista.indexOf(e);
    marcarEtapaVista(e);
    var h = '<div style="display:flex;flex-direction:column;gap:8px"><div class="suave" style="font-size:18px">Etapa ' + (idx + 1) + ' de ' + lista.length + '</div>' +
      '<div class="progresso"><div style="width:' + Math.round(((idx + 1) / lista.length) * 100) + '%"></div></div></div>' +
      '<h1>' + esc(e.titulo) + '</h1>';
    h += (CORPO_ETAPA[tipo] || CORPO_ETAPA.generico)(e);
    if (tipo !== 'finalizar') h += areaNota(e);
    var prox = lista[idx + 1];
    var rodape = '<footer class="rodape-nav"><div class="depois">' + (prox ? 'Depois: ' + esc(prox.titulo) : 'Última etapa') + '</div>' +
      '<div class="grade2"><button type="button" class="btn" data-acao="etapaAnterior">' + ICONE.anterior + 'Anterior</button>' +
      '<button type="button" class="btn btn-cheio" data-acao="etapaProxima"' + (prox ? '' : ' disabled') + '>Próxima' + ICONE.proxima + '</button></div></footer>';
    return { corpo: h, rodape: rodape };
  };

  function textoEtapa(e) {
    return e.texto ? '<p class="texto-etapa">' + esc(e.texto) + '</p>' : '';
  }

  var CORPO_ETAPA = {};
  CORPO_ETAPA.generico = function (e) {
    return textoEtapa(e) || '<p class="suave">Sem texto nem tópicos nesta etapa. Dá para acrescentar no Modo edição.</p>';
  };
  CORPO_ETAPA.antes = function (e) { return textoEtapa(e) + botoesEnvio(false); };

  CORPO_ETAPA.prece = function (e) {
    var t = (e.topicos || []).filter(Boolean), n = t.length;
    if (ui.topico > n - 1) ui.topico = Math.max(0, n - 1);
    var nomes = presentesMarcados(), casaAtual = ehCasa(t[ui.topico]);
    var h = textoEtapa(e) ? '<p class="suave" style="font-size:22px;line-height:1.7">' + esc(e.texto) + '</p>' : '';
    h += '<ol class="prece-lista">';
    t.forEach(function (tp, i) {
      var c = i < ui.topico ? 'feito' : i === ui.topico ? 'atual' : i === ui.topico + 1 ? 'proximo' : '';
      h += '<li class="' + c + '"' + (i === ui.topico ? ' aria-current="step"' : '') + '>' + (i + 1) + '. ' + esc(tp) +
        (c === 'proximo' ? '<span class="marca-prox">a seguir</span>' : '') + '</li>';
    });
    h += '</ol>';
    if (casaAtual) {
      if (nomes.length) {
        var k = Math.min(ui.nome, nomes.length - 1);
        h += '<div class="cartao" style="align-items:center;gap:4px"><div class="suave" style="font-size:20px">A casa de</div>' +
          '<div class="nome-casa">' + esc(nomes[k]) + '</div><div class="suave" style="font-size:18px">' + (k + 1) + ' de ' + nomes.length + '</div></div>';
        h += '<div class="nomes-casa">' + nomes.map(function (nm, i) {
          return '<span class="' + (i < k ? 'feito' : i === k ? 'atual' : '') + '">' + esc(nm) + '</span>';
        }).join('') + '</div>';
      } else {
        h += '<p class="suave">Nenhum presente marcado. Marque abaixo para os nomes aparecerem um por vez.</p>';
      }
    }
    h += '<p class="prece-dica">' + (ui.topico >= n - 1 && !(casaAtual && nomes.length && ui.nome < nomes.length - 1)
      ? 'Último tópico. Para seguir, use Próxima, embaixo.'
      : 'Clique em qualquer ponto da tela ou aperte espaço para avançar.') + '</p>';
    h += '<div class="linha"><button type="button" class="btn btn-medio" data-acao="preceVoltar"' + (ui.topico === 0 && ui.nome === 0 ? ' disabled' : '') + '>Voltar um passo</button>' +
      '<button type="button" class="btn btn-medio" data-acao="preceRecomecar">Recomeçar</button></div>';
    if (t.some(ehCasa)) h += areaPresentes();
    return h;
  };

  function areaPresentes() {
    var marcados = presentesMarcados(), conhecidos = Dados.conteudo.presentesConhecidos || [];
    var todos = conhecidos.slice();
    marcados.forEach(function (n) { if (todos.indexOf(n) < 0) todos.push(n); });
    var h = '<button type="button" class="link link-azul" data-acao="alternarPresentes">Quem está presente (' + marcados.length + ')</button>';
    if (!ui.mostrarPresentes) return h;
    h += '<div class="cartao" style="gap:4px">';
    if (!todos.length) h += '<p class="suave pequeno">Nenhum nome cadastrado ainda. Acrescente abaixo.</p>';
    todos.forEach(function (n) {
      h += '<label style="min-height:52px;display:flex;align-items:center;gap:14px;font-size:22px;cursor:pointer">' +
        '<input type="checkbox" data-presente="' + esc(n) + '"' + (marcados.indexOf(n) >= 0 ? ' checked' : '') + ' style="width:26px;height:26px;margin:0">' + esc(n) + '</label>';
    });
    h += '<div class="linha" style="flex-wrap:nowrap"><input class="entrada" id="novo-presente" type="text" placeholder="Acrescentar nome" aria-label="Acrescentar nome">' +
      '<button type="button" class="btn btn-medio" data-acao="acrescentarPresente">+</button></div>' +
      '<p class="suave pequeno">Os nomes ficam guardados para os próximos domingos.</p></div>';
    return h;
  }

  CORPO_ETAPA.le = function (e) {
    var enc = garantirEncontro();
    if (!enc.le.visto) { enc.le.visto = true; Dados.gravarEstado(); }
    var n = enc.le.pergunta, ach = Textos.perguntaLE(n);
    var h = e.texto ? '<p class="suave" style="font-size:22px">' + esc(e.texto) + '</p>' : '';
    h += '<div class="cartao" style="align-items:center;gap:4px"><div class="suave">Pergunta</div><div class="numero-gigante">' + n + '</div></div>';
    if (ach) {
      h += controleTamanho() + '<div class="leitura">' + htmlItemTexto(ach.item, 'LE', true) + '</div>' + htmlApoio(ach.item);
    } else {
      h += '<p class="suave pequeno">Texto da pergunta ' + n + ' não cadastrado. Dá para acrescentar em Modo edição › Textos dos livros.</p>';
    }
    if (!enc.le.lida) h += '<button type="button" class="btn btn-cheio" style="min-height:72px;font-size:26px" data-acao="leLida">Lida</button>';
    else h += '<div class="cartao ok-box" style="flex-direction:row;align-items:center;color:var(--verde);font-weight:700">' + ICONE.check +
      '<span style="flex-grow:1">Lida. No próximo domingo: pergunta ' + (n + 1) + '.</span>' +
      '<button type="button" class="link" style="color:var(--verde);align-self:center" data-acao="leDesfazer">Desfazer</button></div>';
    return h;
  };

  CORPO_ETAPA.ese = function (e) {
    var enc = garantirEncontro(), est = Dados.estado.ese;
    if (!enc.ese.visto || !enc.ese.lidos.length) {
      enc.ese.visto = true;
      enc.ese.lidos = [{ cap: est.capitulo, item: est.proximoItem }];
      Dados.gravarEstado();
    }
    var atual = enc.ese.lidos[enc.ese.lidos.length - 1];
    var ach = Textos.itemESE(atual.cap, atual.item);
    var secao = ach ? secaoDe(ach) : (atual.cap === est.capitulo ? est.secao : '');
    var h = e.texto ? '<p class="suave" style="font-size:22px">' + esc(e.texto) + '</p>' : '';
    h += '<div class="cartao" style="gap:6px"><div class="suave">Capítulo ' + romano(atual.cap) + ' (' + atual.cap + ')' + (secao ? ' · ' + esc(secao) : '') + '</div>' +
      '<div style="display:flex;align-items:baseline;gap:16px"><span class="suave" style="font-size:26px">Item</span><span class="numero-gigante">' + atual.item + '</span></div>' +
      (ach && tituloEfetivo(ach) && !ach.item.titulo ? '<div class="suave">' + esc(tituloEfetivo(ach)) + '</div>' : '') +
      '<div class="suave">Último lido antes de hoje: item ' + est.ultimoItem + (atual.cap !== est.capitulo ? ' do capítulo ' + romano(est.capitulo) : '') + '</div></div>';
    if (ach) {
      h += controleTamanho() + '<div class="leitura">' + htmlItemTexto(ach.item, 'ESE', true) + '</div>' + htmlApoio(ach.item);
    } else {
      h += '<p class="suave pequeno">Texto do item ' + atual.item + ' não cadastrado. Dá para acrescentar em Modo edição › Textos dos livros.</p>';
    }
    // próximo item: no mesmo capítulo; se o texto acabou, oferece o capítulo seguinte
    var cap = Textos.analisado('ESE:' + atual.cap);
    var ultimoDoTexto = cap && cap.itens.length ? cap.itens[cap.itens.length - 1].num : null;
    if (ultimoDoTexto !== null && atual.item >= ultimoDoTexto) {
      h += '<p class="suave">Fim do capítulo ' + romano(atual.cap) + ' no texto cadastrado.</p>' +
        '<button type="button" class="btn btn-cheio" style="min-height:72px" data-acao="eseProximoCapitulo">Passar ao capítulo ' + romano(atual.cap + 1) + '</button>';
    } else {
      h += '<button type="button" class="btn btn-cheio" style="min-height:72px;font-size:24px" data-acao="eseContinuar">Continuar lendo: item ' + (atual.item + 1) + '</button>';
    }
    if (enc.ese.lidos.length > 1) {
      var ant = enc.ese.lidos[enc.ese.lidos.length - 2];
      h += '<button type="button" class="link" data-acao="eseVoltar">Voltar para o item ' + ant.item + (ant.cap !== atual.cap ? ' do capítulo ' + romano(ant.cap) : '') + '</button>';
    }
    return h;
  };

  function controleTamanho() {
    return '<div class="linha"><span class="tamanho"><button type="button" data-acao="diminuir" aria-label="Diminuir letra">A−</button>' +
      '<button type="button" data-acao="aumentar" aria-label="Aumentar letra" style="font-size:26px">A+</button></span>' +
      '<span class="suave pequeno">Faixa amarela: clique no parágrafo ou use as setas ↑ ↓.</span></div>';
  }

  CORPO_ETAPA.caritas = function () { return htmlCaritas(false); };

  function htmlCaritas(janela) {
    var blocos = Dados.conteudo.caritas || [];
    if (ui.bloco > blocos.length - 1) ui.bloco = 0;
    var h = '<div class="caritas' + (janela ? ' caritas-tela' : '') + '" style="background:' + esc(Dados.conteudo.preferencias.corFundoPrece || '#2F3D9E') + '">' +
      '<div class="caritas-barra">' +
      '<button type="button" data-acao="diminuir" aria-label="Diminuir letra">A−</button>' +
      '<button type="button" data-acao="aumentar" aria-label="Aumentar letra" style="font-size:26px">A+</button>' +
      '<span class="contagem" id="caritas-contagem">Parte ' + (ui.bloco + 1) + ' de ' + blocos.length + '</span>' +
      '<button type="button" data-acao="caritasAnterior" aria-label="Parte anterior">' + ICONE.cima + '</button>' +
      '<button type="button" data-acao="caritasProximo" aria-label="Próxima parte" style="background:#fff;color:#2F3D9E;border-color:#fff">' + ICONE.baixo + '</button>' +
      '</div><div class="caritas-blocos" id="caritas-blocos">';
    blocos.forEach(function (b, i) {
      h += '<div class="caritas-bloco' + (i === ui.bloco ? ' atual' : '') + '" data-caritas="' + i + '">' + esc(b) + '</div>';
    });
    h += '</div>';
    if (!janela) h += '<button type="button" class="link" style="color:#fff" data-acao="caritasJanela">Abrir numa janela própria (para compartilhar no Meet)</button>';
    return h + '</div>';
  }

  CORPO_ETAPA.finalizar = function () {
    var enc = garantirEncontro();
    var h = '<div class="cartao"><div class="rotulo">Vai ser registrado</div>' +
      '<div>O Livro dos Espíritos: ' + esc(resumoLE(enc)) + '</div>' +
      '<div>O Evangelho: ' + esc(resumoESE(enc)) + '</div>' +
      '<div>Presentes: ' + (enc.presentes.length ? esc(enc.presentes.join(', ')) : '—') + '</div>' +
      '<div>Anotações: ' + notasValidas(enc).length + '</div></div>' +
      '<button type="button" class="btn btn-escuro btn-cheio" style="min-height:76px;font-size:26px" data-acao="pedirFinalizar">Finalizar e fechar o Meet</button>';
    return h;
  };

  function areaNota(e) {
    var enc = Dados.encontro(), autor = quem();
    var nota = enc ? enc.notas.filter(function (n) { return n.etapa === e.id && n.autor === autor; })[0] : null;
    var texto = nota ? nota.texto : '';
    var aberta = ui.notaAberta[e.id] || !!texto;
    if (!aberta) return '<div class="nota-area"><button type="button" class="btn btn-medio btn-escuro" style="align-self:flex-start" data-acao="abrirNota">' + ICONE.lapis + 'Anotar</button></div>';
    return '<div class="nota-area"><label class="campo">Anotação<textarea class="entrada" rows="3" id="nota-' + esc(e.id) + '" data-campo="nota">' + esc(texto) + '</textarea></label>' +
      '<div class="suave pequeno" id="nota-status">' + (nota ? 'Salvo às ' + nota.t.slice(11, 16) + ' · ' + esc(autor) : 'Salva sozinha 2 segundos depois que você para de digitar.') + '</div></div>';
  }

  TELAS.fim = function () {
    var f = ui.fim || {};
    return {
      corpo: '<div style="align-self:center;width:88px;height:88px;border-radius:44px;background:var(--verde-claro);color:var(--verde);display:flex;align-items:center;justify-content:center">' + ICONE.check + '</div>' +
        '<h1 style="text-align:center">Encontro registrado</h1>' +
        '<div class="cartao"><div class="rotulo">No próximo domingo</div>' +
        '<div>O Livro dos Espíritos: pergunta ' + Dados.estado.le.proxima + '</div>' +
        '<div>O Evangelho: Capítulo ' + romano(Dados.estado.ese.capitulo) + ', item ' + Dados.estado.ese.proximoItem + '</div></div>' +
        (f.janela ? '<p class="suave" style="text-align:center">No notebook, a janela do Meet fecha junto com esta.</p>' : '') +
        '<button type="button" class="btn btn-cheio" data-acao="inicio">Voltar ao início</button>'
    };
  };

  /* ---------- modo edição ---------- */
  var ROTULO_ESPECIAL = { antes: 'botões de envio', le: 'tela de leitura do Livro dos Espíritos', ese: 'tela de leitura do Evangelho', caritas: 'Prece de Cáritas', finalizar: 'finalizar o encontro' };

  TELAS.edicao = function () {
    var r = ui.rascunho, c = r.conteudo, h = '';
    h += '<p class="suave pequeno">Muda textos, tópicos e ordem. Não muda o desenho da tela.</p>';
    h += '<div class="linha"><button type="button" class="btn btn-medio" data-acao="abrirTextos">Textos dos livros ›</button></div>';

    h += '<div class="secao-ed"><h2>Roteiro</h2>';
    c.etapas.forEach(function (e, i) {
      h += '<div class="ed-item"><div class="ed-cab"><span class="n">' + (i + 1) + '.</span>' +
        '<input class="entrada" type="text" data-campo="ed.etapa.' + i + '.titulo" value="' + esc(e.titulo) + '" aria-label="Nome da etapa ' + (i + 1) + '">' +
        '<button type="button" class="icone-btn" data-acao="edEtapaSubir" data-i="' + i + '" aria-label="Subir etapa"' + (i === 0 ? ' disabled' : '') + '>' + ICONE.cima + '</button>' +
        '<button type="button" class="icone-btn" data-acao="edEtapaDescer" data-i="' + i + '" aria-label="Descer etapa"' + (i === c.etapas.length - 1 ? ' disabled' : '') + '>' + ICONE.baixo + '</button>' +
        '<button type="button" class="icone-btn perigo" data-acao="edEtapaRemover" data-i="' + i + '" aria-label="Remover etapa">' + ICONE.x + '</button></div>' +
        '<div class="ed-sub">' + (ROTULO_ESPECIAL[e.id] ? '<span class="suave pequeno">Tela própria: ' + ROTULO_ESPECIAL[e.id] + '.</span>' : '') +
        '<textarea class="entrada" rows="2" data-campo="ed.etapa.' + i + '.texto" placeholder="texto da etapa (opcional)" aria-label="Texto da etapa ' + (i + 1) + '" style="font-size:18px">' + esc(e.texto || '') + '</textarea>';
      if (e.id !== 'le' && e.id !== 'ese' && e.id !== 'caritas' && e.id !== 'finalizar') {
        (e.topicos || []).forEach(function (t, j) {
          h += '<div class="ed-topico"><span class="suave pequeno" style="width:1.6em">' + (j + 1) + '.</span>' +
            '<input class="entrada" type="text" data-campo="ed.topico.' + i + '.' + j + '" value="' + esc(t) + '" aria-label="Tópico ' + (j + 1) + '">' +
            '<button type="button" class="icone-btn" data-acao="edTopicoSubir" data-i="' + i + '" data-j="' + j + '" aria-label="Subir tópico"' + (j === 0 ? ' disabled' : '') + '>' + ICONE.cima + '</button>' +
            '<button type="button" class="icone-btn" data-acao="edTopicoDescer" data-i="' + i + '" data-j="' + j + '" aria-label="Descer tópico"' + (j === e.topicos.length - 1 ? ' disabled' : '') + '>' + ICONE.baixo + '</button>' +
            '<button type="button" class="icone-btn perigo" data-acao="edTopicoRemover" data-i="' + i + '" data-j="' + j + '" aria-label="Remover tópico">' + ICONE.x + '</button></div>';
        });
        h += '<button type="button" class="ed-mais" data-acao="edTopicoMais" data-i="' + i + '">+ Tópico</button>';
      }
      h += '</div></div>';
    });
    h += '<button type="button" class="ed-mais" data-acao="edEtapaMais">+ Adicionar etapa</button></div>';

    var le = r.estado.le, ese = r.estado.ese;
    h += '<div class="secao-ed"><h2>Leituras</h2><p class="suave pequeno">Onde a leitura parou. O app atualiza sozinho ao finalizar cada encontro.</p>' +
      '<label class="campo">O Livro dos Espíritos: última pergunta lida<input class="entrada entrada-curta" type="text" inputmode="numeric" data-campo="ed.le.ultimaPergunta" value="' + le.ultimaPergunta + '"></label>' +
      '<label class="campo">O Evangelho: capítulo (número)<input class="entrada entrada-curta" type="text" inputmode="numeric" data-campo="ed.ese.capitulo" value="' + ese.capitulo + '"></label>' +
      '<label class="campo">Nome do capítulo<input class="entrada" type="text" data-campo="ed.ese.nomeCapitulo" value="' + esc(ese.nomeCapitulo) + '"></label>' +
      '<label class="campo">Seção<input class="entrada" type="text" data-campo="ed.ese.secao" value="' + esc(ese.secao) + '"></label>' +
      '<label class="campo">Último item lido<input class="entrada entrada-curta" type="text" inputmode="numeric" data-campo="ed.ese.ultimoItem" value="' + ese.ultimoItem + '"></label>' +
      '<label class="campo">Título do último item lido<input class="entrada" type="text" data-campo="ed.ese.titulo" value="' + esc(ese.titulo) + '"></label></div>';

    h += '<div class="secao-ed"><h2>Sala e mensagem</h2>' +
      '<label class="campo">Link da sala do Meet<input class="entrada" type="url" data-campo="ed.meet" value="' + esc(c.meet) + '" placeholder="https://meet.google.com/..."></label>' +
      '<label class="campo">Modelo da mensagem<textarea class="entrada" rows="12" data-campo="ed.modelo" style="font-size:18px">' + esc(c.mensagem.modelo) + '</textarea></label>' +
      '<p class="suave pequeno">Campos que o app preenche: {romano} {numero} {nomeCapitulo} {secao} {titulo} {item} {trecho}.</p></div>';

    h += '<div class="secao-ed"><h2>Prece de Cáritas</h2>' +
      '<label class="campo">Um bloco por parágrafo; linha em branco separa os blocos<textarea class="entrada" rows="14" data-campo="ed.caritas" style="font-size:18px">' + esc(c.caritas.join('\n\n')) + '</textarea></label></div>';

    h += '<div class="secao-ed"><h2>Presentes</h2>' +
      '<label class="campo">Nomes que aparecem na lista de presentes, um por linha<textarea class="entrada" rows="6" data-campo="ed.presentes">' + esc((c.presentesConhecidos || []).join('\n')) + '</textarea></label></div>';

    h += '<div class="secao-ed"><h2>Este aparelho</h2>' +
      '<label class="campo">Quem usa este aparelho<input class="entrada" type="text" data-campo="ed.quem" value="' + esc(r.quem) + '"></label></div>';

    var rodape = '<footer class="rodape-nav"><div class="grade2">' +
      '<button type="button" class="btn btn-cheio" data-acao="edSalvar">Salvar</button>' +
      '<button type="button" class="btn" data-acao="edCancelar">Cancelar</button></div></footer>';
    return { faixa: '<div class="faixa-edicao">Modo edição — clique em Salvar</div>', corpo: h, rodape: rodape };
  };

  /* ---------- textos dos livros ---------- */
  function nomeLivro(l) { return l === 'LE' ? 'O Livro dos Espíritos' : 'O Evangelho Segundo o Espiritismo'; }
  function nomeCap(x) { return x.livro === 'LE' ? 'Parte ' + x.parte + ', capítulo ' + romano(x.capitulo) : 'Capítulo ' + romano(x.capitulo) + ' (' + x.capitulo + ')'; }
  function dataHora(iso) { return iso ? dataBR(iso.slice(0, 10)) + ' ' + iso.slice(11, 16) : ''; }

  TELAS.textos = function () {
    var h = '<button type="button" class="link link-azul" data-acao="voltarEdicao">‹ Modo edição</button>' +
      '<h1>Textos dos livros</h1>' +
      '<p class="suave pequeno">Por enquanto o texto fica só neste aparelho. Nunca vai para o GitHub.</p>';
    h += '<div class="cartao"><h2>Por arquivo</h2><p class="suave pequeno">Arquivo .txt no formato de texto 1, um por capítulo (ex.: ese-cap-14.txt).</p>' +
      '<label class="btn btn-cheio btn-medio" style="align-self:flex-start;cursor:pointer">Escolher arquivo .txt' +
      '<input type="file" accept=".txt,text/plain" data-campo="arquivo" style="position:absolute;width:1px;height:1px;opacity:0"></label></div>';
    h += '<div class="cartao"><h2>Manual</h2><p class="suave pequeno">Digitar um capítulo campo a campo. O app monta o .txt.</p>' +
      '<div class="linha"><button type="button" class="btn btn-medio" data-acao="manualNovo" data-livro="ESE">Novo capítulo do Evangelho</button>' +
      '<button type="button" class="btn btn-medio" data-acao="manualNovo" data-livro="LE">Novo capítulo do Livro dos Espíritos</button></div></div>';
    var idx = Textos.indice();
    h += '<div class="cartao"><h2>Gravados neste aparelho</h2>';
    if (!idx.length) h += '<p class="suave">Nenhum ainda.</p>';
    idx.forEach(function (x) {
      h += '<div class="cap-linha"><div><b>' + esc(nomeLivro(x.livro)) + '</b> · ' + esc(nomeCap(x)) + (x.titulo ? ' — ' + esc(x.titulo) : '') + '</div>' +
        '<div class="suave pequeno">' + (x.livro === 'LE' ? 'perguntas ' : 'itens ') + x.primeiro + '–' + x.ultimo + ' · págs. ' + x.paginaInicial + '–' + x.paginaFinal +
        ' · ' + (x.origem === 'manual' ? 'digitado aqui' : 'por arquivo') + ' em ' + dataHora(x.importadoEm) + '</div>' +
        '<div class="linha"><button type="button" class="btn btn-medio" data-acao="manualEditar" data-chave="' + esc(x.chave) + '">Editar</button>' +
        '<button type="button" class="btn btn-medio" data-acao="textoConferir" data-chave="' + esc(x.chave) + '">Ver avisos</button>' +
        '<button type="button" class="btn btn-medio" data-acao="textoBaixar" data-chave="' + esc(x.chave) + '">Baixar .txt</button></div></div>';
    });
    h += '</div>';
    return { faixa: '<div class="faixa-edicao">Modo edição — textos</div>', corpo: h };
  };

  function listaMsgs(arr, comLinha) {
    return '<ul class="lista-msgs">' + arr.map(function (a) {
      return '<li>' + (comLinha && a.linha ? '<span class="suave">linha ' + a.linha + ':</span> ' : '') + esc(a.mensagem || a.texto || '') + '</li>';
    }).join('') + '</ul>';
  }

  TELAS.analise = function () {
    var a = ui.analise, cap = a.cap, cl = classificar(cap), cab = cap.cabecalho;
    var existe = cap.chave ? Textos.bruto(cap.chave) : null;
    var h = '<button type="button" class="link link-azul" data-acao="analiseVoltar">‹ Voltar</button>' +
      '<h1>' + (a.soLeitura ? 'Avisos do capítulo' : 'Conferir antes de gravar') + '</h1>' +
      '<div class="cartao"><div><b>' + esc(cab.livro ? nomeLivro(cab.livro) : 'Livro não informado') + '</b></div>' +
      '<div>' + (cab.livro === 'LE' ? 'Parte ' + esc(cab.parte || '?') + ', ' : '') + 'Capítulo ' + esc(cab.capitulo || '?') + (cab.titulo ? ' — ' + esc(cab.titulo) : '') + '</div>' +
      '<div class="suave pequeno">' + esc(a.nomeArquivo) + ' · ' + cap.estatisticas.itens + ' itens · ' + cap.estatisticas.paragrafos + ' parágrafos' +
      (cap.estatisticas.paginaInicial ? ' · págs. ' + cap.estatisticas.paginaInicial + '–' + cap.estatisticas.paginaFinal : '') + '</div></div>';
    if (cl.erros.length) h += '<div class="cartao erro-box"><div class="rotulo">Não dá para gravar (' + cl.erros.length + ')</div>' + listaMsgs(cl.erros, true) + '</div>';
    if (cl.avisos.length) h += '<div class="cartao aviso-box"><div class="rotulo">Avisos (' + cl.avisos.length + ') · não impedem gravar</div>' + listaMsgs(cl.avisos, true) + '</div>';
    if (cl.conferir.length) h += '<div class="cartao aviso-box"><div class="rotulo">Para conferir no livro (' + cl.conferir.length + ')</div>' + listaMsgs(cl.conferir, true) + '</div>';
    if (!cl.erros.length && !cl.avisos.length && !cl.conferir.length) h += '<div class="cartao ok-box"><div>Nenhum problema encontrado.</div></div>';
    if (existe && !a.soLeitura) h += '<div class="faixa-aviso">Este capítulo já está gravado (' + (existe.origem === 'manual' ? 'digitado aqui' : 'por arquivo') + ' em ' + dataHora(existe.importadoEm) + '). Gravar substitui; a versão anterior fica guardada.</div>';
    h += '<div class="rotulo">Prévia</div><div class="previa">';
    cap.itens.forEach(function (it) {
      h += '<h2 style="font-size:20px;margin-top:12px">' + (cab.livro === 'LE' ? 'Pergunta ' : 'Item ') + esc(it.numero) + (it.pagina ? ' <span class="suave pequeno">· pág. ' + it.pagina + '</span>' : '') + '</h2>' +
        '<div class="leitura">' + htmlItemTexto(it, cab.livro, false) + '</div>' + htmlApoio(it);
    });
    h += '</div>';
    var rodape = a.soLeitura ? '' : '<footer class="rodape-nav"><div class="grade2">' +
      '<button type="button" class="btn btn-cheio" data-acao="analiseGravar"' + (cl.erros.length ? ' disabled' : '') + '>' + (existe ? 'Substituir' : 'Gravar') + '</button>' +
      '<button type="button" class="btn" data-acao="analiseVoltar">Voltar</button></div></footer>';
    return { faixa: '<div class="faixa-edicao">Modo edição — textos</div>', corpo: h, rodape: rodape };
  };

  /* ---------- edição manual de capítulo ---------- */
  var TIPOS_PAR = { ESE: [['texto', 'Texto'], ['P', 'Pergunta'], ['N', 'Nota']], LE: [['P', 'Pergunta'], ['R', 'Resposta'], ['C', 'Comentário'], ['N', 'Nota']] };

  function itemVazio(livro) {
    return { secao: '', numero: '', pagina: '', titulo: '', assinatura: '', recap: '', palavrasChave: '', entendimento: '',
      paragrafos: livro === 'LE' ? [{ tipo: 'P', texto: '' }, { tipo: 'R', texto: '' }] : [{ tipo: 'texto', texto: '' }] };
  }

  // parágrafo analisado -> texto no formato (com [[N]] e *itálico*)
  function paragrafoParaFormato(p) {
    var t = p.texto, ev = {};
    function add(pos, ordem, s) { (ev[pos] = ev[pos] || []).push([ordem, s]); }
    (p.italicos || []).forEach(function (r) { add(r[0], 2, '*'); add(r[1], 0, '*'); });
    var antes = '';
    (p.paginas || []).forEach(function (m) { if (m.entre) antes += '[[' + m.n + ']] '; else add(m.pos, 1, '[[' + m.n + ']] '); });
    // na mesma posição: fecha itálico, depois marca de página, depois abre itálico
    var out = '';
    for (var i = 0; i <= t.length; i++) {
      if (ev[i]) ev[i].sort(function (a, b) { return a[0] - b[0]; }).forEach(function (x) { out += x[1]; });
      if (i < t.length) out += t.charAt(i);
    }
    return (antes + out).replace(/\s+$/, '');
  }

  function manualDeAnalise(cap) {
    var cab = cap.cabecalho, livro = cab.livro;
    var m = { livro: livro, parte: cab.parte || '', capitulo: cab.capitulo || '', titulo: cab.titulo || '', edicao: cab.edicao || '', itens: [], tinhaComentarios: false };
    var b = Textos.bruto(cap.chave);
    if (b && /^\s*#(?!#)/m.test(b.txt)) m.tinhaComentarios = true;
    cap.itens.forEach(function (it) {
      var s = cap.secoes[it.secao];
      m.itens.push({
        secao: s ? s.titulo : '', numero: it.numero, pagina: it.pagina != null ? String(it.pagina) : '',
        titulo: it.titulo || '', assinatura: it.assinatura || '',
        recap: it.apoio.recap || '', palavrasChave: it.apoio.palavrasChave || '', entendimento: it.apoio.entendimento || '',
        paragrafos: it.paragrafos.map(function (p) { return { tipo: p.tipo, texto: paragrafoParaFormato(p) }; })
      });
    });
    if (!m.itens.length) m.itens.push(itemVazio(livro));
    return m;
  }

  function umaLinha(s) { return String(s || '').replace(/\s*\n\s*/g, ' ').trim(); }

  function manualParaTxt(m) {
    var l = ['@formato: 1', '@livro: ' + m.livro];
    if (umaLinha(m.edicao)) l.push('@edicao: ' + umaLinha(m.edicao));
    if (m.livro === 'LE') l.push('@parte: ' + umaLinha(m.parte));
    l.push('@capitulo: ' + umaLinha(m.capitulo));
    l.push('@titulo: ' + umaLinha(m.titulo));
    var secAnt = null;
    m.itens.forEach(function (it) {
      var sec = umaLinha(it.secao);
      if (sec && sec !== secAnt) { l.push('', '## ' + sec); secAnt = sec; }
      l.push('', '### ' + umaLinha(it.numero));
      if (umaLinha(it.pagina)) l.push('@pagina: ' + umaLinha(it.pagina));
      if (umaLinha(it.titulo)) l.push('@titulo: ' + umaLinha(it.titulo));
      if (umaLinha(it.assinatura)) l.push('@assinatura: ' + umaLinha(it.assinatura));
      it.paragrafos.forEach(function (p) {
        var t = umaLinha(p.texto);
        if (!t) return;
        // marca de página logo no começo do parágrafo vira linha própria (página virou entre parágrafos)
        var mm = /^((?:\[\[\s*\d+\s*\]\]\s*)+)(.*)$/.exec(t);
        if (mm && mm[2]) { l.push('', mm[1].trim()); t = mm[2]; }
        l.push('', (p.tipo && p.tipo !== 'texto' ? p.tipo + ': ' : '') + t);
      });
      var apoio = [];
      if (umaLinha(it.recap)) apoio.push('@recap: ' + umaLinha(it.recap));
      if (umaLinha(it.palavrasChave)) apoio.push('@palavras-chave: ' + umaLinha(it.palavrasChave));
      if (umaLinha(it.entendimento)) apoio.push('@entendimento: ' + umaLinha(it.entendimento));
      if (apoio.length) l.push.apply(l, [''].concat(apoio));
    });
    return l.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
  }

  TELAS.manual = function () {
    var m = ui.manual, le = m.livro === 'LE';
    var h = '<button type="button" class="link link-azul" data-acao="abrirTextos">‹ Textos dos livros</button>' +
      '<h1>' + (m.editando ? 'Editar' : 'Novo') + ' capítulo · ' + esc(nomeLivro(m.livro)) + '</h1>';
    if (m.tinhaComentarios) h += '<div class="faixa-aviso">O arquivo original tem comentários (linhas com #, inclusive # CONFERIR). Salvar por aqui remove essas linhas. Para mantê-las, corrija o .txt e envie de novo.</div>';
    h += '<p class="suave pequeno">Virada de página no meio do parágrafo: escreva [[número]] onde a página vira. Itálico: *entre asteriscos*.</p>';
    h += '<div class="cartao">' + (le ? '<label class="campo">Parte (número)<input class="entrada entrada-curta" inputmode="numeric" data-campo="man.parte" value="' + esc(m.parte) + '"></label>' : '') +
      '<label class="campo">Capítulo (número)<input class="entrada entrada-curta" inputmode="numeric" data-campo="man.capitulo" value="' + esc(m.capitulo) + '"' + (m.editando ? ' readonly' : '') + '></label>' +
      '<label class="campo">Título do capítulo<input class="entrada" data-campo="man.titulo" value="' + esc(m.titulo) + '"></label>' +
      '<label class="campo">Edição (opcional)<input class="entrada" data-campo="man.edicao" value="' + esc(m.edicao) + '"></label></div>';
    var tipos = TIPOS_PAR[m.livro];
    m.itens.forEach(function (it, i) {
      h += '<div class="cartao"><div class="linha" style="justify-content:space-between"><h2>' + (le ? 'Pergunta' : 'Item') + ' ' + esc(it.numero || '(sem número)') + '</h2>' +
        '<span class="linha"><button type="button" class="icone-btn" data-acao="manItemSubir" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>' + ICONE.cima + '</button>' +
        '<button type="button" class="icone-btn" data-acao="manItemDescer" data-i="' + i + '" aria-label="Descer"' + (i === m.itens.length - 1 ? ' disabled' : '') + '>' + ICONE.baixo + '</button>' +
        '<button type="button" class="icone-btn perigo" data-acao="manItemRemover" data-i="' + i + '" aria-label="Remover">' + ICONE.x + '</button></span></div>' +
        '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">' +
        '<label class="campo">Número<input class="entrada" inputmode="numeric" data-campo="man.item.' + i + '.numero" value="' + esc(it.numero) + '"></label>' +
        '<label class="campo">Página onde começa<input class="entrada" inputmode="numeric" data-campo="man.item.' + i + '.pagina" value="' + esc(it.pagina) + '"></label></div>' +
        '<label class="campo">Subtítulo do livro que agrupa itens (opcional)<input class="entrada" data-campo="man.item.' + i + '.secao" value="' + esc(it.secao) + '"></label>' +
        (le ? '' : '<label class="campo">Título (opcional)<input class="entrada" data-campo="man.item.' + i + '.titulo" value="' + esc(it.titulo) + '"></label>' +
          '<label class="campo">Assinatura (opcional)<input class="entrada" data-campo="man.item.' + i + '.assinatura" value="' + esc(it.assinatura) + '"></label>');
      h += '<div class="rotulo">Parágrafos</div>';
      it.paragrafos.forEach(function (p, j) {
        h += '<div class="par-ed"><select class="entrada" data-campo="man.par.' + i + '.' + j + '.tipo" aria-label="Tipo do parágrafo">' +
          tipos.map(function (t) { return '<option value="' + t[0] + '"' + (p.tipo === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select>' +
          '<textarea class="entrada" rows="3" data-campo="man.par.' + i + '.' + j + '.texto" aria-label="Parágrafo ' + (j + 1) + '">' + esc(p.texto) + '</textarea>' +
          '<button type="button" class="icone-btn perigo" data-acao="manParRemover" data-i="' + i + '" data-j="' + j + '" aria-label="Remover parágrafo">' + ICONE.x + '</button></div>';
      });
      h += '<button type="button" class="ed-mais" data-acao="manParMais" data-i="' + i + '">+ Parágrafo</button>' +
        '<details><summary class="suave" style="cursor:pointer;min-height:44px">Campos de apoio (opcionais)</summary>' +
        '<label class="campo">Recapitulando<textarea class="entrada" rows="2" data-campo="man.item.' + i + '.recap">' + esc(it.recap) + '</textarea></label>' +
        '<label class="campo">Palavras-chave (separadas por ;)<input class="entrada" data-campo="man.item.' + i + '.palavrasChave" value="' + esc(it.palavrasChave) + '"></label>' +
        '<label class="campo">Entendimento<textarea class="entrada" rows="2" data-campo="man.item.' + i + '.entendimento">' + esc(it.entendimento) + '</textarea></label></details></div>';
    });
    h += '<button type="button" class="ed-mais" data-acao="manItemMais">+ ' + (le ? 'Pergunta' : 'Item') + '</button>';
    var rodape = '<footer class="rodape-nav"><div class="grade2"><button type="button" class="btn btn-cheio" data-acao="manConferir">Conferir e gravar</button>' +
      '<button type="button" class="btn" data-acao="abrirTextos">Cancelar</button></div></footer>';
    return { faixa: '<div class="faixa-edicao">Modo edição — textos</div>', corpo: h, rodape: rodape };
  };

  /* ---------- diálogo ---------- */
  function htmlDialogo() {
    var d = ui.dialogo;
    if (!d) return '';
    return '<div class="cortina"><div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="dlg-titulo">' +
      '<h2 id="dlg-titulo" style="font-size:30px">' + esc(d.titulo) + '</h2>' +
      (d.texto ? '<p class="suave">' + esc(d.texto) + '</p>' : '') +
      '<div class="grade2"><button type="button" class="btn btn-escuro btn-cheio" data-acao="' + d.acao + '">' + esc(d.sim) + '</button>' +
      '<button type="button" class="btn btn-escuro" data-acao="fecharDialogo">' + esc(d.nao || 'Voltar') + '</button></div></div></div>';
  }

  /* =================================================================
     Redesenho
     ================================================================= */
  function render() {
    document.documentElement.style.setProperty('--tam', tamanho() + 'px');
    if (janelaCaritas) {
      document.title = 'Prece de Cáritas';
      $app.innerHTML = '<main class="corpo" id="corpo">' + htmlCaritas(true) + '</main>';
      return;
    }
    if (!quem() && ui.tela !== 'quem') ui.tela = 'quem';
    var corpoAnt = document.getElementById('corpo');
    var rolagem = corpoAnt && !ui.rolarTopo ? corpoAnt.scrollTop : 0;
    var p = (TELAS[ui.tela] || TELAS.inicio)();
    $app.innerHTML = topo() + '<main class="corpo" id="corpo">' + (p.faixa || '') + '<div class="folha">' + p.corpo + '</div></main>' + (p.rodape || '') + htmlDialogo();
    document.getElementById('corpo').scrollTop = rolagem;
    ui.rolarTopo = false;
    if (ui.focar) { var f = document.getElementById(ui.focar); if (f) { f.focus(); if (f.setSelectionRange) f.setSelectionRange(f.value.length, f.value.length); } ui.focar = null; }
  }
  function ir(tela, extra) {
    ui.tela = tela; ui.rolarTopo = true; ui.dialogo = null;
    if (extra) Object.keys(extra).forEach(function (k) { ui[k] = extra[k]; });
    render();
  }
  function irEtapa(i) {
    salvarNotaJa();
    ir('etapa', { idx: i, topico: 0, nome: 0, bloco: 0, regua: 0, mostrarPresentes: false });
  }

  /* =================================================================
     Anotações: salvam 2 s depois que a pessoa para de digitar
     ================================================================= */
  var tNota = null, notaPendente = null;
  function agendarNota(etapaId, texto) {
    notaPendente = { etapa: etapaId, texto: texto };
    var st = document.getElementById('nota-status');
    if (st) st.textContent = 'Salvando…';
    clearTimeout(tNota);
    tNota = setTimeout(salvarNotaJa, 2000);
  }
  function salvarNotaJa() {
    clearTimeout(tNota);
    if (!notaPendente) return;
    var enc = garantirEncontro(), autor = quem(), np = notaPendente;
    notaPendente = null;
    var n = enc.notas.filter(function (x) { return x.etapa === np.etapa && x.autor === autor; })[0];
    if (!n) { n = { etapa: np.etapa, autor: autor, t: instante(), texto: '' }; enc.notas.push(n); }
    n.texto = np.texto; n.t = instante();
    Dados.gravarEstado();
    var st = document.getElementById('nota-status');
    if (st) st.textContent = 'Salvo às ' + horaHM() + ' · ' + autor;
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) salvarNotaJa(); });
  window.addEventListener('pagehide', salvarNotaJa);

  /* =================================================================
     Ações (botões com data-acao)
     ================================================================= */
  function idxDe(id) { return etapas().map(function (e) { return e.id; }).indexOf(id); }
  function moverEm(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }

  function avancarPrece(dir) {
    var t = (etapaAtual().topicos || []).filter(Boolean), n = t.length, nomes = presentesMarcados();
    var casa = ehCasa(t[ui.topico]);
    if (dir > 0) {
      if (casa && nomes.length && ui.nome < nomes.length - 1) ui.nome++;
      else if (ui.topico < n - 1) { ui.topico++; ui.nome = 0; }
      else return;
    } else {
      if (casa && nomes.length && ui.nome > 0) ui.nome--;
      else if (ui.topico > 0) { ui.topico--; ui.nome = ehCasa(t[ui.topico]) ? Math.max(0, nomes.length - 1) : 0; }
      else return;
    }
    render();
  }

  function moverRegua(d) {
    var blocos = document.querySelectorAll('[data-bloco]');
    if (!blocos.length) return;
    ui.regua = Math.max(0, Math.min(blocos.length - 1, ui.regua + d));
    marcarRegua(true);
  }
  function marcarRegua(rolar) {
    var blocos = document.querySelectorAll('[data-bloco]');
    blocos.forEach(function (b, i) { b.classList.toggle('atual', i === ui.regua); });
    if (rolar && blocos[ui.regua]) blocos[ui.regua].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function moverCaritas(i, rolar) {
    var n = (Dados.conteudo.caritas || []).length;
    ui.bloco = Math.max(0, Math.min(n - 1, i));
    document.querySelectorAll('[data-caritas]').forEach(function (b, k) { b.classList.toggle('atual', k === ui.bloco); });
    var c = document.getElementById('caritas-contagem');
    if (c) c.textContent = 'Parte ' + (ui.bloco + 1) + ' de ' + n;
    var alvo = document.querySelector('[data-caritas="' + ui.bloco + '"]');
    if (rolar && alvo) alvo.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function lerArquivo(arquivo) {
    if (!arquivo) return;
    if (arquivo.size > 2 * 1024 * 1024) { avisar('Arquivo grande demais para um capítulo (mais de 2 MB).'); return; }
    var leitor = new FileReader();
    leitor.onload = function () {
      var txt = String(leitor.result || '');
      ui.analise = { txt: txt, nomeArquivo: arquivo.name, origem: 'arquivo', cap: FT.analisar(txt, { nomeArquivo: arquivo.name }), voltar: 'textos' };
      ir('analise');
    };
    leitor.onerror = function () { avisar('Não deu para ler o arquivo.'); };
    leitor.readAsText(arquivo, 'utf-8');
  }

  function baixar(nome, texto) {
    var blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  var ACOES = {
    inicio: function () { salvarNotaJa(); ir('inicio'); },
    trocarQuem: function () { ui.focar = 'campo-quem'; ir('quem'); },
    salvarQuem: function () {
      var v = (document.getElementById('campo-quem').value || '').trim();
      if (!v) { avisar('Escreva um nome.'); return; }
      Local.gravar('quem', v); ir('inicio');
    },

    entrarNaSala: function () {
      var meet = Dados.conteudo.meet;
      if (!meet) { avisar('Cadastre o link da sala em Modo edição › Sala e mensagem.'); return; }
      garantirEncontro();
      window.open(meet, '_blank', 'noopener');
      irEtapa(Math.max(0, idxDe('le')));
    },
    abrirRoteiro: function () { garantirEncontro(); irEtapa(0); },
    continuarRoteiro: function () {
      var enc = garantirEncontro(), ult = enc.etapas[enc.etapas.length - 1];
      irEtapa(Math.max(0, idxDe(ult)));
    },
    abrirMensagem: function () { salvarNotaJa(); ui.voltarMensagem = { tela: ui.tela, idx: ui.idx }; ir('mensagem'); },
    voltarDaMensagem: function () {
      var v = ui.voltarMensagem;
      if (v && v.tela === 'etapa') ir('etapa', { idx: v.idx }); else ir('inicio');
    },
    enviarMensagem: function () { abrirWhatsApp(montarMensagem(dadosMensagem())); },
    enviarLink: function () {
      var meet = Dados.conteudo.meet;
      if (!meet) { avisar('Cadastre o link da sala em Modo edição › Sala e mensagem.'); return; }
      abrirWhatsApp(meet);
    },
    copiarMensagem: function () { copiar(montarMensagem(dadosMensagem()), 'Mensagem copiada.'); },

    recuperarRegistrar: function () {
      var enc = Dados.encontro();
      var fim = notasValidas(enc).length ? notasValidas(enc).slice(-1)[0].t.slice(11, 16) : enc.inicio;
      if (registrarEncontro(enc, fim)) avisar('Encontro de ' + dataBR(enc.data) + ' registrado com o que ficou salvo.');
      render();
    },
    recuperarDescartar: function () {
      var enc = Dados.encontro();
      Local.gravar('encontro.descartado', enc);
      Dados.estado.encontroEmAndamento = null; Dados.gravarEstado();
      avisar('Rascunho de ' + dataBR(enc.data) + ' descartado.');
      render();
    },

    etapaAnterior: function () { if (ui.idx > 0) irEtapa(ui.idx - 1); else { salvarNotaJa(); ir('inicio'); } },
    etapaProxima: function () { if (ui.idx < etapas().length - 1) irEtapa(ui.idx + 1); },

    preceVoltar: function () { avancarPrece(-1); },
    preceRecomecar: function () { ui.topico = 0; ui.nome = 0; render(); },
    alternarPresentes: function () { ui.mostrarPresentes = !ui.mostrarPresentes; render(); },
    acrescentarPresente: function () {
      var c = document.getElementById('novo-presente'), v = (c.value || '').trim();
      if (!v) return;
      var lista = Dados.conteudo.presentesConhecidos = Dados.conteudo.presentesConhecidos || [];
      if (lista.indexOf(v) < 0) { lista.push(v); Dados.gravarConteudo(); }
      var enc = garantirEncontro();
      if (enc.presentes.indexOf(v) < 0) { enc.presentes.push(v); Dados.gravarEstado(); }
      ui.focar = 'novo-presente'; render();
    },

    leLida: function () { var enc = garantirEncontro(); enc.le.lida = true; Dados.gravarEstado(); render(); },
    leDesfazer: function () { var enc = garantirEncontro(); enc.le.lida = false; Dados.gravarEstado(); render(); },
    eseContinuar: function () {
      var enc = garantirEncontro(), a = enc.ese.lidos[enc.ese.lidos.length - 1];
      enc.ese.lidos.push({ cap: a.cap, item: a.item + 1 }); Dados.gravarEstado();
      ui.regua = 0; ui.rolarTopo = true; render();
    },
    eseProximoCapitulo: function () {
      var enc = garantirEncontro(), a = enc.ese.lidos[enc.ese.lidos.length - 1];
      var prox = Textos.analisado('ESE:' + (a.cap + 1));
      var primeiro = prox && prox.itens.length ? prox.itens[0].num : 1;
      enc.ese.lidos.push({ cap: a.cap + 1, item: primeiro }); Dados.gravarEstado();
      ui.regua = 0; ui.rolarTopo = true; render();
    },
    eseVoltar: function () {
      var enc = garantirEncontro();
      if (enc.ese.lidos.length > 1) { enc.ese.lidos.pop(); Dados.gravarEstado(); }
      ui.regua = 0; ui.rolarTopo = true; render();
    },

    diminuir: function () { Local.gravar('tamanho', Math.max(20, tamanho() - 2)); render(); },
    aumentar: function () { Local.gravar('tamanho', Math.min(44, tamanho() + 2)); render(); },
    caritasAnterior: function () { moverCaritas(ui.bloco - 1, true); },
    caritasProximo: function () { moverCaritas(ui.bloco + 1, true); },
    caritasJanela: function () { window.open(location.pathname + '#caritas', 'caritas', 'popup,width=760,height=900'); },

    pedirFinalizar: function () {
      salvarNotaJa();
      ui.dialogo = { titulo: 'Finalizar e fechar o Meet?', texto: 'O registro é gravado e a sala fecha só para você. Os outros continuam até sair.', sim: 'Sim, finalizar', acao: 'finalizar' };
      render();
    },
    fecharDialogo: function () { ui.dialogo = null; render(); },
    finalizar: function () {
      var enc = Dados.encontro();
      if (!enc || !registrarEncontro(enc, horaHM())) { ui.dialogo = null; render(); return; }
      var janela = window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: minimal-ui)').matches;
      ir('fim', { fim: { janela: janela } });
      // No notebook o lançador fecha o Meet quando esta janela fecha (C-3, a testar).
      setTimeout(function () { try { window.close(); } catch (e) { /* aba comum: o navegador ignora */ } }, 1500);
    },

    abrirNota: function () { var e = etapaAtual(); ui.notaAberta[e.id] = true; ui.focar = 'nota-' + e.id; render(); },

    /* modo edição */
    abrirEdicao: function () {
      salvarNotaJa();
      ui.rascunho = { conteudo: copia(Dados.conteudo), estado: copia({ le: Dados.estado.le, ese: Dados.estado.ese }), quem: quem() };
      ir('edicao');
    },
    voltarEdicao: function () {
      if (!ui.rascunho) return ACOES.abrirEdicao();
      ir('edicao');
    },
    edCancelar: function () { ui.rascunho = null; ir('inicio'); },
    edSalvar: function () {
      var r = ui.rascunho, le = r.estado.le, ese = r.estado.ese, erros = [];
      var ul = inteiro(le.ultimaPergunta), cp = inteiro(ese.capitulo), ui2 = inteiro(ese.ultimoItem);
      if (ul === null) erros.push('última pergunta lida');
      if (!cp) erros.push('capítulo do Evangelho');
      if (ui2 === null) erros.push('último item lido');
      if (erros.length) { avisar('Número inválido em: ' + erros.join(', ') + '.'); return; }
      r.conteudo.etapas.forEach(function (e) { if (e.topicos) e.topicos = e.topicos.map(function (t) { return t.trim(); }).filter(Boolean); });
      Dados.conteudo = r.conteudo;
      Dados.gravarConteudo();
      var est = Dados.estado;
      est.le.ultimaPergunta = ul; est.le.proxima = ul + 1;
      est.ese.capitulo = cp; est.ese.ultimoItem = ui2; est.ese.proximoItem = ui2 + 1;
      est.ese.nomeCapitulo = ese.nomeCapitulo.trim(); est.ese.secao = ese.secao.trim(); est.ese.titulo = ese.titulo.trim();
      if (est.encontroEmAndamento && !est.encontroEmAndamento.le.lida) est.encontroEmAndamento.le.pergunta = est.le.proxima;
      Dados.gravarEstado();
      Local.apagar('mensagem');
      if (r.quem.trim()) Local.gravar('quem', r.quem.trim());
      ui.rascunho = null;
      avisar('Salvo. A versão anterior ficou guardada neste aparelho.');
      ir('inicio');
    },
    edEtapaSubir: function (b) { moverEm(ui.rascunho.conteudo.etapas, +b.dataset.i, -1); render(); },
    edEtapaDescer: function (b) { moverEm(ui.rascunho.conteudo.etapas, +b.dataset.i, 1); render(); },
    edEtapaRemover: function (b) {
      var e = ui.rascunho.conteudo.etapas[+b.dataset.i];
      if (ROTULO_ESPECIAL[e.id] && !confirm('A etapa "' + e.titulo + '" tem tela própria (' + ROTULO_ESPECIAL[e.id] + '). Remover mesmo?')) return;
      ui.rascunho.conteudo.etapas.splice(+b.dataset.i, 1); render();
    },
    edEtapaMais: function () { ui.rascunho.conteudo.etapas.push({ id: 'etapa-' + Date.now(), titulo: 'Nova etapa', texto: '', topicos: [] }); render(); },
    edTopicoMais: function (b) { var e = ui.rascunho.conteudo.etapas[+b.dataset.i]; (e.topicos = e.topicos || []).push(''); render(); },
    edTopicoSubir: function (b) { moverEm(ui.rascunho.conteudo.etapas[+b.dataset.i].topicos, +b.dataset.j, -1); render(); },
    edTopicoDescer: function (b) { moverEm(ui.rascunho.conteudo.etapas[+b.dataset.i].topicos, +b.dataset.j, 1); render(); },
    edTopicoRemover: function (b) { ui.rascunho.conteudo.etapas[+b.dataset.i].topicos.splice(+b.dataset.j, 1); render(); },

    /* textos */
    abrirTextos: function () { if (!ui.rascunho) ACOES.abrirEdicao(); ir('textos'); },
    textoBaixar: function (b) { var x = Textos.bruto(b.dataset.chave); if (x) baixar(x.nomeArquivo, x.txt); },
    textoConferir: function (b) {
      var x = Textos.bruto(b.dataset.chave);
      ui.analise = { txt: x.txt, nomeArquivo: x.nomeArquivo, origem: x.origem, cap: FT.analisar(x.txt, { nomeArquivo: x.nomeArquivo }), soLeitura: true, voltar: 'textos' };
      ir('analise');
    },
    analiseVoltar: function () { ir(ui.analise && ui.analise.voltar === 'manual' ? 'manual' : 'textos'); },
    analiseGravar: function () {
      var a = ui.analise;
      if (Textos.gravar(a.txt, a.nomeArquivo, a.origem)) {
        avisar('Gravado: ' + a.nomeArquivo + '.');
        Local.apagar('mensagem');
        ui.analise = null; ui.manual = null;
        ir('textos');
      }
    },
    manualNovo: function (b) { ui.manual = { livro: b.dataset.livro, parte: '', capitulo: '', titulo: '', edicao: '', itens: [itemVazio(b.dataset.livro)] }; ir('manual'); },
    manualEditar: function (b) {
      var cap = Textos.analisado(b.dataset.chave);
      ui.manual = manualDeAnalise(cap); ui.manual.editando = true; ir('manual');
    },
    manItemMais: function () {
      var m = ui.manual, it = itemVazio(m.livro), ant = m.itens[m.itens.length - 1];
      if (ant) { var n = inteiro(ant.numero); if (n !== null) it.numero = String(n + 1); it.secao = ant.secao; }
      m.itens.push(it); render();
    },
    manItemSubir: function (b) { moverEm(ui.manual.itens, +b.dataset.i, -1); render(); },
    manItemDescer: function (b) { moverEm(ui.manual.itens, +b.dataset.i, 1); render(); },
    manItemRemover: function (b) { if (confirm('Remover este item e o texto dele?')) { ui.manual.itens.splice(+b.dataset.i, 1); render(); } },
    manParMais: function (b) {
      var it = ui.manual.itens[+b.dataset.i], ult = it.paragrafos[it.paragrafos.length - 1];
      it.paragrafos.push({ tipo: ult ? ult.tipo : (ui.manual.livro === 'LE' ? 'R' : 'texto'), texto: '' }); render();
    },
    manParRemover: function (b) { ui.manual.itens[+b.dataset.i].paragrafos.splice(+b.dataset.j, 1); render(); },
    manConferir: function () {
      var m = ui.manual, txt = manualParaTxt(m);
      var cab = { livro: m.livro, parte: m.parte, capitulo: m.capitulo };
      var nome = FT.nomeArquivoEsperado(cab) || 'capitulo.txt';
      ui.analise = { txt: txt, nomeArquivo: nome, origem: 'manual', cap: FT.analisar(txt, { nomeArquivo: nome }), voltar: 'manual' };
      ir('analise');
    }
  };

  /* =================================================================
     Campos (data-campo): atualizam sem redesenhar a tela
     ================================================================= */
  function campoInput(nome, valor, el) {
    var p = nome.split('.');
    if (p[0] === 'nota') { agendarNota(etapaAtual().id, valor); return; }
    if (p[0] === 'msg') {
      var m = dadosMensagem(); m[p[1]] = valor;
      Local.gravar('mensagem', m);
      var prev = document.getElementById('previa-msg');
      if (prev) prev.textContent = montarMensagem(m);
      if (p[1] === 'nomeCapitulo' || p[1] === 'secao') { Dados.estado.ese[p[1]] = valor.trim(); Dados.gravarEstado(); }
      return;
    }
    if (p[0] === 'ed') {
      var r = ui.rascunho;
      if (p[1] === 'etapa') r.conteudo.etapas[+p[2]][p[3]] = valor;
      else if (p[1] === 'topico') r.conteudo.etapas[+p[2]].topicos[+p[3]] = valor;
      else if (p[1] === 'le') r.estado.le[p[2]] = valor;
      else if (p[1] === 'ese') r.estado.ese[p[2]] = valor;
      else if (p[1] === 'meet') r.conteudo.meet = valor.trim();
      else if (p[1] === 'modelo') r.conteudo.mensagem.modelo = valor;
      else if (p[1] === 'caritas') r.conteudo.caritas = valor.split(/\n\s*\n/).map(function (s) { return s.replace(/\s*\n\s*/g, ' ').trim(); }).filter(Boolean);
      else if (p[1] === 'presentes') r.conteudo.presentesConhecidos = valor.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      else if (p[1] === 'quem') r.quem = valor;
      return;
    }
    if (p[0] === 'man') {
      var mm = ui.manual;
      if (p[1] === 'item') mm.itens[+p[2]][p[3]] = valor;
      else if (p[1] === 'par') mm.itens[+p[2]].paragrafos[+p[3]][p[4]] = valor;
      else mm[p[1]] = valor;
      return;
    }
  }

  /* =================================================================
     Eventos
     ================================================================= */
  var INTERATIVO = 'button,a,input,textarea,select,label,summary,details,.nota-area,.rodape-nav,.topo,.cortina';

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('[data-acao]');
    if (a) {
      if (a.disabled) return;
      var f = ACOES[a.dataset.acao];
      if (f) f(a, ev);
      return;
    }
    var bl = ev.target.closest('[data-bloco]');
    if (bl) { ui.regua = +bl.dataset.bloco; marcarRegua(false); return; }
    var cb = ev.target.closest('[data-caritas]');
    if (cb) { moverCaritas(+cb.dataset.caritas, false); return; }
    // preces de olhos fechados: clique em qualquer ponto avança o destaque
    if (telaPrece() && !ev.target.closest(INTERATIVO)) avancarPrece(1);
  });

  // Prece de Cáritas: o destaque segue o mouse; ao sair da área, fica no último bloco
  document.addEventListener('mouseover', function (ev) {
    var cb = ev.target.closest && ev.target.closest('[data-caritas]');
    if (cb && +cb.dataset.caritas !== ui.bloco) moverCaritas(+cb.dataset.caritas, false);
  });

  document.addEventListener('input', function (ev) {
    var c = ev.target.closest('[data-campo]');
    if (c && c.dataset.campo !== 'arquivo') campoInput(c.dataset.campo, c.value, c);
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.dataset && t.dataset.campo === 'arquivo') { lerArquivo(t.files && t.files[0]); t.value = ''; return; }
    if (t.dataset && t.dataset.presente !== undefined) {
      var enc = garantirEncontro(), nome = t.dataset.presente, i = enc.presentes.indexOf(nome);
      if (t.checked && i < 0) enc.presentes.push(nome);
      if (!t.checked && i >= 0) enc.presentes.splice(i, 1);
      Dados.gravarEstado(); ui.nome = 0; render();
      return;
    }
    if (t.tagName === 'SELECT' && t.dataset && t.dataset.campo) campoInput(t.dataset.campo, t.value, t);
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var t = ev.target;
    if (t.closest && t.closest('input,textarea,select,[contenteditable="true"]')) {
      if (ev.key === 'Enter' && t.id === 'campo-quem') ACOES.salvarQuem();
      if (ev.key === 'Enter' && t.id === 'novo-presente') ACOES.acrescentarPresente();
      return;
    }
    if (ui.dialogo) { if (ev.key === 'Escape') ACOES.fecharDialogo(); return; }
    var k = ev.key;
    if (telaCaritas()) {
      if (k === 'ArrowDown' || k === 'ArrowRight' || k === ' ') { ev.preventDefault(); moverCaritas(ui.bloco + 1, true); }
      else if (k === 'ArrowUp' || k === 'ArrowLeft') { ev.preventDefault(); moverCaritas(ui.bloco - 1, true); }
      return;
    }
    if (telaPrece()) {
      if (t.closest && t.closest('button,a,summary')) return; // deixa o botão focado agir
      if (k === ' ' || k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown') { ev.preventDefault(); avancarPrece(1); }
      else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { ev.preventDefault(); avancarPrece(-1); }
      return;
    }
    if (telaLeitura()) {
      if (k === 'ArrowDown') { ev.preventDefault(); moverRegua(1); }
      else if (k === 'ArrowUp') { ev.preventDefault(); moverRegua(-1); }
    }
  });

  // Destaque dos botões de envio a partir das 20h30: redesenha o início a cada minuto
  setInterval(function () { if (ui.tela === 'inicio' && !janelaCaritas && !ui.dialogo) render(); }, 60000);

  // Outra janela (Prece de Cáritas aberta à parte) mudou algo no aparelho
  window.addEventListener('storage', function (ev) {
    if (ev.key && ev.key.indexOf('enl.') === 0 && (ev.key === 'enl.conteudo' || ev.key === 'enl.tamanho')) {
      Dados.carregar(); if (janelaCaritas) render();
    }
  });

  /* =================================================================
     Início
     ================================================================= */
  if (!FT) { $app.innerHTML = '<p style="padding:24px">Erro: o leitor de textos (parser.js) não carregou.</p>'; return; }
  Dados.carregar();
  render();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* sem internet offline, segue */ });
  }
})();
