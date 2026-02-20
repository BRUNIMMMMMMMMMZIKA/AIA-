// Configuração de Temas
const temasDisciplinas = {
    biologia: { nome: 'Biologia', color: '#127335' },
    historia: { nome: 'História', color: '#784d3e' },
    matematica: { nome: 'Matemática', color: '#ed7241' },
    filosofia: { nome: 'Filosofia/Sociologia', color: '#9b191c' },
    quimica: { nome: 'Química', color: '#24388c' },
    literatura: { nome: 'Literatura/Gramática', color: '#e62576' },
    geografia: { nome: 'Geografia', color: '#eedf1c' },
    fisica: { nome: 'Física', color: '#6d247d' },
    redacao: { nome: 'Redação/Inglês', color: '#af2765' }
};

let currentSelection = { cardId: null, exNum: null, type: null };

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const disciplinaKey = params.get('disciplina') || 'biologia';
    const tema = temasDisciplinas[disciplinaKey];

    if (tema) {
        document.documentElement.style.setProperty('--aia-main', tema.color);
        document.querySelectorAll('.nome-disciplina-dinamico').forEach(el => el.innerText = tema.nome);
    }
});

function toggleCard(id) {
    const card = document.getElementById(`card-${id}`);
    card.classList.toggle('open');
    const grid = document.getElementById(`grid-${id}`);
    if(card.classList.contains('open') && grid.innerHTML === "") {
        card.querySelector('.btn-tab').click();
    }
}

function loadGrid(cardId, type, count, btn) {
    const card = document.getElementById(`card-${cardId}`);
    const grid = document.getElementById(`grid-${cardId}`);
    const viewer = document.getElementById(`viewer-${cardId}`);

    card.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    viewer.style.display = 'none';

    grid.innerHTML = '';
    for(let i=1; i<=count; i++) {
        let n = i < 10 ? '0'+i : i;
        // Se a página atual for de MATERIAIS, chama PDF, senão chama VIDEO
        const functionCall = document.body.classList.contains('page-materiais') 
            ? `openPDF(${cardId}, '${type}', ${i})` 
            : `openExercise(${cardId}, '${type}', ${i})`;
            
        grid.innerHTML += `<div class="circle" id="ex-${cardId}-${type}-${i}" onclick="${functionCall}">${n}</div>`;
    }
}

// LOGICA DE VÍDEO (Aulas)
function openExercise(cardId, type, num) {
    setupViewer(cardId, type, num);
    const media = document.getElementById(`media-${cardId}`);
    const videoUrl = "../assets/img/seu-video.mp4"; // Aqui viria do banco de dados
    media.innerHTML = `<iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
}

// LOGICA DE PDF (Materiais)
function openPDF(cardId, type, num) {
    setupViewer(cardId, type, num);
    const media = document.getElementById(`media-${cardId}`);
    const pdfUrl = "../../assets/pdf/material.pdf"; // Aqui viria do banco de dados
    media.innerHTML = `
        <div class="mb-2 text-end"><a href="${pdfUrl}" target="_blank" class="btn-fullscreen-pdf"><i class="bi bi-arrows-fullscreen"></i> Tela Cheia</a></div>
        <div class="pdf-container"><iframe src="${pdfUrl}#toolbar=0"></iframe></div>`;
}

function setupViewer(cardId, type, num) {
    const card = document.getElementById(`card-${cardId}`);
    const viewer = document.getElementById(`viewer-${cardId}`);
    const title = document.getElementById(`v-title-${cardId}`);
    const check = document.getElementById(`check-${cardId}`);

    card.querySelectorAll('.circle').forEach(c => c.classList.remove('selected'));
    const current = document.getElementById(`ex-${cardId}-${type}-${num}`);
    current.classList.add('selected');

    currentSelection = { cardId, exNum: num, type };
    viewer.style.display = 'block';
    title.innerText = `${type.toUpperCase()} #${num}`;
    check.checked = current.classList.contains('done');
}

function markDone(cardId) {
    const { type, exNum } = currentSelection;
    const circle = document.getElementById(`ex-${cardId}-${type}-${exNum}`);
    circle.classList.toggle('done', document.getElementById(`check-${cardId}`).checked);
}