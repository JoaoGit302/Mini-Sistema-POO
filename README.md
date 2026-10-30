# Mini-Sistema-POO (FECAPSTUDY)
# FecapStudy

Plataforma de apoio ao estudo desenvolvida para o Projeto Integrador da FECAP.
O aluno registra suas sessões de estudo, ganha XP e acompanha a meta semanal;
o responsável define a meta e recebe alertas; o administrador organiza a trilha
de disciplinas e o cronograma. Os dados são gravados em um banco MySQL por meio
de uma API em C#.

## Tecnologias

- **JavaScript** (núcleo orientado a objetos)
- **HTML5 + CSS3** (interface gráfica)
- **C# + MySQL** (backend `BackendEstudoAPI.exe`, porta 5080)

## Funcionalidades

A tela é dividida em quatro abas, uma para cada perfil:

| Aba | O que dá para fazer |
|---|---|
| **Aluno** | Registrar sessões de **Pomodoro**, **Exercícios** ou **Leitura**, usar o atalho "Pomodoro de 25 min", ver o XP, a barra de progresso da meta e a tabela de sessões |
| **Responsável** | Definir a meta semanal (de 30 a 3000 minutos) e gerar alertas por **e-mail** ou **WhatsApp** (simulados) |
| **Administrador** | Ver a trilha de disciplinas com a carga horária total e o cronograma semanal |
| **Servidor** | Consultar no banco as sessões, as metas e o relatório do aluno |

### Cálculo de XP

| Modalidade | Fórmula |
|---|---|
| Pomodoro | `minutos × 2 + ciclos × 15` |
| Exercícios | `minutos + acertos × 10` |
| Leitura | `minutos + páginas × 3 + 25` (se fez resumo) |

## Conceitos de POO aplicados

Esta versão usa um estilo parecido com Java/C#: os atributos são privados (`#`)
e são lidos por métodos como `getNome()` e `getEmail()`.

| Conceito | Onde aparece |
|---|---|
| Abstração | `Disciplina`, com código, nome, categoria e carga horária |
| Encapsulamento | `MetaEstudo`: os minutos só aumentam por `registrarAvanco()`, e `Usuario` não tem getter de senha |
| Classe abstrata | `Usuario` e `SessaoEstudo` bloqueiam `new` com `this.constructor` |
| Herança | `Usuario` → `Discente`, `Responsavel`, `Administrador` e `SessaoEstudo` → `SessaoPomodoro`, `SessaoExercicios`, `SessaoLeitura` |
| Polimorfismo dinâmico | `calcularXp()`, `gerarFeedback()` e `gerarPainelResumo()` sobrescritos em cada classe |
| Sobrecarga | `Discente.registrarEstudo()` escolhe a forma pelo tipo dos argumentos: `(sessao)`, `(disciplina, minutos)` ou `(disciplina, "14:00", "15:30", paginas)` |
| Interfaces | `INotificador` e `IExportavelJson`, verificadas com `foiImplementadaPor()` |
| Associação | `Responsavel` → `Discente`, sem vincular o mesmo RA duas vezes |
| Agregação | `TrilhaEstudo` ◇ `Disciplina` |
| Composição | `PlanoEstudo` ◆ `ItemCronograma` |
| Dependência | `ServicoAlertaResponsavel` e `ClienteBackendEstudo` |

## Estrutura

```
index.html    tela do sistema (com o estilo CSS)
classes.js    classes do núcleo orientado a objetos
app.js        abas, eventos da tela e comunicação com o backend
```

## Como executar

1. Inicie o MySQL (por exemplo, pelo XAMPP).
2. Execute `iniciar_backend.bat` na pasta do backend. O banco `fecap_estudo`
   é criado automaticamente.
3. Abra o arquivo `index.html` no navegador.

> Sem o backend rodando, o sistema funciona normalmente, mas os dados ficam só
> na tela. Sem o MySQL ligado, o backend salva os dados em um arquivo JSON local.

## Rotas da API utilizadas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/status` | Verifica a conexão com o servidor |
| POST | `/api/sessoes` | Grava uma sessão de estudo |
| GET | `/api/sessoes` | Lista as sessões gravadas |
| POST | `/api/metas` | Salva a meta semanal |
| GET | `/api/metas` | Lista as metas |
| GET | `/api/relatorio/{nome}` | Relatório do discente |

## Autores

- Seu Nome
