/* ============================================
   SUPERMARKET FINDER - INTEGRAÇÃO COM API
   
   Este arquivo contém as funções para comunicar
   com a API do backend.
   
   Configure a URL da API abaixo:
   ============================================ */

// URL da API (ajuste conforme necessário)
const API_URL = 'http://localhost:8080';

/* ============================================
   FUNÇÕES AUXILIARES DE API
   ============================================ */

/**
 * Fazer uma requisição à API
 * @param {string} endpoint - Endpoint da API (ex: '/users/UserGet')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Dados a enviar (para POST/PUT)
 * @returns {Promise} - Resposta da API
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) options.body = JSON.stringify(data);

    const res = await fetch(API_URL + endpoint, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Erro ${res.status}: ${res.statusText} ${text}`);
    }
    if (res.status === 204) return null;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return await res.json();
    return await res.text();
}

/* ============================================
   FUNÇÕES DE UTILIZADORES (AUTENTICAÇÃO)
   ============================================ */

/**
 * Obter utilizador por nome
 * @param {string} nome - Nome do utilizador
 * @returns {Promise} - Dados do utilizador
 */
async function getUserByName(nome) {
    return await apiCall(`/users/UserGet?nome=${encodeURIComponent(nome)}`);
}

// Novo: obter todos os utilizadores (usado pelo admin)
async function getAllUsers() {
    // tentar o endpoint actual primeiro, se falhar tentar o nome alternativo por compatibilidade
    try {
        const resp = await apiCall('/users/GetAllUsers');
        return Array.isArray(resp) ? resp : (resp ? [resp] : []);
    } catch (e) {
        console.warn('GetAllUsers failed, trying alternative endpoint /users/AllUsers', e.message || e);
        try {
            const resp2 = await apiCall('/users/AllUsers');
            return Array.isArray(resp2) ? resp2 : (resp2 ? [resp2] : []);
        } catch (e2) {
            console.warn('getAllUsers fallback failed', e2.message || e2);
            return [];
        }
    }
}

/**
 * Registar novo utilizador
 * @param {object} userData - Dados do utilizador (nome, email, senha, role)
 * @returns {Promise} - Dados do novo utilizador
 */
async function registerUser(userData) {
    return await apiCall('/users/UserPost', 'POST', userData);
}

/**
 * Atualizar utilizador
 * @param {object} userData - Dados do utilizador a atualizar
 * @returns {Promise} - Dados atualizados
 */
async function updateUser(userData) {
    return await apiCall('/users/UserUpdt', 'PUT', userData);
}

/**
 * Apagar utilizador
 * @param {number} id - ID do utilizador
 * @returns {Promise} - Resposta da API
 */
async function deleteUser(id) {
    return await apiCall(`/users/UserDel/${id}`, 'DELETE');
}

/* ============================================
   FUNÇÕES DE CORREDORES (AISLES)
   ============================================ */

/**
 * Criar novo corredor
 * @param {object} corridorData - Dados do corredor (name, storeId)
 * @returns {Promise} - Dados do novo corredor
 */
async function createCorridor(corridorData) {
    // corridorData: { name, storeId, x, y }
    return await apiCall('/corredores/CPost', 'POST', corridorData);
}

/**
 * Obter corredores de uma loja
 * @param {number} storeId - ID da loja
 * @returns {Promise} - Lista de corredores
 */
async function getCorridorsByStore(storeId) {
    try {
        return await apiCall(`/corredores/CGetByStore/${storeId}`);
    } catch (e) {
        // se 404/erro, devolver array vazio para o frontend lidar
        console.warn('getCorridorsByStore error', e.message || e);
        return [];
    }
}

/**
 * Atualizar corredor
 * @param {object} corridorData - Dados do corredor a atualizar
 * @returns {Promise} - Dados atualizados
 */
async function updateCorridor(corridorData) {
    return await apiCall('/corredores/CUpdt', 'PUT', corridorData);
}

/**
 * Apagar corredor
 * @param {number} id - ID do corredor
 * @returns {Promise} - Resposta da API
 */
async function deleteCorridor(id) {
    return await apiCall(`/corredores/CDel/${id}`, 'DELETE');
}

/* ============================================
   FUNÇÕES DE PRATELEIRAS (SHELVES)
   ============================================ */

/**
 * Criar nova prateleira
 * @param {object} shelfData - Dados da prateleira (name, aisleId, position)
 * @returns {Promise} - Dados da nova prateleira
 */
async function createShelf(shelfData) {
    // shelfData: { name, aisleId }
    const body = {
        name: shelfData.name,
        corredorId: shelfData.aisleId || shelfData.corredorId || null,
        x: shelfData.x || null,
        y: shelfData.y || null,
        width: shelfData.width || null,
        height: shelfData.height || null
    };
    return await apiCall('/prateleiras', 'POST', body);
}

async function getShelvesByAisle(aisleId) {
    try {
        const resp = await apiCall(`/prateleiras?corredorId=${aisleId}`);
        return Array.isArray(resp) ? resp : (resp ? [resp] : []);
    } catch (e) {
        console.warn('getShelvesByAisle error', e.message || e);
        return [];
    }
}

async function updateShelf(shelfData) {
    // shelfData: { id, name, aisleId }
    const body = {
        name: shelfData.name,
        corredorId: shelfData.aisleId || shelfData.corredorId || null,
        x: shelfData.x || null,
        y: shelfData.y || null,
        width: shelfData.width || null,
        height: shelfData.height || null
    };
    return await apiCall(`/prateleiras/${shelfData.id}`, 'PUT', body);
}

async function deleteShelf(id) {
    return await apiCall(`/prateleiras/${id}`, 'DELETE');
}

/* ============================================
   FUNÇÕES DE PRODUTOS
   ============================================ */

/**
 * Criar novo produto
 * @param {object} productData - Dados do produto (nome, preco, descricao, aisleId, shelfId)
 * @returns {Promise} - Dados do novo produto
 */
async function createProduct(productData) {
    // productData: { nome, preco, descricao, aisleId, shelfId }
    return await apiCall('/Prod/ProdCreate', 'POST', productData);
}
async function searchProducts(nome) {
    return await apiCall(`/Prod/ProdGet?nome=${encodeURIComponent(nome)}`);
}
async function updateProduct(productData) {
    return await apiCall('/Prod/AlterProd', 'PUT', productData);
}
async function deleteProduct(id) {
    return await apiCall(`/Prod/ProdDel/${id}`, 'DELETE');
}

/* ============================================
   FUNÇÕES DE IMAGEM DA LOJA
   ============================================ */

/**
 * Guardar imagem da loja em localStorage
 * @param {string} imageData - Dados da imagem em Base64
 */
function setStoreMapImage(imageData) {
    localStorage.setItem('storeMapImage', imageData);
}

/**
 * Obter imagem da loja de localStorage
 * @returns {string} - Dados da imagem em Base64
 */
function getStoreMapImage() {
    return localStorage.getItem('storeMapImage');
}
