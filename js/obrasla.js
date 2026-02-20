/* ==========================================================================
   AIA - GESTÃO DE CONTEÚDO CULTURAL (LITERÁRIA & AUDIOVISUAL)
   ========================================================================== */

let idParaExcluir = null;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o banco de dados se vazio
    if (!localStorage.getItem('aia_conteudos')) {
        localStorage.setItem('aia_conteudos', JSON.stringify([]));
    }
    
    // Configurações Iniciais
    renderizarConteudos();
    initFormAdicionar();
    initFormCapitulo();
    initToggleModalFields();
    initModalExclusao();

    // Eventos de Filtro
    const filterTipo = document.getElementById('filterTipo');
    const filterBanca = document.getElementById('filterBanca');
    if (filterTipo) filterTipo.addEventListener('change', filtrarTudo);
    if (filterBanca) filterBanca.addEventListener('change', filtrarTudo);
});

/**
 * Filtra os conteúdos e BLOQUEIA o seletor de bancas para Audiovisuais
 */
function filtrarTudo() {
    const filterTipo = document.getElementById('filterTipo');
    const filterBanca = document.getElementById('filterBanca');
    
    if (!filterTipo || !filterBanca) return;

    const tipoSelecionado = filterTipo.value;
    const bancaSelecionada = filterBanca.value.toUpperCase();

    // Bloqueio do Filtro de Banca
    if (tipoSelecionado === 'audiovisual') {
        filterBanca.disabled = true;
        filterBanca.classList.add('bg-light', 'text-muted');
        filterBanca.value = 'TODOS'; 
    } else {
        filterBanca.disabled = false;
        filterBanca.classList.remove('bg-light', 'text-muted');
    }

    // Alternância de Seções
    document.getElementById('section-literaria').style.display = (tipoSelecionado === 'literaria') ? 'block' : 'none';
    document.getElementById('section-audiovisual').style.display = (tipoSelecionado === 'audiovisual') ? 'block' : 'none';

    // Filtro dos Itens
    document.querySelectorAll('.obra-item').forEach(item => {
        const itemTipo = item.getAttribute('data-tipo');
        const itemBanca = item.getAttribute('data-banca') || '';
        const matchTipo = (itemTipo === tipoSelecionado);
        const matchBanca = (tipoSelecionado === 'audiovisual' || bancaSelecionada === 'TODOS' || itemBanca === bancaSelecionada);

        item.style.display = (matchTipo && matchBanca) ? '' : 'none';
    });
}

/**
 * Gerencia campos do Modal (Iniciando com Literária como prioridade)
 */
function initToggleModalFields() {
    const selectTipo = document.getElementById('addTipo');
    const camposLit = document.querySelector('.campos-literaria');
    const camposAudio = document.querySelector('.campos-audiovisual');
    const labelAutor = document.getElementById('labelAutor');
    const inputPeriodo = document.getElementById('addPeriodo');
    const inputAulas = document.getElementById('addDataAulas');

    if (!selectTipo) return;

    const alternar = () => {
        if (selectTipo.value === 'literaria') {
            if (camposLit) camposLit.style.display = 'flex';
            if (camposAudio) camposAudio.style.display = 'none';
            labelAutor.innerText = 'Autor';
            if(inputPeriodo) inputPeriodo.required = true;
            if(inputAulas) inputAulas.required = true;
        } else {
            if (camposLit) camposLit.style.display = 'none';
            if (camposAudio) camposAudio.style.display = 'flex';
            labelAutor.innerText = 'Diretor / Autor';
            if(inputPeriodo) inputPeriodo.required = false;
            if(inputAulas) inputAulas.required = false;
        }
    };

    selectTipo.addEventListener('change', alternar);
    alternar(); 
}

/**
 * Renderiza os dados salvos
 */
function renderizarConteudos() {
    const secaoLit = document.getElementById('section-literaria');
    const secaoAudio = document.getElementById('section-audiovisual');
    const conteudos = JSON.parse(localStorage.getItem('aia_conteudos')) || [];

    secaoLit.innerHTML = '';
    secaoAudio.innerHTML = `
        <div class="table-responsive shadow-sm rounded-3">
            <table class="table table-hover align-middle mb-0 bg-white">
                <thead class="bg-light">
                    <tr>
                        <th style="width: 15%;">TÍTULO / AUTOR</th>
                        <th style="width: 10%;">TIPO</th>
                        <th style="width: 10%;">LOCAL</th>
                        <th style="width: 12%;">ÁREA</th>
                        <th style="width: 12%;">REFERÊNCIA</th>
                        <th style="width: 15%;">COMO USAR</th>
                        <th style="width: 8%; text-align: center;">Visto</th>
                        <th style="width: 12%;">OBSERVAÇÃO</th>
                        <th style="width: 5%;"></th>
                    </tr>
                </thead>
                <tbody id="body-audiovisual"></tbody>
            </table>
        </div>`;

    const bodyAudio = document.getElementById('body-audiovisual');

    conteudos.forEach(item => {
        if (item.tipo === 'literaria') {
            const cardHTML = `
                <div class="obra-item lesson-card mb-4" data-tipo="literaria" data-banca="${item.banca || ''}" id="card-${item.id}">
                    <div class="lesson-header" onclick="toggleCard(this)">
                        <div class="d-flex align-items-center">
                            <div class="tab-nav me-3"><span class="ta">${item.banca || 'LIT'}</span></div>
                            <div>
                                <h5 class="mb-0 fw-bold">${item.titulo}</h5>
                                <small class="text-muted">${item.autor}</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-3">
                            <select class="status-select status-${item.status}" onclick="event.stopPropagation()" onchange="atualizarStatus(this, '${item.id}')">
                                <option value="ni" ${item.status === 'ni' ? 'selected' : ''}>Não Iniciado</option>
                                <option value="i" ${item.status === 'i' ? 'selected' : ''}>Em Estudo</option>
                                <option value="c" ${item.status === 'c' ? 'selected' : ''}>Concluído</option>
                            </select>
                            <button class="btn-delete" onclick="prepararExclusao(event, '${item.id}')"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                    <div class="lesson-content">
                        <div class="p-4 pt-0">
                            <div class="row info-cronograma mb-3 py-2 px-3 rounded shadow-sm bg-light">
                                <div class="col-md-6"><small class="fw-bold d-block text-muted">Sugestão:</small>${item.periodoLeitura || '---'}</div>
                                <div class="col-md-6"><small class="fw-bold d-block text-muted">Aulas:</small>${item.dataAulas || '---'}</div>
                            </div>
                            <table class="table table-sm align-middle">
                                <thead class="table-light"><tr style="font-size: 0.75rem"><th>CAPÍTULO</th><th style="width: 120px">AULA</th><th>OBS</th><th style="width: 40px"></th></tr></thead>
                                <tbody>
                                    ${(item.capitulos || []).map((cap, idx) => `
                                        <tr>
                                            <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${cap.nome}" onchange="editarCapituloDireto('${item.id}', ${idx}, 'nome', this.value)"></td>
                                            <td>${cap.video ? `<a href="${cap.video}" target="_blank" class="small text-decoration-none"><i class="bi bi-play-circle"></i> Ver</a>` : '<span class="text-muted">---</span>'}</td>
                                            <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${cap.obs || ''}" onchange="editarCapituloDireto('${item.id}', ${idx}, 'obs', this.value)"></td>
                                            <td><button class="btn btn-sm text-danger" onclick="removerCapitulo('${item.id}', ${idx})"><i class="bi bi-x-circle"></i></button></td>
                                        </tr>`).join('')}
                                </tbody>
                            </table>
                            <button class="btn btn-sm btn-outline-secondary w-100 mb-4 py-2" onclick="abrirModalCapitulo('${item.id}')"><i class="bi bi-plus-lg"></i> Adicionar Capítulo</button>
                            <label class="label-style mt-2">Anotações / Repertório</label>
                            <textarea class="form-control shadow-sm p-3" rows="3" onkeyup="salvarAnotacao('${item.id}', this.value)">${item.anotacao || ''}</textarea>
                        </div>
                    </div>
                </div>`;
            secaoLit.insertAdjacentHTML('beforeend', cardHTML);
        } else {
            const rowHTML = `
                <tr class="obra-item" data-tipo="audiovisual">
                    <td class="fw-bold">${item.titulo} <br> <small class="text-muted fw-normal">${item.autor}</small></td>
                    <td>${item.categoriaAudio || '---'}</td>
                    <td><small>${item.ondeEncontrar || '---'}</small></td>
                    <td><span class="badge bg-light text-dark border">${item.areaConhecimento || '---'}</span></td>
                    <td><small>${item.referenciaCultural || '---'}</small></td>
                    <td><div class="small text-muted text-truncate" style="max-width: 150px;">${item.comoUsarRedacao || '---'}</div></td>
                    <td>
                        <select class="status-select status-${item.status}" onchange="atualizarStatus(this, '${item.id}')">
                            <option value="ni" ${item.status === 'ni' ? 'selected' : ''}>NÃO</option>
                            <option value="c" ${item.status === 'c' ? 'selected' : ''}>SIM</option>
                        </select>
                    </td>
                    <td><textarea class="form-control form-control-sm border-0 bg-light" rows="1" onchange="salvarAnotacao('${item.id}', this.value)">${item.anotacao || ''}</textarea></td>
                    <td><button class="btn-delete" onclick="prepararExclusao(event, '${item.id}')"><i class="bi bi-trash"></i></button></td>
                </tr>`;
            bodyAudio.insertAdjacentHTML('beforeend', rowHTML);
        }
    });
    filtrarTudo();
}

/**
 * Salvar novo conteúdo
 */
function initFormAdicionar() {
    const form = document.getElementById('formAdicionar');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const tipo = document.getElementById('addTipo').value;
        const novoItem = {
            id: 'id_' + Date.now(),
            tipo: tipo,
            titulo: document.getElementById('addTitulo').value,
            autor: document.getElementById('addAutor').value,
            status: 'ni',
            anotacao: '',
            banca: document.getElementById('addBanca')?.value.toUpperCase() || '',
            periodoLeitura: document.getElementById('addPeriodo')?.value || '',
            dataAulas: document.getElementById('addDataAulas')?.value || '',
            capitulos: [],
            categoriaAudio: document.getElementById('addTipoAudio')?.value || '',
            ondeEncontrar: document.getElementById('addLocal')?.value || '',
            areaConhecimento: document.getElementById('addArea')?.value || '',
            referenciaCultural: document.getElementById('addReferencia')?.value || '',
            comoUsarRedacao: document.getElementById('addComoUsar')?.value || ''
        };
        const conteudos = JSON.parse(localStorage.getItem('aia_conteudos')) || [];
        conteudos.push(novoItem);
        localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
        renderizarConteudos();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalAdicionar')).hide();
        initToggleModalFields();
    });
}

/**
 * Funções Auxiliares
 */
function toggleCard(header) {
    header.parentElement.classList.toggle('open');
}

function salvarAnotacao(id, texto) {
    let conteudos = JSON.parse(localStorage.getItem('aia_conteudos'));
    const index = conteudos.findIndex(c => c.id === id);
    if (index !== -1) {
        conteudos[index].anotacao = texto;
        localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
    }
}

function atualizarStatus(select, id) {
    let conteudos = JSON.parse(localStorage.getItem('aia_conteudos'));
    const index = conteudos.findIndex(c => c.id === id);
    if (index !== -1) {
        conteudos[index].status = select.value;
        localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
        select.className = `status-select status-${select.value}`;
    }
}

// Lógica de Exclusão
function initModalExclusao() {
    const btnSim = document.querySelector('.btn-confirm-delete');
    if (btnSim) {
        btnSim.addEventListener('click', function() {
            if (idParaExcluir) {
                let conteudos = JSON.parse(localStorage.getItem('aia_conteudos'));
                conteudos = conteudos.filter(c => c.id !== idParaExcluir);
                localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
                idParaExcluir = null;
                renderizarConteudos();
                bootstrap.Modal.getInstance(document.getElementById('modalConfirmarExclusao')).hide();
            }
        });
    }
}

function prepararExclusao(event, id) {
    event.stopPropagation();
    idParaExcluir = id;
    new bootstrap.Modal(document.getElementById('modalConfirmarExclusao')).show();
}

// Lógica de Capítulos
function abrirModalCapitulo(idObra) {
    const form = document.getElementById('formAdicionarCapitulo');
    if (form) form.reset();
    document.getElementById('capituloObraId').value = idObra;
    new bootstrap.Modal(document.getElementById('modalAdicionarCapitulo')).show();
}

function initFormCapitulo() {
    const form = document.getElementById('formAdicionarCapitulo');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const idObra = document.getElementById('capituloObraId').value;
        let conteudos = JSON.parse(localStorage.getItem('aia_conteudos'));
        const idx = conteudos.findIndex(c => c.id === idObra);
        if (idx !== -1) {
            if (!conteudos[idx].capitulos) conteudos[idx].capitulos = [];
            conteudos[idx].capitulos.push({
                nome: document.getElementById('addCapituloNome').value,
                video: document.getElementById('addCapituloVideo').value,
                obs: document.getElementById('addCapituloObs').value
            });
            localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
            bootstrap.Modal.getInstance(document.getElementById('modalAdicionarCapitulo')).hide();
            renderizarConteudos();
            document.getElementById(`card-${idObra}`).classList.add('open');
        }
    });
}

function editarCapituloDireto(id, capIdx, campo, valor) {
    let conteudos = JSON.parse(localStorage.getItem('aia_conteudos'));
    const idx = conteudos.findIndex(c => c.id === id);
    if (idx !== -1) {
        conteudos[idx].capitulos[capIdx][campo] = valor;
        localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
    }
}

function removerCapitulo(idObra, capIdx) {
    let conteudos = JSON.parse(localStorage.getItem('aia_conteudos'));
    const idx = conteudos.findIndex(c => c.id === idObra);
    if (idx !== -1) {
        conteudos[idx].capitulos.splice(capIdx, 1);
        localStorage.setItem('aia_conteudos', JSON.stringify(conteudos));
        renderizarConteudos();
        document.getElementById(`card-${idObra}`).classList.add('open');
    }
}