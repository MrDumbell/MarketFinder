/* ============================================
   SUPERMARKET FINDER - LÓGICA PRINCIPAL
   
   Este arquivo carrega as páginas e gerencia
   a navegação entre elas.
   ============================================ */

// Quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

/**
 * Carregar uma página dinamicamente
 * @param {string} pageName - Nome da página (ex: 'login', 'cliente', 'lojista', 'admin')
 */
function loadPage(pageName) {
    const app = document.getElementById('app');

    // Fazer requisição para carregar a página
    fetch(`Pages/${pageName}.html`)
        .then(response => response.text())
        .then(html => {
            app.innerHTML = html;

            // Remover classe active de todas as páginas
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));

            // Adicionar classe active à página carregada
            const pageId = pageName + 'Page';
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.add('active');
            }

            // Executar lógica específica da página
            onPageLoaded(pageName);

            // Configurar event listeners da página
            setupEventListeners();
        })
        .catch(error => console.error('Erro ao carregar página:', error));
}

/**
 * Executar lógica específica quando uma página é carregada
 */
function onPageLoaded(pageName) {
    switch(pageName) {
        case 'cliente':
            loadStoreMapInClient();
            break;
        case 'lojista':
            loadCorridorsList();
            loadShelvesList();
            loadProductsList();
            loadShelvesSelects();
            break;
        case 'admin':
            loadAdminData();
            break;
    }
}

/**
 * Trocar entre abas (Corredores, Prateleiras, Produtos, etc.)
 */
function switchTab(tabId, evt) {
    // Esconder todas as abas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Remover classe active de todos os botões
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar a aba selecionada
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.classList.add('active');
    }

    // Adicionar classe active ao botão clicado
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }
}

/**
 * Configurar todos os event listeners
 */
function setupEventListeners() {
    // Formulário de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Formulário de Registo
    const registarForm = document.getElementById('registarForm');
    if (registarForm) {
        registarForm.addEventListener('submit', handleRegistar);
    }

    // Formulário de Pesquisa (Cliente)
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Formulário de Adicionar Corredor
    const addCorridorForm = document.getElementById('addCorridorForm');
    if (addCorridorForm) {
        addCorridorForm.addEventListener('submit', handleAddCorridor);
    }

    // Formulário de Adicionar Prateleira
    const addShelfForm = document.getElementById('addShelfForm');
    if (addShelfForm) {
        addShelfForm.addEventListener('submit', handleAddShelf);
    }

    // Formulário de Adicionar Produto
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Formulário de Upload de Imagem
    const uploadImageForm = document.getElementById('uploadImageForm');
    if (uploadImageForm) {
        uploadImageForm.addEventListener('submit', handleUploadImage);
    }
}
