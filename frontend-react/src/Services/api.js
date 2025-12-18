const API_URL = 'http://localhost:8080';

// Função auxiliar para processar as respostas
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro: ${response.status}`);
    }
    // Tenta fazer parse do JSON, se não der (ex: delete retorna vazio), retorna null
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
};

export const apiService = {
    /* ------------------------------------------------------------------
       USUÁRIOS (Controller: /users)
       ------------------------------------------------------------------ */
    login: (nome) => 
        fetch(`${API_URL}/users/UserGet?nome=${encodeURIComponent(nome)}`)
            .then(handleResponse)
            .then(users => users && users.length > 0 ? users[0] : null), // Pega o primeiro se for lista

    register: (userData) => 
        fetch(`${API_URL}/users/UserPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        }).then(handleResponse),

    getAllUsers: () => 
        fetch(`${API_URL}/users/UserGet`) // Sem ?nome= retorna todos (se o Java tiver required=false)
            .then(handleResponse),

    deleteUser: (id) => 
        fetch(`${API_URL}/users/UserDelete?id=${id}`, {
            method: 'DELETE',
        }).then(handleResponse),

    /* ------------------------------------------------------------------
       CORREDORES (Controller: /Corredor) - Nota: Letra Maiúscula
       ------------------------------------------------------------------ */
    getCorredores: () => 
        fetch(`${API_URL}/Corredor/CGet`)
            .then(handleResponse),

    createCorredor: (data) => 
        fetch(`${API_URL}/Corredor/CPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Ex: { "nome": "Bebidas" }
        }).then(handleResponse),

    deleteCorredor: (id) => 
        fetch(`${API_URL}/Corredor/CDelete?id=${id}`, {
            method: 'DELETE',
        }).then(handleResponse),

    /* ------------------------------------------------------------------
       PRATELEIRAS (Controller: /Prateleira)
       ------------------------------------------------------------------ */
    getPrateleiras: () => 
        fetch(`${API_URL}/Prateleira/PGet`)
            .then(handleResponse),

    createPrateleira: (data) => 
        fetch(`${API_URL}/Prateleira/PPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Ex: { "nome": "A1", "idCorredor": 1 }
        }).then(handleResponse),

    deletePrateleira: (id) => 
        fetch(`${API_URL}/Prateleira/PDelete?id=${id}`, {
            method: 'DELETE',
        }).then(handleResponse),

    /* ------------------------------------------------------------------
       PRODUTOS (Controller: /Prod) - Nota: /Prod e não /Produto
       ------------------------------------------------------------------ */
    getProducts: () => 
        fetch(`${API_URL}/Prod/ProdGet`)
            .then(handleResponse),

    createProduct: (data) => 
        fetch(`${API_URL}/Prod/ProdPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse),

    deleteProduct: (id) => 
        fetch(`${API_URL}/Prod/ProdDelete?id=${id}`, {
            method: 'DELETE',
        }).then(handleResponse),
};