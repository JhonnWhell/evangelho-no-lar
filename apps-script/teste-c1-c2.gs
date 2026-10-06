/* =====================================================================
   teste-c1-c2.gs — Evangelho no Lar · script SÓ DE TESTE
   Verifica C-1 (POST text/plain sem pré-verificação CORS) e
   C-2 (cota com consulta a cada 15 s por ~1 h).
   Não lê nem grava nada no Drive. Não tem senha porque não guarda dado.
   Depois do teste, a implantação pode ser arquivada.

   Como usar: ver testes/c1-c2.html (instruções na própria página).
   ===================================================================== */

function resposta_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return resposta_({
    ok: true,
    metodo: 'GET',
    servidor: new Date().toISOString(),
    parametros: e && e.parameter ? e.parameter : {}
  });
}

function doPost(e) {
  var corpo = e && e.postData ? e.postData.contents : '';
  var tipo = e && e.postData ? e.postData.type : '';
  var lido = null;
  try { lido = JSON.parse(corpo); } catch (err) { lido = null; }
  return resposta_({
    ok: true,
    metodo: 'POST',
    tipoRecebido: tipo,
    caracteres: corpo.length,
    jsonValido: lido !== null,
    eco: lido && lido.n !== undefined ? lido.n : null,
    servidor: new Date().toISOString()
  });
}
