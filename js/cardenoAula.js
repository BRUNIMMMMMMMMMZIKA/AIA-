let currentSelection = { cardId: null, exNum: null, type: null, fIdx: null, aIdx: null };

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const disciplina = params.get('disciplina') || 'biologia';
    const volume = params.get('volume') || '1';
    const dados = bancoDadosAIA[disciplina];
    const container = document.getElementById('renderAula');

    if (dados && container) {
        let html = '';
        const frentes = dados.volumes[volume] || [];

        frentes.forEach((frente, fIdx) => {
            frente.aulas.forEach((aula, aIdx) => {
                const id = `f${fIdx}a${aIdx}`; 
                html += `
                <div class="lesson-card" id="card-${id}">
                    <div class="lesson-header" onclick="toggleCard('${id}', ${fIdx}, ${aIdx})">
                        <h6 class="fw-bold mb-0" style="color: var(--aia-main); min-width: 80px; margin-right: 2dvw;">${frente.nome}</h6>
                        <hr class="linhaFrentes">
                        <div style="flex: 1; padding: 0 15px;"> 
                            <h3 class="h6 mb-0 fw-bold">Aula ${aula.num} - ${aula.assunto}</h3>
                            <small class="text-muted">${aula.area}</small>
                        </div>
                        <hr class="linhaFrentes">
                        <div class="tab-nav" onclick="event.stopPropagation()">
                            <h6 class="mb-1 ta" style="font-size: 11px;">EXERCÍCIOS</h6>
                            <div>
                                <button class="btn-tab active" onclick="loadGrid('${id}', 'aula', ${fIdx}, ${aIdx}, this)">Aula</button>
                                <button class="btn-tab" onclick="loadGrid('${id}', 'tarefa', ${fIdx}, ${aIdx}, this)">Tarefa</button>
                            </div>
                        </div>
                    </div>
                    <div class="lesson-content" id="content-${id}" style="display:none">
                        <div class="inner-padding">
                            <div id="grid-${id}" class="exercise-grid justify-content-center"></div>
                            <div id="viewer-${id}" class="exercise-viewer">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="fw-bold" id="v-title-${id}">AULA</span>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="check-${id}" onchange="markDone('${id}')">
                                        <label class="form-check-label">Concluído</label>
                                    </div>
                                </div>
                                <div id="media-${id}"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        });
        container.innerHTML = html;
    }
});

function toggleCard(id, fIdx, aIdx) {
    const content = document.getElementById(`content-${id}`);
    const card = document.getElementById(`card-${id}`);
    const isClosed = content.style.display === 'none' || content.style.display === '';

    if (isClosed) {
        content.style.display = 'block';
        card.classList.add('open');
        // Gatilho automático no botão Aula
        const btn = card.querySelector('.btn-tab');
        loadGrid(id, 'aula', fIdx, aIdx, btn);
    } else {
        content.style.display = 'none';
        card.classList.remove('open');
    }
}

function loadGrid(cardId, type, fIdx, aIdx, btn) {
    if (window.event) window.event.stopPropagation();

    const card = document.getElementById(`card-${cardId}`);
    const grid = document.getElementById(`grid-${cardId}`);
    const viewer = document.getElementById(`viewer-${cardId}`);
    const content = document.getElementById(`content-${cardId}`);

    // UI State
    card.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    viewer.style.display = 'none';

    content.style.display = 'block';
    card.classList.add('open');

    // Puxa os dados do banco para saber quantas bolinhas criar
    const params = new URLSearchParams(window.location.search);
    const disciplina = params.get('disciplina') || 'biologia';
    const volume = params.get('volume') || '1';
    const aulaData = bancoDadosAIA[disciplina].volumes[volume][fIdx].aulas[aIdx];

    const count = type === 'aula' ? aulaData.videosAula.length : (aulaData.exTarefa || 20);

    grid.innerHTML = '';
    for(let i=1; i<=count; i++) {
        let n = i < 10 ? '0'+i : i;
        grid.innerHTML += `<div class="circle" id="ex-${cardId}-${type}-${i}" onclick="openExercise('${cardId}', '${type}', ${i}, ${fIdx}, ${aIdx})">${n}</div>`;
        if(i % 10 === 0) { grid.innerHTML += `<br>`};
    }
}

function openExercise(cardId, type, num, fIdx, aIdx) {
    const card = document.getElementById(`card-${cardId}`);
    const viewer = document.getElementById(`viewer-${cardId}`);
    const media = document.getElementById(`media-${cardId}`);
    const title = document.getElementById(`v-title-${cardId}`);
    const checkbox = document.getElementById(`check-${cardId}`);

    card.querySelectorAll('.circle').forEach(c => c.classList.remove('selected'));
    const currentCircle = document.getElementById(`ex-${cardId}-${type}-${num}`);
    if (currentCircle) currentCircle.classList.add('selected');

    currentSelection = { cardId, exNum: num, type, fIdx, aIdx };
    viewer.style.display = 'block';
    title.innerText = `${type.toUpperCase()} #${num < 10 ? '0'+num : num}`;
    checkbox.checked = currentCircle.classList.contains('done');

    if(type === 'aula' || type === 'tarefa') {
        const params = new URLSearchParams(window.location.search);
        const disciplina = params.get('disciplina') || 'biologia';
        const volume = params.get('volume') || '1';
        let videoUrl;
        // BUSCA O VÍDEO ESPECÍFICO DA BOLINHA
        if (type === 'aula') {
            videoUrl = bancoDadosAIA[disciplina].volumes[volume][fIdx].aulas[aIdx].videosAula[num-1];
        }
        else {
            videoUrl = bancoDadosAIA[disciplina].volumes[volume][fIdx].aulas[aIdx].videosTarefa[num-1];
        }
        console.log("Carregando vídeo:", videoUrl);
        
        media.innerHTML = `<div class="video-container"><iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe></div>`;
    } else {
        media.innerHTML = `<textarea class="answer-box" rows="4" placeholder="Sua resolução..."></textarea>`;
    }
}

function markDone(cardId) {
    const { type, exNum } = currentSelection;
    if (!exNum) return;
    const circle = document.getElementById(`ex-${cardId}-${type}-${exNum}`);
    const checkbox = document.getElementById(`check-${cardId}`);
    if (checkbox.checked) circle.classList.add('done');
    else circle.classList.remove('done');
}


