/**
 * AIA - Meus Dados
 * Lógica para persistência de dados e aplicação de cores de proficiência
 */

document.addEventListener('DOMContentLoaded', () => {
    initMeusDados();
});

function initMeusDados() {
    // 1. Carrega os dados salvos e aplica as cores imediatamente
    loadUserData();

    // 2. Configura o botão de Salvar para feedback visual
    const btnSalvar = document.querySelector('.btn-primary');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            saveUserData();
            showSuccessFeedback(btnSalvar);
        });
    }

    // 3. Monitora mudanças nos campos (Delegação de eventos)
    document.addEventListener('change', (e) => {
        const el = e.target;

        // Se mudar um select de proficiência, dispara a atualização visual
        if (el.classList.contains('proficiencia-select')) {
            updateProficienciaColor(el);
        }

        // Salva automaticamente em cada mudança
        saveUserData();
    });

    // 4. Salva enquanto o usuário digita (para inputs de texto e textareas)
    document.addEventListener('input', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') {
            saveUserData();
        }
    });
}

/**
 * Aplica as classes CSS de cor baseadas no valor selecionado
 */
function updateProficienciaColor(el) {
    // Remove todas as classes de cores antes de aplicar a nova para evitar sobreposição
    el.classList.remove('bg-alta', 'bg-media', 'bg-baixa');

    // Normaliza o valor: remove espaços, converte para minúsculas e remove acentos
    // Isso garante que "Média" (do HTML) funcione com a classe "bg-media"
    const val = el.value.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (val === 'alta') {
        el.classList.add('bg-alta');
    } else if (val === 'media') {
        el.classList.add('bg-media');
    } else if (val === 'baixa') {
        el.classList.add('bg-baixa');
    }
}

/**
 * Salva o estado atual de todos os campos que possuem um ID no LocalStorage
 */
function saveUserData() {
    const fields = document.querySelectorAll('input, select, textarea');
    const userData = {
        lastUpdate: new Date().toISOString(),
        values: {}
    };

    fields.forEach((field) => {
        if (field.id) {
            userData.values[field.id] = field.value;
        }
    });

    localStorage.setItem('aia_dados_aluno_v3', JSON.stringify(userData));
}

/**
 * Recupera os dados salvos e força a atualização visual (cores)
 */
function loadUserData() {
    const saved = localStorage.getItem('aia_dados_aluno_v3');
    
    // Se não houver dados, apenas inicializa as cores (caso haja valores default no HTML)
    if (!saved) {
        document.querySelectorAll('.proficiencia-select').forEach(updateProficienciaColor);
        return;
    }

    try {
        const data = JSON.parse(saved);
        const values = data.values;

        Object.keys(values).forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.value = values[id];
                
                // Se for um select de proficiência, força a cor baseada no valor carregado
                if (field.classList.contains('proficiencia-select')) {
                    updateProficienciaColor(field);
                }
            }
        });
    } catch (e) {
        console.error("Erro ao carregar dados do LocalStorage:", e);
    }
}

/**
 * Feedback visual no botão de salvar (estilo "Sucesso")
 */
function showSuccessFeedback(btn) {
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>DADOS SALVOS!';
    
    // Troca temporariamente a cor do botão se ele for o purple do seu tema
    const originalClass = btn.className;
    btn.classList.replace('btn-primary', 'btn-success');
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.className = originalClass;
        btn.disabled = false;
    }, 2000);
}