/**
 * AIA - Cronograma Inteligente
 * Versão 2.2 - Cores de Matérias Oficiais e Persistência
 */

document.addEventListener('DOMContentLoaded', () => {
    initCronograma();
    destacarDiaAtual();
});

function initCronograma() {
    let editMode = false;
    let selectedSlot = null;

    // Elementos da Interface
    const btnEdit = document.getElementById('btn-edit-mode');
    const table = document.getElementById('cronograma-table');
    const modalElement = document.getElementById('modalEdicao');
    const modal = new bootstrap.Modal(modalElement);
    const filterBtns = document.querySelectorAll('.filter-btn');
    const rows = document.querySelectorAll('#cronograma-table tbody tr');

    // Elementos do Modal
    const inputTarefa = document.getElementById('input-tarefa');
    const selectCor = document.getElementById('select-cor');
    const btnSalvar = document.getElementById('btn-salvar-slot');
    const btnLimpar = document.getElementById('btn-limpar-slot');

    /**
     * Array de classes para limpeza. 
     * Inclui as cores das matérias baseadas no PDF de referência.
     */
    const coresClasses = [
        "bg-historia", "bg-biologia", "bg-matematica", "bg-quimica", 
        "bg-sociologia", "bg-gramatica", "bg-geografia", "bg-fisica", 
        "bg-redacao", "bg-primary", "bg-secondary", "bg-danger",
        "text-white", "text-dark"
    ];

    // 1. Carregar dados salvos do LocalStorage
    loadCronograma();

    // 2. Lógica do Modo Edição
    btnEdit.addEventListener('click', () => {
        editMode = !editMode;
        btnEdit.classList.toggle('btn-primary');
        btnEdit.classList.toggle('btn-outline-primary');
        
        if (editMode) {
            btnEdit.innerHTML = '<i class="bi bi-check-lg me-2"></i>Finalizar Edição';
            table.classList.add('mode-edit');
        } else {
            btnEdit.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Modo Gerenciamento';
            table.classList.remove('mode-edit');
        }
    });

    // 3. Clique nas Células (Abrir Modal)
    table.addEventListener('click', (e) => {
        if (!editMode) return;
        const cell = e.target.closest('td[data-dia]');
        if (!cell) return;

        selectedSlot = cell;
        const span = cell.querySelector('.badge-cronograma');
        
        // Se a célula já tiver um span, pega o texto dele, senão pega o texto puro
        inputTarefa.value = span ? span.innerText : (cell.innerText || "");
        modal.show();
    });

    // 4. Salvar Atividade
    btnSalvar.addEventListener('click', () => {
        const texto = inputTarefa.value.trim();
        const corSelecionada = selectCor.value;

        if (texto && selectedSlot) {
            // Remove todas as classes de cores anteriores antes de aplicar a nova
            selectedSlot.classList.remove(...coresClasses);
            
            // Aplica as novas classes (ex: "bg-historia text-white")
            const classesArray = corSelecionada.split(" ");
            selectedSlot.classList.add(...classesArray);
            
            // Insere o conteúdo com o span centralizador
            selectedSlot.innerHTML = `<span class="badge-cronograma">${texto}</span>`;
            
            saveCronograma();
            modal.hide();
        }
    });

    // 5. Limpar Célula
    btnLimpar.addEventListener('click', () => {
        if (selectedSlot) {
            selectedSlot.innerHTML = '';
            selectedSlot.classList.remove(...coresClasses);
            saveCronograma();
            modal.hide();
        }
    });

    // 6. Filtros de Período (Manhã/Tarde/Noite)
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-outline-secondary');
            });
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('active', 'btn-primary');

            const periodo = btn.getAttribute('data-periodo');

            rows.forEach(row => {
                const horarioStr = row.getAttribute('data-row');
                const hora = parseInt(horarioStr.split(':')[0]);

                if (periodo === 'todos') {
                    row.style.display = '';
                } else if (periodo === 'manha') {
                    row.style.display = (hora >= 5 && hora < 12) ? '' : 'none';
                } else if (periodo === 'tarde') {
                    row.style.display = (hora >= 12 && hora < 18) ? '' : 'none';
                } else if (periodo === 'noite') {
                    row.style.display = (hora >= 18) ? '' : 'none';
                }
            });
        });
    });

    // --- FUNÇÕES DE PERSISTÊNCIA ---

    function saveCronograma() {
        const slotsData = [];
        const allSlots = table.querySelectorAll('td[data-dia]');
        
        allSlots.forEach((slot, index) => {
            const span = slot.querySelector('.badge-cronograma');
            if (span || slot.innerText.trim() !== "") {
                slotsData.push({
                    index: index,
                    text: span ? span.innerText : slot.innerText,
                    classes: slot.className 
                });
            }
        });
        localStorage.setItem('aia_cronograma_v2', JSON.stringify(slotsData));
    }

    function loadCronograma() {
        const savedData = localStorage.getItem('aia_cronograma_v2');
        if (!savedData) return;
        
        const slotsData = JSON.parse(savedData);
        const allSlots = table.querySelectorAll('td[data-dia]');
        
        slotsData.forEach(item => {
            const cell = allSlots[item.index];
            if (cell) {
                // Remove classes padrão antes de carregar as salvas
                cell.classList.remove(...coresClasses);
                cell.className = item.classes;
                cell.innerHTML = `<span class="badge-cronograma">${item.text}</span>`;
            }
        });
    }
}

/**
 * Destaca a coluna do dia atual com base no relógio do sistema
 */
function destacarDiaAtual() {
    const data = new Date();
    let diaSemana = data.getDay(); // 0 (Dom) a 6 (Sab)

    if (diaSemana === 0) diaSemana = 7; // Ajuste para Domingo=7

    const headerDia = document.querySelector(`thead th:nth-child(${diaSemana + 1})`);
    if (headerDia) {
        headerDia.classList.add('dia-atual-header');
    }

    const celulasDia = document.querySelectorAll(`td[data-dia="${diaSemana}"]`);
    celulasDia.forEach(td => {
        td.classList.add('dia-atual-coluna');
    });
}