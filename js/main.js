/**
 * COLÉGIO ILHA BRASIL – GERADOR DE PROVAS
 * main.js
 */

// =============================================
// ESTADO GLOBAL
// =============================================
const state = {
  questoes: [],          // array de questões cadastradas
  editandoIndex: null,   // índice da questão sendo editada
  tipo: 'multipla',      // tipo ativo: 'multipla' | 'dissertativa'
  linhasDisserativa: 6,  // quantidade de linhas para dissertativa
  infoProva: {
    disciplina: '',
    periodo: '',
    valor: ''
  }
};

// Altura útil do conteúdo por folha (em px, escala 1:1 do A4 96dpi)
// A4 = 794 x 1123 px; margens: top 110, bottom 60, lr 62
// Cabeçalho ocupa ~105px
const ALTURA_UTIL_PRIMEIRA = 1123 - 110 - 60 - 105;  // ~848
const ALTURA_UTIL_DEMAIS   = 1123 - 110 - 60 - 85;   // ~868

// Altura estimada de cada elemento (px)
const ALTURA_CABECALHO = 105;
const ALTURA_QUESTAO_BASE = 36;    // número + enunciado 1 linha
const ALTURA_POR_LINHA_ENUNCIADO = 14;
const ALTURA_ALTERNATIVA = 20;
const ALTURA_LINHA_RESP = 24;
const ALTURA_MARGEM_QUESTAO = 14;

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  renderFolhas();
  sincronizarInfoProva();
});

// =============================================
// TIPO DE QUESTÃO
// =============================================
function setTipo(tipo) {
  state.tipo = tipo;
  document.getElementById('btn-multipla').classList.toggle('active', tipo === 'multipla');
  document.getElementById('btn-dissertativa').classList.toggle('active', tipo === 'dissertativa');
  document.getElementById('alternativas-box').style.display = tipo === 'multipla' ? 'block' : 'none';
  document.getElementById('linhas-box').style.display = tipo === 'dissertativa' ? 'block' : 'none';
}

function changeLinhas(delta) {
  state.linhasDisserativa = Math.max(2, Math.min(20, state.linhasDisserativa + delta));
  document.getElementById('linhas-count').textContent = state.linhasDisserativa;
}

// =============================================
// SINCRONIZAR INFO DA PROVA
// =============================================
function sincronizarInfoProva() {
  ['disciplina', 'periodo', 'valor'].forEach(campo => {
    const el = document.getElementById(`inp-${campo}`);
    el.addEventListener('input', () => {
      state.infoProva[campo] = el.value;
      renderFolhas();
    });
  });
}

// =============================================
// ADICIONAR / EDITAR QUESTÃO
// =============================================
function addOuEditarQuestao() {
  const enunciado = document.getElementById('inp-enunciado').value.trim();
  if (!enunciado) { alert('Digite o enunciado da questão.'); return; }

  const questao = {
    tipo: state.tipo,
    enunciado,
    valor: document.getElementById('inp-q-valor').value.trim() || '',
  };

  if (state.tipo === 'multipla') {
    const alts = ['a','b','c','d','e'].map(l => document.getElementById(`alt-${l}`).value.trim()).filter(Boolean);
    if (alts.length < 2) { alert('Adicione pelo menos 2 alternativas.'); return; }
    questao.alternativas = alts;
  } else {
    questao.linhas = state.linhasDisserativa;
  }

  if (state.editandoIndex !== null) {
    state.questoes[state.editandoIndex] = questao;
    state.editandoIndex = null;
    document.getElementById('btn-add-questao').textContent = '➕ Adicionar Questão';
  } else {
    state.questoes.push(questao);
  }

  limparFormulario();
  renderListaSidebar();
  renderFolhas();
}

// =============================================
// EDITAR
// =============================================
function editarQuestao(index) {
  const q = state.questoes[index];
  state.editandoIndex = index;
  state.tipo = q.tipo;

  setTipo(q.tipo);
  document.getElementById('inp-enunciado').value = q.enunciado;
  document.getElementById('inp-q-valor').value = q.valor || '';

  if (q.tipo === 'multipla') {
    ['a','b','c','d','e'].forEach((l, i) => {
      document.getElementById(`alt-${l}`).value = q.alternativas[i] || '';
    });
  } else {
    state.linhasDisserativa = q.linhas;
    document.getElementById('linhas-count').textContent = q.linhas;
  }

  document.getElementById('btn-add-questao').textContent = '💾 Salvar Edição';
  renderListaSidebar();

  // Scroll pro topo do sidebar
  document.querySelector('.sidebar').scrollTop = 0;
}

// =============================================
// EXCLUIR
// =============================================
function excluirQuestao(index) {
  if (!confirm(`Excluir a questão ${index + 1}?`)) return;
  state.questoes.splice(index, 1);
  if (state.editandoIndex === index) {
    state.editandoIndex = null;
    limparFormulario();
    document.getElementById('btn-add-questao').textContent = '➕ Adicionar Questão';
  }
  renderListaSidebar();
  renderFolhas();
}

// =============================================
// LIMPAR FORMULÁRIO
// =============================================
function limparFormulario() {
  document.getElementById('inp-enunciado').value = '';
  document.getElementById('inp-q-valor').value = '';
  ['a','b','c','d','e'].forEach(l => document.getElementById(`alt-${l}`).value = '');
  state.linhasDisserativa = 6;
  document.getElementById('linhas-count').textContent = 6;
}

// =============================================
// RENDER LISTA SIDEBAR
// =============================================
function renderListaSidebar() {
  const lista = document.getElementById('lista-questoes');
  const total = document.getElementById('total-questoes');
  total.textContent = state.questoes.length;
  lista.innerHTML = '';

  if (state.questoes.length === 0) {
    lista.innerHTML = '<p style="font-size:0.8rem;color:#aaa;text-align:center;padding:10px 0;">Nenhuma questão ainda.</p>';
    return;
  }

  state.questoes.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'q-item' + (state.editandoIndex === i ? ' editando' : '');
    div.innerHTML = `
      <div class="q-num">${i + 1}</div>
      <div class="q-info">
        <div class="q-tipo">${q.tipo === 'multipla' ? 'Múltipla Escolha' : 'Dissertativa'}</div>
        <div class="q-texto">${q.enunciado}</div>
      </div>
      <div class="q-acoes">
        <button class="q-btn q-btn-edit" onclick="editarQuestao(${i})">✏️</button>
        <button class="q-btn q-btn-del" onclick="excluirQuestao(${i})">🗑️</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

// =============================================
// ESTIMAR ALTURA DE UMA QUESTÃO (em px)
// =============================================
function estimarAltura(q, numero) {
  const linhasEnunciado = Math.ceil(q.enunciado.length / 72) || 1;
  let h = ALTURA_QUESTAO_BASE + (linhasEnunciado - 1) * ALTURA_POR_LINHA_ENUNCIADO;

  if (q.tipo === 'multipla') {
    q.alternativas.forEach(alt => {
      const linhasAlt = Math.ceil(alt.length / 68) || 1;
      h += ALTURA_ALTERNATIVA * linhasAlt;
    });
  } else {
    h += q.linhas * ALTURA_LINHA_RESP + 6;
  }

  h += ALTURA_MARGEM_QUESTAO;
  return h;
}

// =============================================
// DISTRIBUIR QUESTÕES EM FOLHAS
// =============================================
function distribuirEmFolhas() {
  const folhas = [];
  let folhaAtual = [];
  let alturaUsada = 0;
  let primFolha = true;

  state.questoes.forEach((q, i) => {
    const hq = estimarAltura(q, i + 1);
    const limite = primFolha ? ALTURA_UTIL_PRIMEIRA : ALTURA_UTIL_DEMAIS;

    if (alturaUsada + hq > limite && folhaAtual.length > 0) {
      folhas.push(folhaAtual);
      folhaAtual = [];
      alturaUsada = 0;
      primFolha = false;
    }

    folhaAtual.push({ questao: q, numero: i + 1 });
    alturaUsada += hq;
  });

  if (folhaAtual.length > 0 || folhas.length === 0) {
    folhas.push(folhaAtual);
  }

  return folhas;
}

// =============================================
// RENDER HTML DE UMA QUESTÃO
// =============================================
function htmlQuestao(q, numero) {
  const valorBadge = q.valor ? `<span class="questao-valor-badge">${q.valor} pt</span>` : '';

  let corpo = '';
  if (q.tipo === 'multipla') {
    const alts = q.alternativas.map((alt, idx) => {
      const letra = ['A','B','C','D','E'][idx];
      return `<div class="alt-linha"><span class="alt-marker">${letra})</span> ${escapeHtml(alt)}</div>`;
    }).join('');
    corpo = `<div class="alternativas-lista">${alts}</div>`;
  } else {
    const linhas = Array.from({ length: q.linhas }, () => '<div class="linha-resp"></div>').join('');
    corpo = `<div class="linhas-resposta">${linhas}</div>`;
  }

  return `
    <div class="questao-bloco">
      <div class="questao-numero">
        Questão ${numero} ${valorBadge}
      </div>
      <div class="questao-enunciado">${escapeHtml(q.enunciado)}</div>
      ${corpo}
    </div>
  `;
}

// =============================================
// RENDER CABEÇALHO DA FOLHA
// =============================================
function htmlCabecalho(numFolha, totalFolhas) {
  const disc = escapeHtml(state.infoProva.disciplina || 'Disciplina');
  const per  = escapeHtml(state.infoProva.periodo    || '');
  const val  = escapeHtml(state.infoProva.valor      || '');

  return `
    <div class="cabecalho-prova">
      <div class="cabecalho-info-escola">
        <span class="cabecalho-disciplina">${disc}</span>
        <div style="display:flex;gap:8px;align-items:center;">
          ${per ? `<span class="cabecalho-periodo">${per}</span>` : ''}
          ${val ? `<span class="cabecalho-valor">${val}</span>` : ''}
        </div>
      </div>
      <div class="linha-identificacao">
        <span class="campo-id"><strong>NOME DO ALUNO:</strong> _______________________________</span>
        <span class="campo-id"><strong>SÉRIE:</strong> _______________</span>
      </div>
      <div class="linha-identificacao-2" style="margin-top:5px;">
        <span class="campo-id"><strong>NOME DO PROFESSOR:</strong> _______________________________________</span>
      </div>
    </div>
  `;
}

// =============================================
// RENDER TODAS AS FOLHAS
// =============================================
function renderFolhas() {
  const container = document.getElementById('folhas-container');
  container.innerHTML = '';

  const folhas = distribuirEmFolhas();

  folhas.forEach((questoesDaFolha, fi) => {
    const folhaEl = document.createElement('div');
    folhaEl.className = 'folha';
    folhaEl.id = `folha-${fi}`;

    // Fundo (usa o PDF como imagem de fundo via CSS)
    folhaEl.innerHTML = `
      <img class="folha-bg" src="assets/bg_folha-1.png" alt=""/>
      <div class="folha-conteudo">
        ${htmlCabecalho(fi + 1, folhas.length)}
        ${questoesDaFolha.length === 0
          ? '<div class="empty-state"><p>Adicione questões usando o painel lateral ←</p></div>'
          : questoesDaFolha.map(({questao, numero}) => htmlQuestao(questao, numero)).join('')
        }
      </div>
      <div class="folha-rodape">
        <span>Colégio Ilha Brasil</span>
        <span>Folha ${fi + 1} de ${folhas.length}</span>
      </div>
    `;

    container.appendChild(folhaEl);
  });

  // Responsividade: escalar folhas em telas pequenas
  escalarFolhas();
}

// =============================================
// ESCALAR FOLHAS EM TELAS PEQUENAS
// =============================================
function escalarFolhas() {
  const folhas = document.querySelectorAll('.folha');
  const previewW = document.getElementById('preview-area').clientWidth - 48;
  const A4W = 794;

  folhas.forEach(folha => {
    if (previewW < A4W) {
      const scale = previewW / A4W;
      folha.style.width = '794px';
      folha.style.height = '1123px';
      folha.style.transform = `scale(${scale})`;
      folha.style.transformOrigin = 'top center';
      folha.style.marginBottom = `-${(1123 * (1 - scale))}px`;
    } else {
      folha.style.width = '794px';
      folha.style.height = '1123px';
      folha.style.transform = '';
      folha.style.marginBottom = '';
    }
  });
}

window.addEventListener('resize', escalarFolhas);

// =============================================
// EXPORTAR PDF
// =============================================
async function exportarPDF() {
  const folhas = document.querySelectorAll('.folha');
  if (folhas.length === 0) { alert('Nada para exportar.'); return; }

  const btn = document.querySelector('.btn-export');
  btn.textContent = '⏳ Gerando PDF...';
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const A4_W_MM = 210;
    const A4_H_MM = 297;

    for (let i = 0; i < folhas.length; i++) {
      const folha = folhas[i];

      // Salvar transform para renderizar em tamanho real
      const prevTransform = folha.style.transform;
      const prevWidth = folha.style.width;
      const prevHeight = folha.style.height;
      folha.style.transform = 'none';
      folha.style.width = '794px';
      folha.style.height = '1123px';

      const canvas = await html2canvas(folha, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false
      });

      // Restaurar
      folha.style.transform = prevTransform;
      folha.style.width = prevWidth;
      folha.style.height = prevHeight;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
    }

    const disc = state.infoProva.disciplina || 'Prova';
    pdf.save(`${disc.replace(/\s+/g, '_')}_Ilha_Brasil.pdf`);

  } catch (err) {
    console.error(err);
    alert('Erro ao gerar PDF. Verifique o console.');
  } finally {
    btn.textContent = '⬇️ Exportar PDF';
    btn.disabled = false;
  }
}

// =============================================
// MOBILE SIDEBAR TOGGLE
// =============================================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// =============================================
// MODAL
// =============================================
function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal-edicao').classList.remove('open');
}

// =============================================
// UTILITÁRIO
// =============================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Init render
renderListaSidebar();
