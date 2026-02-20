/* ==========================================================================
   AIA - GERENCIADOR DE MENTORIA (LÓGICA COMPLETA)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. ESTADO DOS DADOS E REFERÊNCIAS TEMPORAIS
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    let encontros = JSON.parse(localStorage.getItem('aia_encontros')) || [
        { id: 1, tipo: 'definido', titulo: 'Estruturação da Rotina de Estudos', data: '2026-02-16', concluido: false, obsProf: '', obsAluno: '', ajustes: '', metas: '' },
        { id: 2, tipo: 'definido', titulo: 'Análise de resultados e ajustes na rotina', data: '2026-02-23', concluido: false, obsProf: '', obsAluno: '', ajustes: '', metas: '' },
        { id: 3, tipo: 'extra', titulo: 'Pós Revisão', data: '2026-02-16', concluido: false, obsProf: '', obsAluno: '', ajustes: '', metas: '' }
    ];

    let idEdicao = null;
    let idParaExcluir = null; // Armazena temporariamente o ID que será excluído via modal

    // 2. ELEMENTOS DO DOM
    const containers = {
        todos: document.getElementById('container-todos'),
        definidos: document.getElementById('container-definidos'),
        extras: document.getElementById('container-extras')
    };
    const tabelaBody = document.getElementById('tabela-status-body');
    const formNovoEncontro = document.getElementById('form-novo-encontro');
    const template = document.getElementById('lesson-template');
    
    // Modais
    const modalAgendarElement = document.getElementById('modalAgendar');
    const bsModalAgendar = new bootstrap.Modal(modalAgendarElement);
    
    const modalExcluirElement = document.getElementById('modalConfirmarExclusao');
    const bsModalExcluir = new bootstrap.Modal(modalExcluirElement);
    const btnConfirmarExcluir = document.getElementById('btnConfirmarExcluir');

    /* ==========================================================================
       FUNÇÕES DE RENDERIZAÇÃO
       ========================================================================== */

    function renderizar() {
        const abaAtiva = document.querySelector('#pills-tab .nav-link.active');
        const filtroId = abaAtiva ? abaAtiva.id : 'pills-todos-tab';

        // Limpar visualizações
        Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });
        if(tabelaBody) tabelaBody.innerHTML = '';

        let ordemDefinido = 1;
        let ordemExtra = 1;

        // Ordenar por data (mais antigo primeiro)
        const listaOrdenada = [...encontros].sort((a, b) => new Date(a.data) - new Date(b.data));

        listaOrdenada.forEach(encontro => {
            let ordemExibicao = (encontro.tipo === 'definido') ? ordemDefinido++ : ordemExtra++;

            const mostrarDefinidos = (filtroId === 'pills-todos-tab' || filtroId === 'pills-definidos-tab') && encontro.tipo === 'definido';
            const mostrarExtras = (filtroId === 'pills-todos-tab' || filtroId === 'pills-extras-tab') && encontro.tipo === 'extra';

            if (mostrarDefinidos || mostrarExtras) {
                adicionarLinhaTabela(encontro, ordemExibicao);
                const cardElement = criarCardElement(encontro, ordemExibicao);
                
                if (encontro.tipo === 'definido' && containers.definidos) {
                    containers.definidos.appendChild(cardElement.cloneNode(true));
                } else if (encontro.tipo === 'extra' && containers.extras) {
                    containers.extras.appendChild(cardElement.cloneNode(true));
                }

                if(containers.todos) {
                    containers.todos.appendChild(cardElement.cloneNode(true));
                }
            }
        });

        vincularEventos();
        salvarLocal();
    }

    function criarCardElement(encontro, ordem) {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.lesson-card');
        
        card.dataset.id = encontro.id;
        card.dataset.tipo = encontro.tipo;
        
        if (compararData(encontro.data, hoje) && !encontro.concluido) {
            card.style.borderLeftWidth = "10px";
            card.style.backgroundColor = "#f0f7ff";
        }

        clone.querySelector('.num-encontro').textContent = String(ordem).padStart(2, '0');
        clone.querySelector('.titulo-texto').textContent = encontro.titulo;
        clone.querySelector('.date-text').textContent = formatarData(encontro.data);
        
        clone.querySelector('.txt-notas-professor').value = encontro.obsProf || '';
        clone.querySelector('.txt-notas-aluno').value = encontro.obsAluno || '';
        clone.querySelector('.txt-ajustes').value = encontro.ajustes || '';
        clone.querySelector('.txt-metas-longo').value = encontro.metas || '';
        
        const chk = clone.querySelector('.chk-concluido');
        chk.checked = encontro.concluido;
        if (encontro.concluido) card.classList.add('concluido-estilo');

        return card;
    }

    function adicionarLinhaTabela(encontro, ordem) {
        if(!tabelaBody) return;
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        
        const ehHoje = compararData(encontro.data, hoje);
        const ehAmanha = compararData(encontro.data, amanha);

        if (ehHoje) tr.classList.add('table-primary'); 
        else if (ehAmanha) tr.classList.add('table-warning');

        const badgeTipo = encontro.tipo === 'definido' 
            ? `<span class="badge-def-azul">DEF</span>` 
            : `<span class="badge-extra-verde">EXTRA</span>`;

        const statusBadge = encontro.concluido 
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle">Concluído</span>`
            : `<span class="badge bg-light text-muted border">Pendente</span>`;

        const tagTempo = ehHoje ? '<span class="badge bg-primary ms-2">HOJE</span>' : 
                         ehAmanha ? '<span class="badge bg-warning text-dark ms-2">AMANHÃ</span>' : '';

        tr.innerHTML = `
            <td class="text-center">${statusBadge}</td>
            <td>${formatarData(encontro.data)} ${tagTempo}</td>
            <td class="fw-semibold">${badgeTipo} ENCONTRO ${ordem} - ${encontro.titulo}</td>
        `;

        tr.onclick = () => irParaCard(encontro);
        tabelaBody.appendChild(tr);
    }

    /* ==========================================================================
       AÇÕES E EVENTOS
       ========================================================================== */

    function vincularEventos() {
        // Abrir/Fechar Accordion
        document.querySelectorAll('.lesson-header').forEach(header => {
            header.onclick = (e) => {
                if (e.target.closest('.btn-editar, .btn-remover, .chk-concluido')) return;
                header.parentElement.classList.toggle('open');
            };
        });

        // Auto-save e Status
        document.querySelectorAll('.answer-box, .chk-concluido').forEach(el => {
            el.onchange = (e) => {
                const card = e.target.closest('.lesson-card');
                const id = card.dataset.id;
                const index = encontros.findIndex(enc => enc.id == id);
                
                if (e.target.type === 'checkbox') {
                    encontros[index].concluido = e.target.checked;
                    renderizar();
                } else {
                    const mappedField = {
                        'txt-notas-professor': 'obsProf',
                        'txt-notas-aluno': 'obsAluno',
                        'txt-ajustes': 'ajustes',
                        'txt-metas-longo': 'metas'
                    };
                    const fieldClass = [...e.target.classList].find(c => mappedField[c]);
                    if (fieldClass) encontros[index][mappedField[fieldClass]] = e.target.value;
                    salvarLocal();
                }
            };
        });

        // Editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.closest('.lesson-card').dataset.id;
                const enc = encontros.find(en => en.id == id);
                idEdicao = id;
                document.getElementById('modal-titulo').value = enc.titulo;
                document.getElementById('modal-data').value = enc.data;
                document.getElementById('modal-tipo').value = enc.tipo;
                modalAgendarElement.querySelector('.modal-title').textContent = "Editar Encontro";
                bsModalAgendar.show();
            };
        });

        // Remover - AGORA ABRE O MODAL CUSTOMIZADO
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.closest('.lesson-card').dataset.id;
                idParaExcluir = id; // Define qual ID será removido
                bsModalExcluir.show(); // Abre o modal vermelho
            };
        });
    }

    // Lógica do botão "Sim, excluir" dentro do Modal Vermelho
    btnConfirmarExcluir.onclick = () => {
        if (!idParaExcluir) return;

        // Encontra o card em todos os containers para aplicar a animação
        const cards = document.querySelectorAll(`.lesson-card[data-id="${idParaExcluir}"]`);
        
        cards.forEach(card => card.classList.add('excluindo'));
        bsModalExcluir.hide();

        setTimeout(() => {
            encontros = encontros.filter(enc => enc.id != idParaExcluir);
            idParaExcluir = null;
            renderizar();
        }, 400); // Sincronizado com o transition do CSS
    };

    // Filtros de Aba
    document.querySelectorAll('button[data-bs-toggle="pill"]').forEach(tabBtn => {
        tabBtn.addEventListener('shown.bs.tab', () => renderizar());
    });

    // Submit Formulário (Novo/Editar)
    formNovoEncontro.onsubmit = (e) => {
        e.preventDefault();
        const dados = {
            titulo: document.getElementById('modal-titulo').value,
            data: document.getElementById('modal-data').value,
            tipo: document.getElementById('modal-tipo').value
        };

        if (idEdicao) {
            const index = encontros.findIndex(enc => enc.id == idEdicao);
            encontros[index] = { ...encontros[index], ...dados };
            idEdicao = null;
        } else {
            encontros.push({
                id: Date.now(),
                ...dados,
                concluido: false,
                obsProf: '', obsAluno: '', ajustes: '', metas: ''
            });
        }

        bsModalAgendar.hide();
        formNovoEncontro.reset();
        renderizar();
    };

    /* ==========================================================================
       UTILITÁRIOS
       ========================================================================== */

    function irParaCard(encontro) {
        const card = document.querySelector(`.lesson-card[data-id="${encontro.id}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('open');
            card.style.outline = "4px solid var(--aia-main)";
            setTimeout(() => card.style.outline = "none", 2000);
        }
    }

    function compararData(dataISO, dataAlvo) {
        if (!dataISO) return false;
        const dataEncontro = new Date(dataISO + 'T00:00:00');
        return dataEncontro.getTime() === dataAlvo.getTime();
    }

    function formatarData(dataISO) {
        if(!dataISO) return "--/--/--";
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function salvarLocal() {
        localStorage.setItem('aia_encontros', JSON.stringify(encontros));
    }

    renderizar();
});