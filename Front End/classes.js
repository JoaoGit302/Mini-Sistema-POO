/*
 * FecapStudy - Versão 2 - Classes do sistema
 * Estilo: campos privados (#) + métodos getX(), parecido com Java/C#
 */

/* ================= Etapa 6 - Interfaces ================= */
class INotificador {
  static metodos = ['obterCanal', 'enviarAlerta'];

  static foiImplementadaPor(objeto) {
    return INotificador.metodos.every((m) => typeof objeto[m] === 'function');
  }
}

class IExportavelJson {
  static metodos = ['paraJson'];

  static foiImplementadaPor(objeto) {
    return IExportavelJson.metodos.every((m) => typeof objeto[m] === 'function');
  }
}

/* ================= Etapa 1 - Disciplina ================= */
class Disciplina {
  #codigo;
  #nome;
  #categoria;
  #horasSemana;

  constructor(codigo, nome, categoria, horasSemana) {
    this.#codigo = codigo;
    this.#nome = nome;
    this.#categoria = categoria;
    if (horasSemana <= 0) {
      this.#horasSemana = 2;
    } else {
      this.#horasSemana = horasSemana;
    }
  }

  getCodigo() { return this.#codigo; }
  getNome() { return this.#nome; }
  getCategoria() { return this.#categoria; }
  getHorasSemana() { return this.#horasSemana; }

  calcularCargaEmMinutos() {
    return this.#horasSemana * 60;
  }

  exibirResumo() {
    return this.#codigo + ' - ' + this.#nome + ' | ' + this.#categoria + ' | ' +
      this.#horasSemana + 'h (' + this.calcularCargaEmMinutos() + ' min)';
  }

  paraJson() {
    return JSON.stringify({ codigo: this.#codigo, nome: this.#nome, categoria: this.#categoria, cargaHorariaSemanal: this.#horasSemana });
  }
}

/* ================= Etapa 2 - MetaEstudo ================= */
class MetaEstudo {
  static MINIMO = 30;
  static MAXIMO = 3000;
  static MAXIMO_POR_SESSAO = 480;

  #minutosMeta;
  #minutosFeitos;

  constructor(minutosMeta) {
    this.#minutosFeitos = 0;
    this.redefinirMeta(minutosMeta);
  }

  getMinutosMeta() { return this.#minutosMeta; }
  getMinutosFeitos() { return this.#minutosFeitos; }

  registrarAvanco(minutos) {
    const valido = minutos > 0 && minutos <= MetaEstudo.MAXIMO_POR_SESSAO;
    if (valido) {
      this.#minutosFeitos = this.#minutosFeitos + minutos;
    }
    return valido;
  }

  redefinirMeta(minutos) {
    this.#minutosMeta = Math.max(MetaEstudo.MINIMO, Math.min(MetaEstudo.MAXIMO, minutos));
  }

  calcularPercentual() {
    if (this.#minutosFeitos >= this.#minutosMeta) return 100;
    return Number(((this.#minutosFeitos * 100) / this.#minutosMeta).toFixed(1));
  }

  estaCumprida() {
    return this.calcularPercentual() === 100;
  }

  paraJson() {
    return JSON.stringify({ metaMinutosSemana: this.#minutosMeta, minutosCumpridos: this.#minutosFeitos, percentual: this.calcularPercentual() });
  }
}

/* ================= Etapa 3 - Usuarios ================= */
class Usuario {
  #nome;
  #email;
  #senha;

  constructor(nome, email, senha) {
    if (this.constructor === Usuario) {
      throw new Error('Não é permitido criar um Usuario diretamente (classe abstrata).');
    }
    this.#nome = nome;
    this.#email = email;
    this.#senha = senha;
  }

  getNome() { return this.#nome; }
  getEmail() { return this.#email; }

  autenticar(senha) {
    return this.#senha === senha;
  }

  /* abstrato */ obterTipoPerfil() { throw new Error(this.constructor.name + ' precisa implementar obterTipoPerfil()'); }
  /* abstrato */ gerarPainelResumo() { throw new Error(this.constructor.name + ' precisa implementar gerarPainelResumo()'); }
}

class Administrador extends Usuario {
  #setor;
  #trilhas;

  constructor(nome, email, senha, setor) {
    super(nome, email, senha);
    this.#setor = setor;
    this.#trilhas = [];
  }

  criarTrilha(titulo) {
    const trilha = new TrilhaEstudo(titulo);
    this.#trilhas.push(trilha);
    return trilha;
  }

  obterTipoPerfil() { return 'Administrador'; }

  gerarPainelResumo() {
    return 'Setor: ' + this.#setor + '\nTrilhas criadas: ' + this.#trilhas.length;
  }
}

class Responsavel extends Usuario {
  #grauParentesco;
  #alunos;
  #metasPorAluno;

  constructor(nome, email, senha, grauParentesco) {
    super(nome, email, senha);
    this.#grauParentesco = grauParentesco;
    this.#alunos = [];
    this.#metasPorAluno = new Map();
  }

  /* Etapa 7 - Associação */
  vincularDiscente(aluno) {
    for (const a of this.#alunos) {
      if (a.getRa() === aluno.getRa()) return false;
    }
    this.#alunos.push(aluno);
    return true;
  }

  definirMeta(aluno, minutos) {
    if (this.#metasPorAluno.has(aluno)) {
      this.#metasPorAluno.get(aluno).redefinirMeta(minutos);
    } else {
      this.#metasPorAluno.set(aluno, new MetaEstudo(minutos));
    }
    return this.#metasPorAluno.get(aluno);
  }

  getMeta(aluno) { return this.#metasPorAluno.get(aluno); }
  getDiscentes() { return this.#alunos.slice(); }

  obterTipoPerfil() { return 'Responsável'; }

  gerarPainelResumo() {
    let texto = 'Parentesco: ' + this.#grauParentesco;
    for (const aluno of this.#alunos) {
      const meta = this.#metasPorAluno.get(aluno);
      texto += '\n' + aluno.getNome() + ': ' + (meta ? meta.calcularPercentual() + '% da meta' : 'sem meta');
    }
    return texto;
  }
}

class Discente extends Usuario {
  #ra;
  #xp;
  #sessoes;

  constructor(nome, email, senha, ra) {
    super(nome, email, senha);
    this.#ra = ra;
    this.#xp = 0;
    this.#sessoes = [];
  }

  getRa() { return this.#ra; }
  getXp() { return this.#xp; }
  getSessoes() { return this.#sessoes.slice(); }

  /*
   * Etapa 5 - Sobrecarga (decidida pelos TIPOS dos argumentos)
   *   registrarEstudo(sessao)
   *   registrarEstudo(disciplina, minutos)
   *   registrarEstudo(disciplina, "14:00", "15:30", paginas)
   */
  registrarEstudo(p1, p2, p3, p4) {
    if (p1 instanceof SessaoEstudo) {
      return this.#adicionar(p1);
    }
    if (p1 instanceof Disciplina && typeof p2 === 'number' && p3 === undefined) {
      let ciclos = Math.floor(p2 / 25);
      if (ciclos < 1) ciclos = 1;
      return this.#adicionar(new SessaoPomodoro(p1, p2, ciclos));
    }
    if (p1 instanceof Disciplina && typeof p2 === 'string' && typeof p3 === 'string') {
      const minutos = Discente.minutosEntre(p2, p3);
      return this.#adicionar(new SessaoLeitura(p1, minutos, p4, true));
    }
    throw new Error('registrarEstudo: parâmetros inválidos');
  }

  #adicionar(sessao) {
    this.#sessoes.push(sessao);
    this.#xp += sessao.calcularXp();
    return sessao;
  }

  static minutosEntre(inicio, fim) {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fim.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  obterTipoPerfil() { return 'Discente'; }

  gerarPainelResumo() {
    let minutos = 0;
    for (const s of this.#sessoes) minutos += s.getDuracao();
    return 'RA: ' + this.#ra + '\nXP: ' + this.#xp + '\nTempo estudado: ' + minutos + ' min';
  }
}

/* ================= Etapa 4 - Sessões ================= */
class SessaoEstudo {
  #disciplina;
  #duracao;
  #data;

  constructor(disciplina, duracao) {
    if (this.constructor === SessaoEstudo) {
      throw new Error('SessaoEstudo é abstrata.');
    }
    this.#disciplina = disciplina;
    this.#duracao = duracao;
    this.#data = new Date();
  }

  getDisciplina() { return this.#disciplina; }
  getDuracao() { return this.#duracao; }
  getData() { return this.#data; }

  /* abstrato */ obterModalidade() { throw new Error('obterModalidade() não implementado'); }
  /* abstrato */ calcularXp() { throw new Error('calcularXp() não implementado'); }

  gerarFeedback() {
    return this.obterModalidade() + ' | ' + this.#disciplina.getNome() + ' | ' +
      this.#duracao + ' min | +' + this.calcularXp() + ' XP';
  }

  paraJson() {
    return JSON.stringify({
      disciplina: this.#disciplina.getNome(),
      tipoModalidade: this.obterModalidade(),
      duracaoMinutos: this.#duracao,
      xpGanho: this.calcularXp(),
      dataHora: this.#data.toISOString(),
    });
  }
}

class SessaoPomodoro extends SessaoEstudo {
  #ciclos;
  constructor(disciplina, duracao, ciclos) {
    super(disciplina, duracao);
    this.#ciclos = ciclos;
  }
  obterModalidade() { return 'Pomodoro'; }
  calcularXp() { return this.getDuracao() * 2 + this.#ciclos * 15; }
}

class SessaoExercicios extends SessaoEstudo {
  #questoes;
  #acertos;
  constructor(disciplina, duracao, questoes, acertos) {
    super(disciplina, duracao);
    this.#questoes = questoes;
    this.#acertos = Math.min(acertos, questoes);
  }
  obterModalidade() { return 'Exercicios'; }
  calcularXp() { return this.getDuracao() + this.#acertos * 10; }
  gerarFeedback() {
    const taxa = this.#questoes > 0 ? Math.round((this.#acertos / this.#questoes) * 100) : 0;
    return super.gerarFeedback() + ' | ' + taxa + '% de acerto';
  }
}

class SessaoLeitura extends SessaoEstudo {
  #paginas;
  #resumo;
  constructor(disciplina, duracao, paginas, resumo) {
    super(disciplina, duracao);
    this.#paginas = paginas;
    this.#resumo = resumo;
  }
  obterModalidade() { return 'Leitura'; }
  calcularXp() {
    let xp = this.getDuracao() + this.#paginas * 3;
    if (this.#resumo) xp += 25;
    return xp;
  }
}

/* ================= Etapa 6 - Notificadores ================= */
class NotificadorEmail {
  #enviados = [];
  obterCanal() { return 'E-mail'; }
  enviarAlerta(destinatario, mensagem) {
    this.#enviados.push({ destinatario, mensagem });
    return true;
  }
  getEnviados() { return this.#enviados.slice(); }
}

class NotificadorWhatsApp {
  #enviados = [];
  obterCanal() { return 'WhatsApp'; }
  enviarAlerta(destinatario, mensagem) {
    this.#enviados.push({ destinatario, mensagem: '*FecapStudy*: ' + mensagem });
    return true;
  }
  getEnviados() { return this.#enviados.slice(); }
}

/* ================= Etapa 7 - Agregação ================= */
class TrilhaEstudo {
  #nome;
  #disciplinas = [];

  constructor(nome) { this.#nome = nome; }

  getNome() { return this.#nome; }

  adicionarDisciplina(disciplina) {
    const repetida = this.#disciplinas.some((d) => d.getCodigo() === disciplina.getCodigo());
    if (!repetida) this.#disciplinas.push(disciplina);
    return !repetida;
  }

  getDisciplinas() { return this.#disciplinas.slice(); }

  getHorasTotais() {
    let total = 0;
    for (const d of this.#disciplinas) total += d.getHorasSemana();
    return total;
  }
}

/* ================= Etapa 8 - Composição ================= */
class ItemCronograma {
  #dia;
  #minutos;
  constructor(dia, minutos) {
    this.#dia = dia;
    this.#minutos = minutos;
  }
  getDia() { return this.#dia; }
  getMinutos() { return this.#minutos; }
}

class PlanoEstudo {
  #itens = [];

  adicionarItem(dia, minutos) {
    this.#itens.push(new ItemCronograma(dia, minutos));
  }

  getTotalMinutos() {
    let total = 0;
    for (const item of this.#itens) total += item.getMinutos();
    return total;
  }

  getResumo() {
    return this.#itens.map((item) => ({ dia: item.getDia(), minutos: item.getMinutos() }));
  }
}

/* ================= Etapa 8 - Dependência ================= */
class ServicoAlertaResponsavel {
  avaliarDiscente(discente, meta, responsavel, notificador) {
    if (!INotificador.foiImplementadaPor(notificador)) {
      throw new Error('Notificador inválido');
    }
    let mensagem;
    if (meta.estaCumprida()) {
      mensagem = discente.getNome() + ' cumpriu 100% da meta semanal!';
    } else {
      mensagem = discente.getNome() + ' fez ' + meta.getMinutosFeitos() + ' de ' +
        meta.getMinutosMeta() + ' minutos (' + meta.calcularPercentual() + '%).';
    }
    notificador.enviarAlerta(responsavel.getEmail(), mensagem);
    return mensagem;
  }
}

/* ================= Etapa 10 - Backend ================= */
class ClienteBackendEstudo {
  #enderecoBase;

  constructor(enderecoBase) {
    this.#enderecoBase = enderecoBase || 'http://localhost:5080';
  }

  #get(rota) {
    return fetch(this.#enderecoBase + rota).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  #post(rota, objeto) {
    return fetch(this.#enderecoBase + rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objeto),
    }).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  status() { return this.#get('/api/status'); }
  buscarSessoes() { return this.#get('/api/sessoes'); }
  buscarMetas() { return this.#get('/api/metas'); }
  buscarRelatorio(nomeDiscente) { return this.#get('/api/relatorio/' + encodeURIComponent(nomeDiscente)); }

  enviarSessao(discente, sessao) {
    const dados = JSON.parse(sessao.paraJson());
    dados.discenteNome = discente.getNome();
    return this.#post('/api/sessoes', dados);
  }

  enviarMeta(discente, responsavel, meta) {
    const dados = JSON.parse(meta.paraJson());
    dados.discenteNome = discente.getNome();
    dados.responsavelNome = responsavel.getNome();
    return this.#post('/api/metas', dados);
  }
}
