/* ==========================================================================
   LÓGICA AIA - SIMULADOS (VERSÃO FIEL + DETALHES VISUAIS AZUL AIA)
   ========================================================================== */

const TOTAL_QUESTOES = 45;
const STORAGE_KEY = 'aia_simulados_data';

/* ===============================
   🎨 PALETA AIA
================================= */
const aiaPalette = {
    turquesa: '#00bcd4',
    vermelho: '#ff5252',
    amarelo: '#ffc107',
    verde: '#4caf50',
    rosa: '#e91e63',
    grid: '#e2e8f0',
    azulAIA: '#00a896' // Azul do hover do header
};

/* ===============================
   🌈 CORES DOS CICLOS
================================= */
const cicloColors = [
    '#ff6b6b',
    '#feca57',
    '#48dbfb',
    '#1dd1a1',
    '#5f27cd',
    '#ff9ff3'
];

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderizarTabelas();
    carregarDados();
    initGraficos();
    configurarEventos();
}

/* ===============================
   1. TABELAS
================================= */
function renderizarTabelas() {
    const bodyAcertos = document.getElementById('tbodyAcertos');
    const bodyTRI = document.getElementById('tbodyTRI');
    if (!bodyAcertos || !bodyTRI) return;

    bodyAcertos.innerHTML = '';
    bodyTRI.innerHTML = '';

    for (let i = 1; i <= 6; i++) {

        bodyAcertos.insertAdjacentHTML('beforeend', `
            <tr>
                <td class="fw-bold text-muted">${i}º Ciclo</td>
                <td><input type="number" class="input-acerto" data-ciclo="${i}" data-materia="ling" min="0" max="45"></td>
                <td id="perc-ling-${i}" class="perc-materia">0,00%</td>

                <td><input type="number" class="input-acerto" data-ciclo="${i}" data-materia="hum" min="0" max="45"></td>
                <td id="perc-hum-${i}" class="perc-materia">0,00%</td>

                <td><input type="number" class="input-acerto" data-ciclo="${i}" data-materia="nat" min="0" max="45"></td>
                <td id="perc-nat-${i}" class="perc-materia">0,00%</td>

                <td><input type="number" class="input-acerto" data-ciclo="${i}" data-materia="mat" min="0" max="45"></td>
                <td id="perc-mat-${i}" class="perc-materia">0,00%</td>
            </tr>`);

        bodyTRI.insertAdjacentHTML('beforeend', `
            <tr>
                <td class="fw-bold text-muted">${i}º Ciclo</td>
                <td><input type="number" class="input-tri" data-ciclo="${i}" data-materia="red" placeholder="0"></td>
                <td><input type="number" class="input-tri" data-ciclo="${i}" data-materia="ling" placeholder="0"></td>
                <td><input type="number" class="input-tri" data-ciclo="${i}" data-materia="hum" placeholder="0"></td>
                <td><input type="number" class="input-tri" data-ciclo="${i}" data-materia="mat" placeholder="0"></td>
                <td><input type="number" class="input-tri" data-ciclo="${i}" data-materia="nat" placeholder="0"></td>
            </tr>`);
    }
}

/* ===============================
   2. GRÁFICOS
================================= */
function initGraficos() {

    const ciclosLabels = ['1º Ciclo','2º Ciclo','3º Ciclo','4º Ciclo','5º Ciclo','6º Ciclo'];

    const configBase = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { 
                    boxWidth: 12, 
                    padding: 15,
                    color: '#2c3e50'
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: aiaPalette.azulAIA,
                bodyColor: '#2c3e50',
                borderColor: aiaPalette.azulAIA,
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { 
                    borderDash: [5,5], 
                    color: aiaPalette.grid 
                },
                ticks: {
                    color: '#64748b'
                }
            },
            x: { 
                grid: { display: false },
                ticks: {
                    color: '#64748b'
                }
            }
        }
    };

    charts.acertosCiclo = new Chart(document.getElementById('chartAcertosCiclo'), {
        type: 'bar',
        data: {
            labels: ciclosLabels,
            datasets: [
                { label: 'Linguagens', backgroundColor: aiaPalette.turquesa, data: [] },
                { label: 'Humanas', backgroundColor: aiaPalette.vermelho, data: [] },
                { label: 'Natureza', backgroundColor: aiaPalette.amarelo, data: [] },
                { label: 'Matemática', backgroundColor: aiaPalette.verde, data: [] }
            ]
        },
        options: { ...configBase, scales: { ...configBase.scales, y: { max: 50 } } }
    });

    charts.triCiclo = new Chart(document.getElementById('chartTRICiclo'), {
        type: 'bar',
        data: {
            labels: ciclosLabels,
            datasets: [
                { label: 'Redação', backgroundColor: aiaPalette.rosa, data: [] },
                { label: 'Linguagens', backgroundColor: aiaPalette.turquesa, data: [] },
                { label: 'Humanas', backgroundColor: aiaPalette.vermelho, data: [] },
                { label: 'Matemática', backgroundColor: aiaPalette.verde, data: [] },
                { label: 'Natureza', backgroundColor: aiaPalette.amarelo, data: [] }
            ]
        },
        options: { ...configBase, scales: { ...configBase.scales, y: { max: 1000 } } }
    });

    charts.acertosArea = new Chart(document.getElementById('chartAcertosArea'), {
        type: 'bar',
        data: {
            labels: ['Linguagens','Humanas','Natureza','Matemática'],
            datasets: ciclosLabels.map((label, i) => ({
                label: label,
                backgroundColor: cicloColors[i],
                data: []
            }))
        },
        options: { ...configBase, scales: { ...configBase.scales, y: { max: 50 } } }
    });

    charts.triArea = new Chart(document.getElementById('chartTRIArea'), {
        type: 'bar',
        data: {
            labels: ['Redação','Linguagens','Humanas','Natureza','Matemática'],
            datasets: ciclosLabels.map((label, i) => ({
                label: label,
                backgroundColor: cicloColors[i],
                data: []
            }))
        },
        options: { ...configBase, scales: { ...configBase.scales, y: { max: 1000 } } }
    });

    atualizarGraficos();
}

/* ===============================
   3. ATUALIZAÇÃO
================================= */
function atualizarGraficos() {

    const materiasAcertos = ['ling','hum','nat','mat'];
    const materiasTRI = ['red','ling','hum','mat','nat'];

    materiasAcertos.forEach((m,i)=>{
        charts.acertosCiclo.data.datasets[i].data =
            [1,2,3,4,5,6].map(c =>
                parseFloat(document.querySelector(`.input-acerto[data-materia="${m}"][data-ciclo="${c}"]`)?.value) || 0
            );
    });

    materiasTRI.forEach((m,i)=>{
        charts.triCiclo.data.datasets[i].data =
            [1,2,3,4,5,6].map(c =>
                parseFloat(document.querySelector(`.input-tri[data-materia="${m}"][data-ciclo="${c}"]`)?.value) || 0
            );
    });

    for(let c=0;c<6;c++){
        charts.acertosArea.data.datasets[c].data =
            materiasAcertos.map(m =>
                parseFloat(document.querySelector(`.input-acerto[data-materia="${m}"][data-ciclo="${c+1}"]`)?.value) || 0
            );

        charts.triArea.data.datasets[c].data =
            materiasTRI.map(m =>
                parseFloat(document.querySelector(`.input-tri[data-materia="${m}"][data-ciclo="${c+1}"]`)?.value) || 0
            );
    }

    Object.values(charts).forEach(chart => chart.update('none'));
}

/* ===============================
   4. EVENTOS
================================= */
function configurarEventos(){

    document.addEventListener('input',(e)=>{
        if(e.target.matches('.input-acerto, .input-tri')){
            const input = e.target;

            // Efeito visual azul AIA ao digitar
            input.style.borderColor = aiaPalette.azulAIA;
            input.style.boxShadow = `0 0 0 2px rgba(0,168,150,0.15)`;

            if(input.classList.contains('input-acerto')){
                let val=parseFloat(input.value);
                if(val>45) input.value=45;
                if(val<0) input.value=0;
                atualizarPorcentagem(input);
            }

            salvarDados();
            atualizarGraficos();
        }
    });

    const btnLimpar = document.getElementById('btnConfirmarExcluirEnem');
    if(btnLimpar){
        btnLimpar.addEventListener('click',()=>{
            if(confirm("Deseja realmente apagar todo o histórico de simulados?")){
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        });
    }
}

/* ===============================
   5. PERCENTUAL
================================= */
function atualizarPorcentagem(input){
    const {ciclo,materia}=input.dataset;
    const valor=parseFloat(input.value)||0;
    const el=document.getElementById(`perc-${materia}-${ciclo}`);
    if(el){
        el.innerText=((valor/TOTAL_QUESTOES)*100).toFixed(2).replace('.',',')+'%';
        el.style.color = aiaPalette.azulAIA; // detalhe azul
    }
}

/* ===============================
   6. STORAGE
================================= */
function salvarDados(){
    const data={acertos:{},tri:{}};

    document.querySelectorAll('.input-acerto')
        .forEach(i=>data.acertos[`${i.dataset.materia}-${i.dataset.ciclo}`]=i.value);

    document.querySelectorAll('.input-tri')
        .forEach(i=>data.tri[`${i.dataset.materia}-${i.dataset.ciclo}`]=i.value);

    localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

function carregarDados(){
    const salvo=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!salvo)return;

    Object.entries(salvo.acertos).forEach(([key,val])=>{
        const [m,c]=key.split('-');
        const input=document.querySelector(`.input-acerto[data-materia="${m}"][data-ciclo="${c}"]`);
        if(input){
            input.value=val;
            atualizarPorcentagem(input);
        }
    });

    Object.entries(salvo.tri).forEach(([key,val])=>{
        const [m,c]=key.split('-');
        const input=document.querySelector(`.input-tri[data-materia="${m}"][data-ciclo="${c}"]`);
        if(input) input.value=val;
    });
}
