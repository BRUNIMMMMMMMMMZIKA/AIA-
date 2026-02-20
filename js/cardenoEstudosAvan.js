let currentSelection = { topicIdx: null, exIdx: null };

document.addEventListener('DOMContentLoaded', () => {
    renderizarTopicosAvancados();
});

function renderizarTopicosAvancados() {
    const params = new URLSearchParams(window.location.search);
    const disciplina = params.get('disciplina') || 'biologia';
    const volume = params.get('volume') || '1';
    
    // Pega os dados da disciplina
    const dadosDisciplina = bancoEstudosAvancados[disciplina];
    const container = document.getElementById('lista-topicos-avancados');

    if (!dadosDisciplina || !container) {
        console.error("Dados ou container não encontrados!");
        return;
    }

    // Acessa o Volume -> Array [0] -> topicos
    // Usamos 'let' para permitir a navegação na estrutura
    let listaTopicos = dadosDisciplina.volumes[volume][0].topicos;

    let html = '';
    listaTopicos.forEach((topico, tIdx) => {
        // Calcula o número inicial (1, 101, 201...) baseado no ID do tópico
        const startNum = ((topico.id - 1) * 100) + 1; 

        html += `
            <div class="lesson-card" id="card-avancado-${tIdx}">
                <div class="lesson-header" onclick="toggleCardAvancado(${tIdx})">
                    <div class="d-flex align-items-center gap-3">
                        <h6 class="fw-bold mb-0" style="color: var(--aia-main); min-width: 100px;">
                            Exercícios ${topico.faixa}
                        </h6>
                    </div>
                    <i class="bi bi-chevron-down toggle-icon"></i>
                </div>
                <div class="lesson-content" id="content-avancado-${tIdx}" style="display:none">
                    <div class="inner-padding">
                        <div class="exercise-grid">
                            ${gerarBolinhasAvancadas(tIdx, startNum, topico.videos.length)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function gerarBolinhasAvancadas(tIdx, startNum, total) {
    let html = '';
    for (let i = 0; i < total; i++) {
        const numExibicao = startNum + i;
        html += `
            <div class="circle" 
                 id="dot-${tIdx}-${i}" 
                 onclick="openVideoAvancado(${tIdx}, ${i})">
                 ${numExibicao}
            </div>`;
    }
    return html;
}

function openVideoAvancado(tIdx, exIdx) {
    const params = new URLSearchParams(window.location.search);
    const disciplina = params.get('disciplina') || 'biologia';
    const volume = params.get('volume') || '1';

    // Navega na nova estrutura para achar o vídeo
    const videoUrl = bancoEstudosAvancados[disciplina].volumes[volume][0].topicos[tIdx].videos[exIdx];

    document.querySelectorAll('.circle').forEach(c => c.classList.remove('selected'));
    const currentDot = document.getElementById(`dot-${tIdx}-${exIdx}`);
    if(currentDot) currentDot.classList.add('selected');

    const viewer = document.getElementById('viewer-container');
    const iframe = viewer.querySelector('iframe');
    const switchInput = document.getElementById('check-avancado');
    
    currentSelection = { tIdx, exIdx };
    viewer.style.display = 'block';
    iframe.src = videoUrl && videoUrl !== "#" ? videoUrl : "https://www.youtube.com/embed/dQw4w9WgXcQ";

    switchInput.checked = currentDot.classList.contains('done');
    if(window.innerWidth < 768) viewer.scrollIntoView({ behavior: 'smooth' });
}

function markDoneAvan() {
    if (currentSelection.tIdx === null) return;
    
    const { tIdx, exIdx } = currentSelection;
    const dot = document.getElementById(`dot-${tIdx}-${exIdx}`);
    const switchInput = document.getElementById('check-avancado');

    if (switchInput.checked) {
        dot.classList.add('done');
    } else {
        dot.classList.remove('done');
    }
}

function toggleCardAvancado(tIdx) {
    const content = document.getElementById(`content-avancado-${tIdx}`);
    const card = document.getElementById(`card-avancado-${tIdx}`);
    const isOpen = content.style.display === 'block';

    document.querySelectorAll('.lesson-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('open'));

    if (!isOpen) {
        content.style.display = 'block';
        card.classList.add('open');
    }
}