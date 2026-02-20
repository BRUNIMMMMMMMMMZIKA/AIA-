document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const disciplina = params.get('disciplina') || 'biologia';
    const volume = params.get('volume') || '1';
    
    const dados = bancoDadosAIA[disciplina];
    const container = document.getElementById('renderTeoria');

    if (dados && container) {
        let html = '';
        const frentes = dados.volumes[volume] || [];

        frentes.forEach((frente, fIdx) => {
            frente.aulas.forEach((aula, aIdx) => {
                
                // Cria um ID sem espaços e sem vírgulas (Ex: video-1-0-01)
                const safeId = `vid-${fIdx}-${aIdx}`; 
                
                // Garante que se não tiver vídeo, ele não quebre
                const videoUrl = aula.videoTeoria && aula.videoTeoria !== "#" ? aula.videoTeoria : "about:blank";

                html += `
                <div class="lesson-card" id="card-${safeId}">
                    <div class="lesson-header" onclick="toggleTeoria('${safeId}', '${videoUrl}')">
                        <h6 class="fw-bold mb-0" style="color: var(--aia-main); min-width: 90px; margin-right: 2dvw;">${frente.nome}</h6>
                        <hr class="linhaFrentes">
                        <div style="flex: 1; padding: 0 20px;"> 
                            <h3 class="h6 mb-0 fw-bold">Aula ${aula.num} - ${aula.assunto}</h3>
                            <small class="text-muted">${aula.area}</small>
                        </div>
                        <hr class="linhaFrentes">
                        <div class="tab-nav">
                            <div>
                            <h6 class="t-col-acao text-end ta" style="color: var(--aia-main);">ACESSO</h6>
                        </div>
                        <div class="t-col-acao text-end">
                            <span class="btn-play"><i class="bi bi-play-fill"></i></span>
                        </div>
                        </div>
                    </div>
                    <div class="lesson-content" id="viewer-${safeId}" style="display:none">
                        <div class="inner-padding">
                            <div class="exercise-viewer" style="display:block">
                                <div class="video-container">
                                    <iframe id="iframe-${safeId}" src="" frameborder="0" allowfullscreen></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        });
        container.innerHTML = html;
    } else {
        console.error("Erro: Container #renderTeoria não encontrado ou dados da disciplina inválidos.");
    }
});

function toggleTeoria(id, url) {
    console.log("Clicou na aula:", id, "Link:", url); 

    const content = document.getElementById(`viewer-${id}`);
    const iframe = document.getElementById(`iframe-${id}`);
    const card = document.getElementById(`card-${id}`);
    
    const isOpening = content.style.display === 'none';

    document.querySelectorAll('.lesson-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('iframe').forEach(f => f.src = "");

    if (isOpening) {
        content.style.display = 'block';
        card.classList.add('open');
        iframe.src = url;
    }
}