/* ============================================
   ADMINISTRADOR - GESTÃO DE LOJISTAS (INTEGRAÇÃO COM API)
   ============================================ */

let lojistas = [];

// helper simples para normalizar o user vindo da API
function normalizeUser(u) {
    if (!u) return null;
    return {
        id: u.id || u.idUser || null,
        nome: u.nome || u.name || u.username || '',
        email: u.email || u.mail || ''
    };
}

async function loadAdminData() {
    try {
        // Obter todos os utilizadores via API
        const users = await getAllUsers();
        // Normalizar e filtrar apenas lojistas (se não houver role no backend, mantém todos)
        lojistas = users.map(normalizeUser).filter(u => u !== null);

        loadLojistasTable();
    } catch (error) {
        console.error('Erro ao carregar dados de admin:', error);
        // fallback: mostrar tabela vazia
        lojistas = [];
        loadLojistasTable();
    }
}

async function loadLojistasTable() {
    const container = document.getElementById('lojistasTable');
    const totalElement = document.getElementById('totalLojistas');

    try {
        if (!lojistas || lojistas.length === 0) {
            if (container) container.innerHTML = '<p class="empty-message">Nenhum lojista cadastrado</p>';
            if (totalElement) totalElement.textContent = '0';
            return;
        }

        if (totalElement) totalElement.textContent = lojistas.length;

        if (container) {
            container.innerHTML = lojistas.map(lojista => `
                <div class="lojista-item">
                    <div class="lojista-info">
                        <div class="lojista-name">${lojista.nome}</div>
                        <div class="lojista-email">${lojista.email}</div>
                        <div class="lojista-meta">
                            <span>ID: ${lojista.id}</span>
                        </div>
                    </div>
                    <button class="btn btn-danger btn-small" onclick="handleDeleteLojista(${lojista.id})">Apagar</button>
                </div>
            `).join('');
        }
    } catch (error) {
        if (container) container.innerHTML = '<p class="empty-message">Erro ao carregar lojistas</p>';
        console.error('Erro:', error);
    }
}

async function handleDeleteLojista(id) {
    const lojista = lojistas.find(l => l.id === id) || { nome: 'usuário' };

    if (!confirm(`Tem a certeza que deseja remover "${lojista.nome}"?`)) return;

    try {
        // CHAMADA À API:
        // DELETE /users/UserDel/{id}
        await deleteUser(id);

        // remover localmente e recarregar tabela
        lojistas = lojistas.filter(l => l.id !== id);
        loadLojistasTable();
        alert('Lojista removido com sucesso!');
    } catch (error) {
        alert('Erro ao remover lojista: ' + (error.message || error));
    }
}
