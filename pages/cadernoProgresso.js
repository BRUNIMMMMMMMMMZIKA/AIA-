/**
 * AIA - Caderno de Progresso
 * Gerenciamento de registros, filtros dinâmicos e persistência
 */

let rowToDelete = null;

// Mapeamento de Áreas e Matérias por extenso
const MATERIAS_POR_AREA = {
    'MAT': ['Matemática'],
    'NAT': ['Biologia', 'Física', 'Química'],
    'HUM': ['Filosofia', 'Geografia', 'História', 'Sociologia'],
    'LIN': ['Artes', 'Espanhol', 'Inglês', 'Literatura', 'Língua Portuguesa']
};

document.addEventListener('DOMContentLoaded', () => {
    initCaderno();
});

function initCaderno() {
    loadProgressData();

    // Eventos de Botões de Adição
    document.getElementById('add-questao')?.addEventListener('click', () => addRow('questoes'));
    document.getElementById('add-redacao')?.addEventListener('click', () => addRow('redacoes'));

    // Filtros de Cabeçalho
    const filterBanca = document.getElementById('filter-banca');
    const filterArea = document.getElementById('filter-area');
    const filterMateria = document.getElementById('filter-materia');

    filterBanca?.addEventListener('change', aplicarFiltros);
    filterArea?.addEventListener('change', (e) => {
        atualizarSelectMateria(filterMateria, e.target.value, true);
        aplicarFiltros();
    });
    filterMateria?.addEventListener('change', aplicarFiltros);

    // Lógica para alternar abas e esconder filtros irrelevantes
    const tabs = document.querySelectorAll('button[data-bs-toggle="pill"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const isRedacaoTab = e.target.id === 'pills-redacoes-tab';

            // Container dos filtros de Área e Matéria
            const areaCol = document.getElementById('filter-area')?.closest('.col-md-4');
            const materiaCol = document.getElementById('filter-materia')?.closest('.col-md-4');

            if (areaCol) areaCol.style.display = isRedacaoTab ? 'none' : 'block';
            if (materiaCol) materiaCol.style.display = isRedacaoTab ? 'none' : 'block';

            aplicarFiltros();
        });
    });

    // Modal de Exclusão
    document.getElementById('btnConfirmDelete')?.addEventListener('click', confirmarRemocao);

    // Delegação de eventos para as linhas da tabela (Inputs e Selects)
    document.addEventListener('change', (e) => {
        const el = e.target;

        // Se mudar a área na linha da questão, atualiza o select de matéria daquela linha
        if (el.classList.contains('area-row-select')) {
            const row = el.closest('tr');
            const matSelect = row.querySelector('.materia-row-select');
            atualizarSelectMateria(matSelect, el.value, false);
        }

        // Formatação de cores de status
        if (el.classList.contains('status-select')) {
            updateStatusColor(el);
        }

        // Se for input de nota, recalcula a porcentagem
        if (el.classList.contains('input-nota') || el.classList.contains('banca-select')) {
            const row = el.closest('tr');
            const inputNota = row?.querySelector('.input-nota');
            if (inputNota) calcularPorcentagem(inputNota);
        }

        saveProgressData();
    });
}

/**
 * Atualiza dinamicamente os selects de matéria (seja o filtro do topo ou da linha)
 */
function atualizarSelectMateria(selectElement, area, isFilter = false) {
    if (!selectElement) return;

    selectElement.innerHTML = isFilter ? '<option value="all">Todas as Matérias</option>' : '<option value="">Selecione...</option>';

    if (!area || area === 'all') {
        if (isFilter) selectElement.disabled = true;
        return;
    }

    selectElement.disabled = false;
    const lista = MATERIAS_POR_AREA[area] || [];
    lista.forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat;
        opt.textContent = mat;
        selectElement.appendChild(opt);
    });
}

/**
 * Adiciona uma nova linha resetando filtros para evitar bugs de visibilidade
 */
function addRow(tipo) {
    // Reset de filtros do cabeçalho para garantir que a nova linha apareça
    const filterBanca = document.getElementById('filter-banca');
    const filterArea = document.getElementById('filter-area');
    const filterMateria = document.getElementById('filter-materia');

    if (filterBanca) filterBanca.value = 'all';
    if (filterArea) filterArea.value = 'all';
    if (filterMateria) {
        filterMateria.value = 'all';
        filterMateria.disabled = true;
    }

    // Garante que todas as linhas fiquem visíveis antes da inserção
    document.querySelectorAll('tbody tr').forEach(row => row.style.display = '');

    const tbody = document.querySelector(`#tabela-${tipo} tbody`);
    if (!tbody) return;

    const timestamp = Date.now();
    const rowId = `${tipo}_${timestamp}`;
    let newRow = '';

    if (tipo === 'questoes') {
        newRow = `
            <tr data-row-id="${rowId}">
                <td><input type="date" class="form-control form-control-sm"></td>
                <td>
                    <select class="status-select bg-light w-100 banca-select">
                        <option value="ENEM">ENEM</option>
                        <option value="FUVEST">FUVEST</option>
                        <option value="UNICAMP">UNICAMP</option>
                        <option value="VUNESP">VUNESP</option>
                    </select>
                </td>
                <td>
                    <select class="status-select bg-light w-100 area-row-select">
                        <option value="">Selecionar...</option>
                        <option value="MAT">Matemática</option>
                        <option value="NAT">Natureza</option>
                        <option value="HUM">Humanas</option>
                        <option value="LIN">Linguagens</option>
                    </select>
                </td>
                <td>
                    <select class="status-select bg-light w-100 materia-row-select" disabled>
                        <option value="">Área primeiro...</option>
                    </select>
                </td>
                <td>
                    <select class="status-select bg-light w-100">
                        <option>Interpretação</option>
                        <option>Distração</option>
                        <option>Cálculo</option>
                        <option>Conteúdo</option>
                        <option>Falta de Tempo</option>
                    </select>
                </td>
                <td>
                    <select class="status-select bg-ni w-100">
                        <option value="não">Não</option>
                        <option value="sim">Sim</option>
                    </select>
                </td>
                <td><textarea class="answer-box-table" placeholder="Lição aprendida..."></textarea></td>
                <td class="col-action">
                    <button class="btn-remove" onclick="prepararRemocao('${rowId}')"><i class="bi bi-trash3"></i></button>
                </td>
            </tr>`;
    } else {
        newRow = `
            <tr data-row-id="${rowId}">
                <td><input type="date" class="form-control form-control-sm"></td>
                <td><input type="text" class="form-control form-control-sm" placeholder="Tema..."></td>
                <td>
                    <select class="status-select bg-light w-100 banca-select">
                        <option value="ENEM">ENEM</option>
                        <option value="FUVEST">FUVEST</option>
                        <option value="UNICAMP">UNICAMP</option>
                        <option value="VUNESP">VUNESP</option>
                    </select>
                </td>
                <td><input type="number" class="form-control form-control-sm text-center input-nota" placeholder="0"></td>
                <td class="text-center"><span class="badge bg-secondary">0%</span></td>
                <td><textarea class="answer-box-table" placeholder="Metas..."></textarea></td>
                <td class="col-action">
                    <button class="btn-remove" onclick="prepararRemocao('${rowId}')"><i class="bi bi-trash3"></i></button>
                </td>
            </tr>`;
    }

    tbody.insertAdjacentHTML('afterbegin', newRow);
    saveProgressData();
}

/**
 * Lógica de Filtragem Cruzada
 */
function aplicarFiltros() {
    const bancaAlvo = document.getElementById('filter-banca')?.value || 'all';
    const areaAlvo = document.getElementById('filter-area')?.value || 'all';
    const materiaAlvo = document.getElementById('filter-materia')?.value || 'all';
    const isRedacaoTab = document.getElementById('pills-redacoes-tab').classList.contains('active');

    document.querySelectorAll('tbody tr').forEach(row => {
        const isRedacaoRow = row.dataset.rowId.startsWith('redacoes');

        // Filtra por aba ativa
        if (isRedacaoTab !== isRedacaoRow) {
            row.style.display = 'none';
            return;
        }

        const rBanca = row.querySelector('.banca-select')?.value;
        const rArea = row.querySelector('.area-row-select')?.value;
        const rMateria = row.querySelector('.materia-row-select')?.value;

        const matchBanca = (bancaAlvo === 'all' || rBanca === bancaAlvo);
        const matchArea = (isRedacaoRow || areaAlvo === 'all' || rArea === areaAlvo);
        const matchMateria = (isRedacaoRow || materiaAlvo === 'all' || rMateria === materiaAlvo);

        row.style.display = (matchBanca && matchArea && matchMateria) ? '' : 'none';
    });
}

/**
 * Utilitários: Cores, Cálculos e Exclusão
 */
function updateStatusColor(el) {
    const val = el.value.toLowerCase();
    el.classList.remove('bg-ni', 'bg-concluido');
    if (val === 'não') el.classList.add('bg-ni');
    if (val === 'sim') el.classList.add('bg-concluido');
}

function calcularPorcentagem(input) {
    const row = input.closest('tr');
    const banca = row.querySelector('.banca-select').value;
    const badge = row.querySelector('.badge');
    if (!badge) return;

    let max = 1000;
    if (banca === 'FUVEST') max = 50;
    if (banca === 'UNICAMP') max = 12;
    if (banca === 'VUNESP') max = 11;

    const nota = parseFloat(input.value) || 0;
    const perc = Math.min((nota / max) * 100, 100).toFixed(1);

    badge.innerText = `${perc}%`;
    badge.className = `badge ${perc >= 80 ? 'bg-success' : perc >= 50 ? 'bg-warning' : 'bg-danger'}`;
}

function prepararRemocao(id) {
    rowToDelete = id;
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal'));
    modal.show();
}

function confirmarRemocao() {
    const row = document.querySelector(`tr[data-row-id="${rowToDelete}"]`);
    if (row) {
        row.remove();
        saveProgressData();
        bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
    }
}

/**
 * Persistência (LocalStorage)
 */
function saveProgressData() {
    const data = {
        html_q: document.querySelector('#tabela-questoes tbody').innerHTML,
        html_r: document.querySelector('#tabela-redacoes tbody').innerHTML,
        values: Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
            id: el.id,
            val: el.value,
            class: el.className
        }))
    };
    localStorage.setItem('aia_progresso_final_v1', JSON.stringify(data));
}

function loadProgressData() {
    const saved = localStorage.getItem('aia_progresso_final_v1');
    if (!saved) return;

    const data = JSON.parse(saved);
    if (data.html_q) document.querySelector('#tabela-questoes tbody').innerHTML = data.html_q;
    if (data.html_r) document.querySelector('#tabela-redacoes tbody').innerHTML = data.html_r;

    // Restaura estados visuais de cores e porcentagens
    document.querySelectorAll('.status-select').forEach(updateStatusColor);
    document.querySelectorAll('.input-nota').forEach(calcularPorcentagem);
}