document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const disciplinaKey = params.get('disciplina') || 'biologia';
    const volumeAtual = params.get('volume') || '1';
    
    const dados = bancoDadosAIA[disciplinaKey];
    if (!dados) return;

    // 1. APLICAR CORES DINÂMICAS
    document.documentElement.style.setProperty('--aia-main', dados.cor);
    document.documentElement.style.setProperty('--aia-success', dados.cor + '9A');
    const bgColor = disciplinaKey === 'geografia' ? '#fff9c4' : dados.cor + '9A';
    document.body.style.backgroundColor = bgColor;
    

    // 2. ATUALIZAR HEADER E TÍTULO DA PÁGINA
    document.querySelectorAll('.nome-disciplina-dinamico').forEach(el => {
        el.innerText = dados.nome;
        el.style.color = dados.cor; 
    });
    
    // --- LINHA RESTAURADA: Atualiza o "Volume X" no H2/Título ---
    const displayVol = document.getElementById('displayVolume');
    if(displayVol) displayVol.innerText = `Volume ${volumeAtual}`;

    // 3. INTELIGÊNCIA DE NAVEGAÇÃO (SEM DUPLICAR URL)
    const linksMenu = document.querySelectorAll('.navbar-nav a');

    linksMenu.forEach(link => {
        let hrefOriginal = link.getAttribute('href');
        if (!hrefOriginal || hrefOriginal === "#" || hrefOriginal.startsWith('http')) return;

        const urlLimpa = hrefOriginal.split('?')[0];

        let volumeDestino = volumeAtual;
        const textoLink = link.innerText.toLowerCase();
        if (textoLink.includes("volume")) {
            const match = textoLink.match(/\d+/);
            if (match) volumeDestino = match[0];
        }

        link.href = `${urlLimpa}?disciplina=${disciplinaKey}&volume=${volumeDestino}`;

        // 4. MARCAR PÁGINA ATIVA
        if (window.location.pathname.includes(urlLimpa)) {
            link.classList.add('active');
            const paiDropdown = link.closest('.dropdown');
            if (paiDropdown) paiDropdown.querySelector('.nav-link').classList.add('active');
        }
    });
});