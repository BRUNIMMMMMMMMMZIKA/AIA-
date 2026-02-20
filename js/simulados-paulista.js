/* ==========================================================================
   LÓGICA AIA - VERSÃO FINAL ATUALIZADA (SIM 1, SIM 2, SIM 3)
   ========================================================================== */

const STORAGE_KEY_PAULISTAS = 'aia_simulados_paulistas_data';
let chartsPaulistas = {};

const FACULDADES_PADRAO = ['fuvest', 'unesp', 'unicamp'];
const FACULDADES_MED = ['famema', 'famerp', 'unifesp'];
const FACULDADES = [...FACULDADES_PADRAO, ...FACULDADES_MED];

// Novos nomes dos simulados
const LABELS_SIMULADOS = ['SIM 1', 'SIM 2', 'SIM 3'];

/**
 * 1. MAPEAMENTO DE QUESTÕES FIXAS
 */
const QUESTOES_POR_MATERIA = {
    famema: {
        'BIO': 4, 'QUI': 4, 'TOTAL DISC.': 8,
        'MAT': 10, 'FIS': 5, 'HIST': 5, 'GEO': 5, 'ING': 5, 'LING': 10, 'TOTAL TESTES': 40
    },
    famerp: {
        'BIO': 10, 'QUÍ': 10, 'MAT': 10, 'FÍS': 10, 'HIST': 10, 'GEO': 10, 'ING': 10, 'PORT': 10, 'TOTAL TESTES': 80,
        'BIO (Disc)': 32, 'QUI (Disc)': 24, 'FIS (Disc)': 24, 'TOTAL DISC.': 80
    },
    unifesp: {
        'BIO': 20, 'QUI': 20, 'FIS': 20, 'MAT': 20, 'TOTAL DISC.': 80,
        'ING': 10, 'PORT': 15, 'TOTAL TESTES': 25
    }
};

/**
 * 2. ESTRUTURA DE DISCIPLINAS
 */
const ESTRUTURA_MED = {
    famema: {
        labelSims: LABELS_SIMULADOS,
        disc: ['BIO', 'QUI', 'TOTAL DISC.'],
        obj: ['MAT', 'FIS', 'HIST', 'GEO', 'ING', 'LING', 'TOTAL OBJ.']
    },
    famerp: {
        labelSims: LABELS_SIMULADOS,
        disc: ['BIO (Disc)', 'QUI (Disc)', 'FIS (Disc)', 'TOTAL DISC.'],
        obj: ['BIO', 'QUÍ', 'MAT', 'FÍS', 'HIST', 'GEO', 'ING', 'PORT', 'TOTAL OBJ.']
    },
    unifesp: {
        labelSims: LABELS_SIMULADOS,
        disc: ['BIO', 'QUI', 'FIS', 'MAT', 'TOTAL DISC.'],
        obj: ['ING', 'PORT', 'TOTAL OBJ.']
    }
};

const MATERIAS_PADRAO = ['MAT', 'FIS', 'QUI', 'BIO', 'HIST', 'GEO', 'FIL/SOC', 'LING', 'L. ESTR'];

document.addEventListener('DOMContentLoaded', () => {
    initPaulistas();
});

function initPaulistas() {
    gerarTabelasHibridas();
    configurarAbas();
    configurarInputsPaulistas();
    carregarDadosPaulistas();
    initGraficosPaulistas();
    configurarExclusao();
}

/**
 * 3. GERAÇÃO DINÂMICA
 */
function gerarTabelasHibridas() {
    FACULDADES.forEach(fac => {
        const tbody = document.getElementById(`tbody-${fac}`);
        if (!tbody) return;

        let html = '';
        const isMed = FACULDADES_MED.includes(fac);
        const labels = LABELS_SIMULADOS;

        labels.forEach(label => {
            html += `<tr data-faculdade="${fac}" data-simulado="${label}" class="text-center align-middle">
                <td class="col-simulado fw-bold">${label}</td>`;
            
            if (isMed) {
                const est = ESTRUTURA_MED[fac];
                const ordemMat = [...est.disc, ...est.obj];
                
                ordemMat.forEach(m => {
                    const valorTotal = QUESTOES_POR_MATERIA[fac][m] || 0;
                    const isTotalCol = m.includes('TOTAL');
                    html += `
                        <td class="cell-acerto"><input type="number" class="input-paulista" data-materia="${m}" data-tipo="acerto" ${isTotalCol ? 'readonly' : ''}></td>
                        <td class="cell-total"><input type="number" class="input-paulista" data-materia="${m}" data-tipo="total" value="${valorTotal}" readonly></td>
                        <td class="perc-materia fw-bold" data-materia="${m}">0.0%</td>`;
                });
            } else {
                MATERIAS_PADRAO.forEach(mat => {
                    html += `
                        <td class="cell-acerto"><input type="number" class="input-paulista" data-materia="${mat}" data-tipo="acerto"></td>
                        <td class="cell-total"><input type="number" class="input-paulista" data-materia="${mat}" data-tipo="total"></td>
                        <td class="perc-materia" data-materia="${mat}">0.0%</td>`;
                });
                html += `<td class="total-final-acertos fw-bold bg-light">0</td>
                         <td class="total-final-questoes fw-bold bg-light">0</td>
                         <td class="total-final-perc fw-bold">0.0%</td>`;
            }
            html += `</tr>`;
        });
        tbody.innerHTML = html;
    });
}

function calcularMedicina(row, fac) {
    const est = ESTRUTURA_MED[fac];
    const realizarSoma = (lista, totalId) => {
        let sumAc = 0; let sumTot = 0;
        lista.forEach(m => {
            if (m === totalId) return;
            const ac = parseFloat(row.querySelector(`[data-materia="${m}"][data-tipo="acerto"]`)?.value) || 0;
            const tot = parseFloat(row.querySelector(`[data-materia="${m}"][data-tipo="total"]`)?.value) || 0;
            atualizarEstiloPercentual(row.querySelector(`.perc-materia[data-materia="${m}"]`), ac, tot);
            sumAc += ac; sumTot += tot;
        });
        const tAcInput = row.querySelector(`[data-materia="${totalId}"][data-tipo="acerto"]`);
        if (tAcInput) tAcInput.value = sumAc;
        atualizarEstiloPercentual(row.querySelector(`.perc-materia[data-materia="${totalId}"]`), sumAc, sumTot);
    };
    realizarSoma(est.disc, 'TOTAL DISC.');
    realizarSoma(est.obj, 'TOTAL TESTES');
}

function calcularLinhaPadrao(row) {
    let tAc = 0, tTot = 0;
    MATERIAS_PADRAO.forEach(mat => {
        const ac = parseFloat(row.querySelector(`[data-materia="${mat}"][data-tipo="acerto"]`)?.value) || 0;
        const tot = parseFloat(row.querySelector(`[data-materia="${mat}"][data-tipo="total"]`)?.value) || 0;
        atualizarEstiloPercentual(row.querySelector(`.perc-materia[data-materia="${mat}"]`), ac, tot);
        tAc += ac; tTot += tot;
    });
    const acEl = row.querySelector('.total-final-acertos');
    const totEl = row.querySelector('.total-final-questoes');
    const percEl = row.querySelector('.total-final-perc');
    if(acEl) acEl.textContent = tAc;
    if(totEl) totEl.textContent = tTot;
    if(percEl) {
        const p = tTot > 0 ? (tAc / tTot) * 100 : 0;
        percEl.textContent = p.toFixed(1) + '%';
        percEl.style.backgroundColor = p < 50 ? '#ef4444' : '#05c46b';
    }
}

function atualizarEstiloPercentual(el, ac, tot) {
    if (!el) return;
    const p = tot > 0 ? (ac / tot) * 100 : 0;
    el.textContent = p.toFixed(1) + '%';
    el.style.color = p < 50 ? '#ef4444' : '#05c46b';
}

function configurarInputsPaulistas() {
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('input-paulista')) {
            const row = e.target.closest('tr');
            const fac = row.dataset.faculdade;
            if (FACULDADES_MED.includes(fac)) calcularMedicina(row, fac);
            else calcularLinhaPadrao(row);
            salvarDadosPaulistas();
            atualizarGraficosFaculdade(fac);
        }
    });
}

function salvarDadosPaulistas() {
    const dados = {};
    document.querySelectorAll('.input-paulista').forEach(input => {
        const row = input.closest('tr');
        if (row && !input.readOnly) {
            const chave = `${row.dataset.faculdade}|${row.dataset.simulado}|${input.dataset.materia}|${input.dataset.tipo}`;
            dados[chave] = input.value;
        }
    });
    localStorage.setItem(STORAGE_KEY_PAULISTAS, JSON.stringify(dados));
}

function carregarDadosPaulistas() {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY_PAULISTAS));
    if (!salvo) return;
    Object.entries(salvo).forEach(([key, val]) => {
        const [fac, sim, mat, tipo] = key.split('|');
        const input = document.querySelector(`tr[data-faculdade="${fac}"][data-simulado="${sim}"] .input-paulista[data-materia="${mat}"][data-tipo="${tipo}"]`);
        if (input) input.value = val;
    });
    document.querySelectorAll('tr[data-faculdade]').forEach(row => {
        const fac = row.dataset.faculdade;
        if (FACULDADES_MED.includes(fac)) calcularMedicina(row, fac);
        else calcularLinhaPadrao(row);
    });
}

/**
 * 6. GRÁFICOS (RESIZING E PROPORÇÃO CORRIGIDOS)
 */
function initGraficosPaulistas() {
    FACULDADES.forEach(fac => {
        const cap = fac.charAt(0).toUpperCase() + fac.slice(1);
        if (FACULDADES_MED.includes(fac)) {
            chartsPaulistas[`${fac}Disc`] = criarChart(`chart${cap}Disc`, ESTRUTURA_MED[fac].disc, fac);
            chartsPaulistas[`${fac}Obj`] = criarChart(`chart${cap}Obj`, ESTRUTURA_MED[fac].obj, fac);
        } else {
            chartsPaulistas[fac] = criarChart(`chart${cap}`, [...MATERIAS_PADRAO, 'TOTAL'], fac);
        }
        atualizarGraficosFaculdade(fac);
    });
}

function criarChart(canvasId, labels, fac) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const cores = ['#00b8d4', '#05c46b', '#ff6b6b']; 

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: LABELS_SIMULADOS.map((l, i) => ({ label: l, data: [], backgroundColor: cores[i] }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // CORREÇÃO PARA O GRÁFICO ESTICAR
            layout: {
                padding: { top: 10, bottom: 30, left: 10, right: 10 } // RESPIRO PARA OS LABELS
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
            },
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    ticks: { callback: v => v + '%', font: { size: 10 } } 
                },
                x: { 
                    ticks: { 
                        font: { size: 9, weight: '700' },
                        autoSkip: false // GARANTE QUE TODAS AS MATÉRIAS APAREÇAM
                    } 
                }
            }
        }
    });
}

function atualizarGraficosFaculdade(fac) {
    if (FACULDADES_MED.includes(fac)) {
        atualizarDataset(fac, `${fac}Disc`, ESTRUTURA_MED[fac].disc);
        atualizarDataset(fac, `${fac}Obj`, ESTRUTURA_MED[fac].obj);
    } else {
        atualizarDataset(fac, fac, [...MATERIAS_PADRAO, 'TOTAL']);
    }
}

function atualizarDataset(facId, chartKey, labels) {
    const chart = chartsPaulistas[chartKey];
    if (!chart) return;
    chart.data.datasets.forEach((dataset) => {
        const row = document.querySelector(`tr[data-faculdade="${facId}"][data-simulado="${dataset.label}"]`);
        if (!row) return;
        dataset.data = labels.map(label => {
            const el = (label === 'TOTAL') ? row.querySelector('.total-final-perc') : row.querySelector(`.perc-materia[data-materia="${label}"]`);
            return el ? parseFloat(el.textContent) : 0;
        });
    });
    chart.update();
}

function configurarAbas() {
    document.querySelectorAll('.btn-aba-faculdade').forEach(btn => {
        btn.addEventListener('click', () => {
            const alvo = btn.dataset.faculdade;
            document.querySelectorAll('.btn-aba-faculdade, .aba-conteudo').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const targetEl = document.getElementById(`container-${alvo}`);
            if(targetEl) targetEl.classList.add('active');
            
            // FORÇA O REDIMENSIONAMENTO APÓS A TROCA DE ABA
            setTimeout(() => {
                Object.keys(chartsPaulistas).forEach(k => { 
                    if(chartsPaulistas[k]) {
                        chartsPaulistas[k].resize();
                        chartsPaulistas[k].update();
                    }
                });
            }, 100);
        });
    });
}

function configurarExclusao() {
    const btnConfirmar = document.getElementById('confirmarExclusaoPaulistas');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            localStorage.removeItem(STORAGE_KEY_PAULISTAS);
            location.reload(); 
        });
    }
}