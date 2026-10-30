/*
 * FecapStudy - Versão 2 - Tela com abas (Etapa 9) e servidor (Etapa 10)
 */

/* ---------------- Objetos do sistema ---------------- */
var materias = [
  new Disciplina('LP101', 'Lógica de Programação', 'Computação', 3),
  new Disciplina('WEB120', 'Desenvolvimento Web', 'Computação', 4),
  new Disciplina('ENG110', 'Engenharia de Software', 'Gestão', 0), // 0 -> vira 2h
];

var aluna = new Discente('Beatriz Costa', 'beatriz@edu.fecap.br', 'bia2024', '24026045');
var pai = new Responsavel('Carlos Costa', 'carlos.costa@email.com', 'carlos1', 'Pai');
var professor = new Administrador('Prof. Ricardo Alves', 'ricardo@fecap.br', 'adm2024', 'Mentoria');

pai.vincularDiscente(aluna);
var meta = pai.definirMeta(aluna, 450);

var trilha = professor.criarTrilha('Trilha Fundamentos de ADS');
for (var i = 0; i < materias.length; i++) trilha.adicionarDisciplina(materias[i]);

var plano = new PlanoEstudo();
plano.adicionarItem('Segunda', 90);
plano.adicionarItem('Terça', 60);
plano.adicionarItem('Quinta', 90);
plano.adicionarItem('Domingo', 120);

var canais = { email: new NotificadorEmail(), whatsapp: new NotificadorWhatsApp() };
var servicoAlerta = new ServicoAlertaResponsavel();
var api = new ClienteBackendEstudo('http://localhost:5080');

/* ---------------- Utilitários ---------------- */
function pegar(id) {
  return document.getElementById(id);
}

function linhaTabela(valores) {
  var tr = document.createElement('tr');
  valores.forEach(function (v) {
    var td = document.createElement('td');
    td.textContent = v;
    tr.appendChild(td);
  });
  return tr;
}

function mensagem(id, texto, deuErro) {
  pegar(id).textContent = texto;
  pegar(id).className = deuErro ? 'mensagem erro' : 'mensagem';
}

/* ---------------- Abas ---------------- */
document.querySelectorAll('nav button').forEach(function (botao) {
  botao.addEventListener('click', function () {
    document.querySelectorAll('nav button').forEach(function (b) { b.classList.remove('ativa'); });
    document.querySelectorAll('.aba').forEach(function (a) { a.classList.remove('ativa'); });
    botao.classList.add('ativa');
    pegar(botao.dataset.aba).classList.add('ativa');
  });
});

/* ---------------- Desenho da tela ---------------- */
function desenharPaineis() {
  // Polimorfismo: mesmo método, três resultados diferentes
  pegar('painelAluno').textContent = aluna.getNome() + ' (' + aluna.obterTipoPerfil() + ')\n' + aluna.gerarPainelResumo();
  pegar('painelResponsavel').textContent = pai.getNome() + ' (' + pai.obterTipoPerfil() + ')\n' + pai.gerarPainelResumo();
  pegar('painelAdmin').textContent = professor.getNome() + ' (' + professor.obterTipoPerfil() + ')\n' + professor.gerarPainelResumo();
}

function desenharMeta() {
  pegar('barraMeta').value = meta.calcularPercentual();
  pegar('textoMeta').textContent = meta.getMinutosFeitos() + ' / ' + meta.getMinutosMeta() +
    ' minutos (' + meta.calcularPercentual() + '%)' + (meta.estaCumprida() ? ' - Meta cumprida!' : '');
  pegar('txtMeta').value = meta.getMinutosMeta();
}

function desenharSessoes() {
  var corpo = pegar('tabelaSessoes');
  corpo.innerHTML = '';
  aluna.getSessoes().forEach(function (s) {
    corpo.appendChild(linhaTabela([s.obterModalidade(), s.getDisciplina().getNome(), s.getDuracao(), s.calcularXp()]));
  });
}

function desenharAdmin() {
  pegar('tituloTrilha').textContent = trilha.getNome() + ' (' + trilha.getHorasTotais() + 'h por semana)';
  var lista = pegar('listaTrilha');
  lista.innerHTML = '';
  trilha.getDisciplinas().forEach(function (d) {
    var li = document.createElement('li');
    li.textContent = d.exibirResumo();
    lista.appendChild(li);
  });

  var corpo = pegar('tabelaPlano');
  corpo.innerHTML = '';
  plano.getResumo().forEach(function (item) {
    corpo.appendChild(linhaTabela([item.dia, item.minutos]));
  });
  corpo.appendChild(linhaTabela(['Total', plano.getTotalMinutos()]));
}

function desenharTudo() {
  desenharPaineis();
  desenharMeta();
  desenharSessoes();
  desenharAdmin();
}

/* ---------------- Aba Aluno ---------------- */
function ajustarCamposExtras() {
  var modalidade = pegar('selModalidade').value;
  if (modalidade === 'Pomodoro') {
    pegar('lblExtra1').textContent = 'Ciclos';
    pegar('caixaExtra2').hidden = true;
  } else if (modalidade === 'Exercicios') {
    pegar('lblExtra1').textContent = 'Total de questões';
    pegar('lblExtra2').textContent = 'Acertos';
    pegar('caixaExtra2').hidden = false;
  } else {
    pegar('lblExtra1').textContent = 'Páginas lidas';
    pegar('lblExtra2').textContent = 'Fez resumo? (1 = sim, 0 = não)';
    pegar('caixaExtra2').hidden = false;
  }
}

function montarSessao() {
  var materia = materias[pegar('selDisciplina').selectedIndex];
  var minutos = Number(pegar('txtMinutos').value);
  var extra1 = Number(pegar('txtExtra1').value);
  var extra2 = Number(pegar('txtExtra2').value);

  switch (pegar('selModalidade').value) {
    case 'Pomodoro': return new SessaoPomodoro(materia, minutos, extra1);
    case 'Exercicios': return new SessaoExercicios(materia, minutos, extra1, extra2);
    default: return new SessaoLeitura(materia, minutos, extra1, extra2 === 1);
  }
}

// Recebe a sessão já registrada no aluno e atualiza meta, tela e servidor
function finalizarRegistro(sessao) {
  meta.registrarAvanco(sessao.getDuracao());
  desenharTudo();
  mensagem('msgAluno', 'Registrado: ' + sessao.gerarFeedback());

  api.enviarSessao(aluna, sessao)
    .then(function () { mensagem('msgAluno', 'Registrado e salvo no banco: ' + sessao.gerarFeedback()); })
    .catch(function () { mensagem('msgAluno', 'Registrado só na tela (servidor offline).', true); });
}

pegar('selModalidade').addEventListener('change', ajustarCamposExtras);

pegar('btnRegistrar').addEventListener('click', function () {
  var minutos = Number(pegar('txtMinutos').value);
  if (minutos <= 0 || minutos > MetaEstudo.MAXIMO_POR_SESSAO) {
    mensagem('msgAluno', 'Os minutos devem estar entre 1 e 480.', true);
    return;
  }
  finalizarRegistro(aluna.registrarEstudo(montarSessao())); // forma 1 da sobrecarga
});

pegar('btnRapido').addEventListener('click', function () {
  var materia = materias[pegar('selDisciplina').selectedIndex];
  finalizarRegistro(aluna.registrarEstudo(materia, 25)); // forma 2 da sobrecarga
});

/* ---------------- Aba Responsável ---------------- */
pegar('btnMeta').addEventListener('click', function () {
  pai.definirMeta(aluna, Number(pegar('txtMeta').value));
  desenharTudo();
  api.enviarMeta(aluna, pai, meta).catch(function () {});
});

pegar('btnAlerta').addEventListener('click', function () {
  var canal = canais[pegar('selCanal').value];
  var texto = servicoAlerta.avaliarDiscente(aluna, meta, pai, canal);
  var li = document.createElement('li');
  li.textContent = '[' + canal.obterCanal() + ' para ' + pai.getEmail() + '] ' + texto;
  pegar('listaAlertas').prepend(li);
});

/* ---------------- Aba Servidor ---------------- */
function mostrarResultado(dados) {
  var area = pegar('resultadoServidor');
  area.innerHTML = '';
  var lista = Array.isArray(dados) ? dados : null;

  if (!lista) {
    var pre = document.createElement('pre');
    pre.className = 'painel';
    pre.textContent = JSON.stringify(dados, null, 2);
    area.appendChild(pre);
    return;
  }
  if (lista.length === 0) {
    area.textContent = 'Nenhum registro encontrado.';
    return;
  }
  var colunas = Object.keys(lista[0]);
  var tabela = document.createElement('table');
  tabela.appendChild(linhaTabela(colunas));
  lista.forEach(function (registro) {
    tabela.appendChild(linhaTabela(colunas.map(function (c) { return registro[c]; })));
  });
  area.appendChild(tabela);
}

document.querySelectorAll('[data-consulta]').forEach(function (botao) {
  botao.addEventListener('click', function () {
    var pedido;
    if (botao.dataset.consulta === 'sessoes') pedido = api.buscarSessoes();
    else if (botao.dataset.consulta === 'metas') pedido = api.buscarMetas();
    else pedido = api.buscarRelatorio(aluna.getNome());

    mensagem('msgServidor', 'Carregando...');
    pedido
      .then(function (dados) { mensagem('msgServidor', ''); mostrarResultado(dados); })
      .catch(function () { mensagem('msgServidor', 'Servidor offline. Rode o iniciar_backend.bat.', true); });
  });
});

/* ---------------- Início ---------------- */
materias.forEach(function (m) {
  pegar('selDisciplina').add(new Option(m.getCodigo() + ' - ' + m.getNome()));
});
desenharTudo();

api.status()
  .then(function () { pegar('statusServidor').textContent = 'Servidor: conectado (porta 5080)'; })
  .catch(function () { pegar('statusServidor').textContent = 'Servidor: desligado - modo local'; });
