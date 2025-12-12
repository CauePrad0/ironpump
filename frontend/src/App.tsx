import React, { useEffect, useState } from 'react';
import './App.css';

// --- Interfaces ---
interface Exercicio {
  id: number;
  nome: string;
  grupoMuscular: string;
  observacoes: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface ProgressoDTO {
  id: number;
  data: string;
  cargaKg: number;
  series: number;
  repeticoes: number;
  evoluiu?: boolean;
  regrediu?: boolean;
  manteve?: boolean;
  diferencaCarga?: number;
}

// --- FUNÇÃO AUXILIAR DE CORES ---
const getCorGrupo = (grupo: string) => {
  const g = grupo ? grupo.toLowerCase() : '';
  // Retorna [corTexto, corFundo]
  if (g.includes('peito')) return ['#e74c3c', '#fadbd8'];     // Vermelho
  if (g.includes('costas')) return ['#2980b9', '#d6eaf8'];    // Azul
  if (g.includes('pernas')) return ['#d35400', '#edbb99'];    // Laranja/Terra
  if (g.includes('ombros')) return ['#8e44ad', '#d2b4de'];    // Roxo
  if (g.includes('bíceps')) return ['#27ae60', '#d5f5e3'];    // Verde
  if (g.includes('tríceps')) return ['#16a085', '#a3e4d7'];   // Verde Água
  if (g.includes('abdômen')) return ['#f39c12', '#fdebd0'];   // Amarelo
  return ['#7f8c8d', '#f2f3f4']; // Cinza (Padrão)
};

// --- FUNÇÃO AUXILIAR DE FORMATAÇÃO DE DATA ---
const formatarData = (dataISO: string): string => {
  if (!dataISO) return '';

  // Se já estiver no formato DD/MM/AAAA, retorna direto
  if (dataISO.includes('/')) return dataISO;

  // Tenta criar um objeto Date e formatar
  try {
    const data = new Date(dataISO + 'T00:00:00'); // Adiciona horário para evitar timezone
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    const partes = dataISO.split('-');
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }
    return dataISO;
  }
};

function App() {
  // --- Estado de Autenticação ---
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [authNome, setAuthNome] = useState('');

  // --- Estado do Dashboard ---
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [ultimosTreinos, setUltimosTreinos] = useState<Record<number, ProgressoDTO>>({});
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'DASHBOARD' | 'CRIAR_EXERCICIO' | 'REGISTRAR_TREINO' | 'HISTORICO'>('DASHBOARD');

  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null);

  const [carga, setCarga] = useState('');
  const [series, setSeries] = useState('3');
  const [reps, setReps] = useState('10');
  const [feedbackTreino, setFeedbackTreino] = useState<ProgressoDTO | null>(null);

  // Novo Exercício
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [novaObservacao, setNovaObservacao] = useState('');

  const [historicoDados, setHistoricoDados] = useState<ProgressoDTO[]>([]);

  // --- PERSISTÊNCIA DE LOGIN ---
  useEffect(() => {
    // Ao carregar a página, verifica se tem usuário salvo
    const usuarioSalvo = localStorage.getItem('ironpump_user');
    if (usuarioSalvo) {
      const user = JSON.parse(usuarioSalvo);
      setUsuarioLogado(user);
      carregarExercicios(user.id); // Já carrega os dados
    }
  }, []);

  // --- Funções de Autenticação ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, senha: authSenha })
      });

      if (res.ok) {
        const user = await res.json();

        // SALVAR NO LOCALSTORAGE
        localStorage.setItem('ironpump_user', JSON.stringify(user));

        setUsuarioLogado(user);
        carregarExercicios(user.id);
      } else {
        alert("Email ou senha incorretos.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com servidor.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: authNome, email: authEmail, senha: authSenha })
      });

      if (res.ok) {
        const user = await res.json();

        // SALVAR NO LOCALSTORAGE
        localStorage.setItem('ironpump_user', JSON.stringify(user));

        setUsuarioLogado(user);
        carregarExercicios(user.id);
      } else {
        alert("Erro ao cadastrar. Email já existe?");
      }
    } catch (error) {
      alert("Erro ao registrar.");
    }
  };

  const handleLogout = () => {
    // LIMPAR LOCALSTORAGE
    localStorage.removeItem('ironpump_user');

    setUsuarioLogado(null);
    setExercicios([]);
    setAuthEmail('');
    setAuthSenha('');
    setView('DASHBOARD');
  };

  // --- Funções do Sistema ---
  const carregarExercicios = async (userId: number) => {
    try {
      const res = await fetch(`/api/exercicios?usuarioId=${userId}`);
      if(res.ok){
        const data = await res.json();
        setExercicios(data);

        // Carregar último treino de cada exercício
        data.forEach(async (ex: Exercicio) => {
          try {
            const resHistorico = await fetch(`/api/treinos/historico?usuarioId=${userId}&exercicioId=${ex.id}`);
            if (resHistorico.ok) {
              const historico = await resHistorico.json();
              if (historico.length > 0) {
                setUltimosTreinos(prev => ({
                  ...prev,
                  [ex.id]: historico[0]
                }));
              }
            }
          } catch (error) {
            console.error(`Erro ao carregar histórico do exercício ${ex.id}`, error);
          }
        });
      }
    } catch (error) { console.error("Erro API", error); }
  };

  const carregarHistorico = async (ex: Exercicio) => {
    if (!usuarioLogado) return;
    setLoading(true);
    setExercicioSelecionado(ex);
    try {
      const res = await fetch(`/api/treinos/historico?usuarioId=${usuarioLogado.id}&exercicioId=${ex.id}`);
      if(res.ok) {
        const data = await res.json();
        setHistoricoDados(data);
        setView('HISTORICO');
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const salvarTreino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercicioSelecionado || !usuarioLogado) return;

    const cargaFormatada = parseFloat(carga.replace(',', '.'));

    if(isNaN(cargaFormatada)) {
        alert("Por favor insira um peso válido.");
        return;
    }

    const dataLocal = new Date();
    const dataFormatada = dataLocal.toLocaleDateString('pt-BR').split('/').reverse().join('-');

    const payload = {
      usuarioId: usuarioLogado.id,
      exercicioId: exercicioSelecionado.id,
      cargaKg: cargaFormatada,
      series: parseInt(series),
      repeticoes: parseInt(reps),
      data: dataFormatada,
      observacoes: "Web App"
    };

    try {
      const res = await fetch('/api/treinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const resultado = await res.json();
        setFeedbackTreino(resultado);
        // Atualizar o último treino no estado
        if (exercicioSelecionado) {
          setUltimosTreinos(prev => ({
            ...prev,
            [exercicioSelecionado.id]: resultado
          }));
        }
      } else {
        alert("Erro ao salvar treino.");
      }
    } catch (error) { alert("Erro de conexão."); }
  };

  const salvarNovoExercicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioLogado) return;

    try {
      const res = await fetch('/api/exercicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: novoNome,
            grupoMuscular: novoGrupo,
            observacoes: novaObservacao,
            usuarioId: usuarioLogado.id
        })
      });
      if (res.ok) {
        carregarExercicios(usuarioLogado.id);
        fecharModais();
        setNovoNome('');
        setNovoGrupo('');
        setNovaObservacao('');
      } else {
          alert("Erro: Verifique se já existe este exercício.");
      }
    } catch (error) { alert("Erro ao criar."); }
  };

  const abrirModalTreino = (ex: Exercicio) => {
    setExercicioSelecionado(ex);
    setFeedbackTreino(null);
    setCarga('');
    setView('REGISTRAR_TREINO');
  };

  const fecharModais = () => {
    setView('DASHBOARD');
    setExercicioSelecionado(null);
    setFeedbackTreino(null);
  };

  // --- LÓGICA DE FILTRAGEM ---
  const categorias = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen'];

  const exerciciosFiltrados = filtroAtivo === 'Todos'
    ? exercicios
    : exercicios.filter(ex => ex.grupoMuscular === filtroAtivo);


  // --- RENDERIZAÇÃO ---

  // 1. LOGIN
  if (!usuarioLogado) {
    return (
      <div className="layout-container" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div className="modal-panel" style={{width: '400px', padding: '40px', animation: 'fadeIn 0.5s'}}>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '2rem'}}>
              Iron<span style={{color: 'var(--brand-primary)'}}>Pump</span>
            </h1>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Member Access</p>
          </div>

          <form onSubmit={authMode === 'LOGIN' ? handleLogin : handleRegister}>
            {authMode === 'REGISTER' && (
              <div className="form-group">
                <label>Nome Completo</label>
                <input className="input-tech" required placeholder="Seu nome"
                  value={authNome} onChange={e => setAuthNome(e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input className="input-tech" type="email" required placeholder="email@exemplo.com"
                value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input className="input-tech" type="password" required placeholder="••••••••"
                value={authSenha} onChange={e => setAuthSenha(e.target.value)} />
            </div>

            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '10px'}}>
              {authMode === 'LOGIN' ? 'ENTRAR' : 'CRIAR CONTA'}
            </button>
          </form>

          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <button className="btn-ghost" style={{fontSize: '0.8rem', border: 'none'}}
              onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}>
              {authMode === 'LOGIN' ? 'Criar conta nova' : 'Já possuo conta'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD
  return (
    <div className="layout-container">
      <header className="top-bar">
        <div className="logo-section">
          <h1>Iron<span>Pump</span></h1>
          <div className="subtitle">Training OS</div>
        </div>

        <div className="user-nav">
          <div style={{textAlign: 'right', marginRight: '10px'}}>
            <div style={{fontSize: '0.85rem', fontWeight: 'bold'}}>{usuarioLogado.nome}</div>
            <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>ID: #{usuarioLogado.id}</div>
          </div>
          <button className="btn-ghost" onClick={handleLogout} style={{padding: '8px 15px', fontSize: '0.7rem'}}>
            SAIR
          </button>
          <button className="btn-primary" onClick={() => setView('CRIAR_EXERCICIO')}>
            + Novo Exercício
          </button>
        </div>
      </header>

      {/* --- BARRA DE FILTROS --- */}
      <div style={{
          padding: '20px 40px 0 40px',
          display: 'flex',
          gap: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {categorias.map(cat => (
            <button
                key={cat}
                onClick={() => setFiltroAtivo(cat)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: filtroAtivo === cat ? 'var(--brand-primary)' : '#888',
                    fontWeight: filtroAtivo === cat ? 'bold' : 'normal',
                    paddingBottom: '15px',
                    borderBottom: filtroAtivo === cat ? '2px solid var(--brand-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                }}
            >
                {cat.toUpperCase()}
            </button>
        ))}
      </div>

      <main className="dashboard-grid">
        {exerciciosFiltrados.length === 0 ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#555'}}>
            {exercicios.length === 0 ? (
                <>
                    <h2>Nenhum exercício cadastrado.</h2>
                    <p>Clique em "+ Novo Exercício" para começar.</p>
                </>
            ) : (
                <>
                    <h2>Nenhum exercício de {filtroAtivo} encontrado.</h2>
                    <p>Mude o filtro ou cadastre um novo.</p>
                </>
            )}
          </div>
        ) : (
          exerciciosFiltrados.map(ex => {
            const [corTexto, corFundo] = getCorGrupo(ex.grupoMuscular);
            const ultimoTreino = ultimosTreinos[ex.id];

            return (
              <div key={ex.id} className="exercise-card">
                <div>
                  <span
                    className="tag"
                    style={{
                        backgroundColor: corFundo,
                        color: corTexto,
                        padding: '4px 10px',
                        borderRadius: '12px'
                    }}
                  >
                    {ex.grupoMuscular || 'Geral'}
                  </span>

                  <div className="card-header" style={{marginTop: '15px'}}>
                    <h3>{ex.nome}</h3>
                  </div>

                  {/* PESO ATUAL EM DESTAQUE */}
                  {ultimoTreino ? (
                    <div style={{
                      margin: '15px 0',
                      padding: '12px',
                      background: 'var(--bg-core)',
                      borderRadius: '6px',
                      border: '2px solid var(--brand-primary)'
                    }}>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '5px'
                      }}>
                        Peso Atual
                      </div>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--brand-primary)',
                        fontFamily: "'Courier New', monospace"
                      }}>
                        {ultimoTreino.cargaKg} <span style={{fontSize: '1rem'}}>KG</span>
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '5px'
                      }}>
                        {ultimoTreino.series}×{ultimoTreino.repeticoes} • {formatarData(ultimoTreino.data)}
                      </div>
                    </div>
                  ) : (
                    <p style={{color: '#888', fontSize: '0.9rem', whiteSpace: 'pre-wrap', marginTop: '15px'}}>
                      {ex.observacoes || "Sem treinos registrados ainda."}
                    </p>
                  )}
                </div>
                <div className="card-actions">
                  <button className="btn-ghost" onClick={() => carregarHistorico(ex)}>DADOS</button>
                  <button className="btn-primary" onClick={() => abrirModalTreino(ex)}>TREINAR</button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* MODAL TREINAR */}
      {view === 'REGISTRAR_TREINO' && exercicioSelecionado && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && fecharModais()}>
          <div className="modal-panel">
            {feedbackTreino ? (
              <div className={`result-box ${feedbackTreino.evoluiu ? 'evoluiu' : feedbackTreino.regrediu ? 'regrediu' : 'manteve'}`}>
                <h4 style={{margin:0, opacity: 0.7}}>RESULTADO</h4>
                <div className="status-text">
                  {feedbackTreino.evoluiu ? "Evolução Confirmada" :
                   feedbackTreino.regrediu ? "Redução de Carga" : "Carga Mantida"}
                </div>
                <div className="metric-container">
                   <div>
                      <span className="metric-label">Carga Atual</span>
                      <span className="metric-value">{feedbackTreino.cargaKg}kg</span>
                   </div>
                   {feedbackTreino.diferencaCarga !== undefined && feedbackTreino.diferencaCarga !== 0 && (
                     <div>
                        <span className="metric-label">Diferença</span>
                        <span className="metric-value">
                          {feedbackTreino.diferencaCarga > 0 ? '+' : ''}{feedbackTreino.diferencaCarga}kg
                        </span>
                     </div>
                   )}
                </div>
                <button className="btn-primary" style={{marginTop: '30px', width: '100%'}} onClick={fecharModais}>CONCLUIR</button>
              </div>
            ) : (
              <form onSubmit={salvarTreino}>
                <h2 className="modal-title">Sessão: <span style={{color: 'var(--brand-primary)'}}>{exercicioSelecionado.nome}</span></h2>
                <div className="form-group">
                  <label>Carga Total (KG)</label>
                  <input className="input-tech" type="text" autoFocus required placeholder="Ex: 30.5"
                    value={carga} onChange={e => setCarga(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Séries</label>
                    <input className="input-tech" type="number" value={series} onChange={e => setSeries(e.target.value)} />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Repetições</label>
                    <input className="input-tech" type="number" value={reps} onChange={e => setReps(e.target.value)} />
                  </div>
                </div>
                <div className="form-row" style={{marginTop: '20px'}}>
                  <button type="button" className="btn-ghost" style={{flex: 1}} onClick={fecharModais}>CANCELAR</button>
                  <button type="submit" className="btn-primary" style={{flex: 1}}>SALVAR</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL HISTORICO */}
      {view === 'HISTORICO' && exercicioSelecionado && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && fecharModais()}>
          <div className="modal-panel" style={{maxWidth: '600px'}}>
            <h2 className="modal-title">Histórico: {exercicioSelecionado.nome}</h2>

            {loading ? <p>Carregando...</p> : (
              <>
                {/* CARD DE PESO ATUAL - DESTAQUE */}
                {historicoDados.length > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, var(--brand-primary), #e07b00)',
                    padding: '25px',
                    borderRadius: '8px',
                    marginBottom: '25px',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '8px'
                    }}>
                      Peso Atual
                    </div>
                    <div style={{
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      fontFamily: "'Courier New', monospace",
                      marginBottom: '5px'
                    }}>
                      {historicoDados[0].cargaKg} <span style={{fontSize: '1.5rem'}}>KG</span>
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.9)'
                    }}>
                      {historicoDados[0].series} séries × {historicoDados[0].repeticoes} repetições
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.7)',
                      marginTop: '8px'
                    }}>
                      Último treino: {formatarData(historicoDados[0].data)}
                    </div>
                  </div>
                )}

                {/* LISTA DE HISTÓRICO */}
                <div className="history-list">
                  {historicoDados.length === 0 ? (
                    <p style={{textAlign:'center', padding:'20px'}}>Sem registros.</p>
                  ) : (
                    <>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '15px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid var(--border-subtle)'
                      }}>
                        Histórico Completo
                      </div>
                      {historicoDados.map((log, index) => (
                        <div key={log.id} className="history-item" style={{
                          opacity: index === 0 ? 1 : 0.7
                        }}>
                          <div>
                            <div className="history-data">{log.cargaKg} kg</div>
                            <div className="history-date">{formatarData(log.data)}</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <div style={{fontSize: '0.9rem', color: '#fff'}}>{log.series} × {log.repeticoes}</div>
                            <div className="tag">Séries</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
            <button className="btn-ghost" style={{marginTop: '20px', width: '100%'}} onClick={fecharModais}>FECHAR</button>
          </div>
        </div>
      )}

      {/* MODAL NOVO EXERCICIO */}
      {view === 'CRIAR_EXERCICIO' && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && fecharModais()}>
          <div className="modal-panel">
            <h2 className="modal-title">Adicionar Exercício</h2>
            <form onSubmit={salvarNovoExercicio}>
              <div className="form-group">
                <label>Nome</label>
                <input className="input-tech" placeholder='Ex: Supino Reto' required value={novoNome} onChange={e => setNovoNome(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Grupo</label>
                <select className="input-tech" value={novoGrupo} onChange={e => setNovoGrupo(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option>Peito</option><option>Costas</option><option>Pernas</option>
                  <option>Ombros</option><option>Bíceps</option><option>Tríceps</option><option>Abdômen</option>
                </select>
              </div>
              <div className="form-group">
                <label>Observações (Opcional)</label>
                <input className="input-tech" placeholder="Ex: Drop-set na última"
                    value={novaObservacao} onChange={e => setNovaObservacao(e.target.value)} />
              </div>
              <div className="form-row" style={{marginTop: '20px'}}>
                <button type="button" className="btn-ghost" style={{flex: 1}} onClick={fecharModais}>CANCELAR</button>
                <button type="submit" className="btn-primary" style={{flex: 1}}>CRIAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;