/* ============================================
   LOJISTA - GESTÃO DE CORREDORES, PRATELEIRAS E PRODUTOS (INTEGRAÇÃO COM API)
   ============================================ */

// Variáveis globais para armazenar dados
let corridors = [];
let shelves = [];
let products = [];

// currentUser esperado ser definido noutro ficheiro (auth). Usar fallback 1 para dev.
// const currentUser = { id: 1 };

// ============================================
// CORREDORES
// ============================================

async function handleAddCorridor(event) {
    event.preventDefault();
    const name = document.getElementById('corridorName').value;

    if (!name || !name.trim()) {
        alert('Por favor, digite um nome para o corredor');
        return;
    }

    try {
        // Criar corredor via API (envia storeId se existir currentUser)
        const body = {
            name: name,
            storeId: (typeof currentUser !== 'undefined' && currentUser && currentUser.id) ? currentUser.id : 1
        };

        await createCorridor(body);

        // Recarregar lista a partir da API para garantir estado correto
        await loadCorridorsList();
        await loadShelvesSelects();

        document.getElementById('corridorName').value = '';
        alert('Corredor adicionado com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar corredor: ' + (error.message || error));
    }
}

async function loadCorridorsList() {
    const container = document.getElementById('corridorsList');

    try {
        const storeId = (typeof currentUser !== 'undefined' && currentUser && currentUser.id) ? currentUser.id : 1;
        const data = await getCorridorsByStore(storeId);

        // garantir array
        corridors = Array.isArray(data) ? data : (data ? [data] : []);

        if (!corridors || corridors.length === 0) {
            container.innerHTML = '<p class="empty-message">Nenhum corredor cadastrado</p>';
            return;
        }

        // construir HTML: contar prateleiras por corredor (com base em shelves já carregadas)
        container.innerHTML = corridors.map(corridor => {
            const corridorId = corridor.id;
            const corridorShelves = shelves.filter(s => (s.aisleId === corridorId) || (s.corredorId === corridorId));
            const shelfCount = corridorShelves.length;

            return `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${corridor.name}</div>
                    <div>${shelfCount} prateleira(s)</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit btn-small" onclick="editCorridor(${corridor.id})">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCorridorConfirm(${corridor.id})">Apagar</button>
                </div>
            </div>`;
        }).join('');

    } catch (error) {
        container.innerHTML = '<p class="empty-message">Erro ao carregar corredores</p>';
        console.error('Erro ao carregar corredores:', error);
    }
}

async function editCorridor(id) {
    const corridor = corridors.find(c => c.id === id) || { name: '' };
    const newName = prompt('Novo nome do corredor:', corridor.name || '');

    if (newName && newName.trim()) {
        try {
            await updateCorridor({ id: id, name: newName });
            await loadCorridorsList();
            alert('Corredor atualizado com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar corredor: ' + (error.message || error));
        }
    }
}

async function deleteCorridorConfirm(id) {
    if (!confirm('Tem a certeza que deseja apagar este corredor?')) return;

    try {
        await deleteCorridor(id);
        await loadCorridorsList();
        await loadShelvesList();
        await loadShelvesSelects();
        alert('Corredor apagado com sucesso!');
    } catch (error) {
        alert('Erro ao apagar corredor: ' + (error.message || error));
    }
}

// ============================================
// PRATELEIRAS
// ============================================

async function handleAddShelf(event) {
    event.preventDefault();

    const corridorId = parseInt(document.getElementById('shelfCorridor').value);
    const name = document.getElementById('shelfName').value;

    if (!corridorId || !name || !name.trim()) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Criar prateleira via API (data.js faz a normalização)
        await createShelf({ name: name, aisleId: corridorId, position: 1 });

        // Recarregar prateleiras e selects
        await loadShelvesList();
        await loadShelvesSelects();

        document.getElementById('shelfCorridor').value = '';
        document.getElementById('shelfName').value = '';
        alert('Prateleira adicionada com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar prateleira: ' + (error.message || error));
    }
}

async function loadShelvesList() {
    const container = document.getElementById('shelvesList');

    try {
        // Recarregar prateleiras por corredor
        let allShelves = [];

        for (let corridor of corridors) {
            const data = await getShelvesByAisle(corridor.id);
            if (data && data.length > 0) {
                allShelves = allShelves.concat(data);
            }
        }

        shelves = allShelves;

        if (!shelves || shelves.length === 0) {
            container.innerHTML = '<p class="empty-message">Nenhuma prateleira cadastrada</p>';
            return;
        }

        let html = '';
        corridors.forEach(corridor => {
            const corridorShelves = shelves.filter(s => (s.aisleId === corridor.id) || (s.corredorId === corridor.id));
            if (corridorShelves.length > 0) {
                html += `<h3>${corridor.name}</h3>`;
                corridorShelves.forEach(shelf => {
                    html += `
                        <div class="item-card">
                            <div class="item-header">
                                <div class="item-title">${shelf.name}</div>
                                <div>Posição: ${shelf.position || ''}</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-edit btn-small" onclick="editShelf(${shelf.id})">Editar</button>
                                <button class="btn btn-danger btn-small" onclick="deleteShelfConfirm(${shelf.id})">Apagar</button>
                            </div>
                        </div>
                    `;
                });
            }
        });

        container.innerHTML = html || '<p class="empty-message">Nenhuma prateleira cadastrada</p>';
    } catch (error) {
        container.innerHTML = '<p class="empty-message">Erro ao carregar prateleiras</p>';
        console.error('Erro ao carregar prateleiras:', error);
    }
}

async function editShelf(id) {
    const shelf = shelves.find(s => s.id === id) || { name: '' };
    const newName = prompt('Novo nome da prateleira:', shelf.name || '');

    if (newName && newName.trim()) {
        try {
            await updateShelf({ id: id, name: newName, position: shelf.position });
            await loadShelvesList();
            alert('Prateleira atualizada com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar prateleira: ' + (error.message || error));
        }
    }
}

async function deleteShelfConfirm(id) {
    if (!confirm('Tem a certeza que deseja apagar esta prateleira?')) return;

    try {
        await deleteShelf(id);
        await loadShelvesList();
        alert('Prateleira apagada com sucesso!');
    } catch (error) {
        alert('Erro ao apagar prateleira: ' + (error.message || error));
    }
}

// ============================================
// PRODUTOS
// ============================================

async function handleAddProduct(event) {
    event.preventDefault();

    const nome = document.getElementById('productName').value;
    const preco = document.getElementById('productPrice').value;
    const descricao = document.getElementById('productDesc').value;
    const corridorId = document.getElementById('productCorridor').value || null;
    const shelfId = document.getElementById('productShelf').value || null;

    if (!nome || !nome.trim() || !preco || !descricao || !descricao.trim()) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    try {
        const productBody = {
            nome: nome,
            preco: parseFloat(preco),
            descricao: descricao,
            aisleId: corridorId || null,
            shelfId: shelfId || null
        };

        const newProduct = await createProduct(productBody);

        // O backend neste projeto pode retornar apenas uma string; normalizamos sem queijo
        // Se newProduct contiver id, usamos, senão geramos um ID temporário
        if (newProduct && newProduct.id) {
            products.push(newProduct);
        } else {
            // adicionar objeto com os campos que temos
            products.push({
                id: newProduct && newProduct.id ? newProduct.id : Date.now(),
                nome: productBody.nome,
                preco: productBody.preco,
                descricao: productBody.descricao,
                aisleId: productBody.aisleId,
                shelfId: productBody.shelfId
            });
        }

        await loadProductsList();
        document.getElementById('addProductForm').reset();
        alert('Produto adicionado com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar produto: ' + (error.message || error));
    }
}

async function loadProductsList() {
    const container = document.getElementById('productsList');

    try {
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="empty-message">Nenhum produto cadastrado</p>';
            return;
        }

        container.innerHTML = products.map(product => {
            const corridor = corridors.find(c => c.id === product.aisleId || c.id === product.corridorId);
            const shelf = shelves.find(s => s.id === product.shelfId);

            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${product.nome}</div>
                        <div class="item-price">€${parseFloat(product.preco).toFixed(2)}</div>
                    </div>
                    <div class="item-description">${product.descricao}</div>
                    <div class="item-meta">
                        ${corridor ? `<span class="badge badge-primary">Corredor: ${corridor.name}</span>` : ''}
                        ${shelf ? `<span class="badge badge-primary">Prateleira: ${shelf.name}</span>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-edit btn-small" onclick="editProduct(${product.id})">Editar</button>
                        <button class="btn btn-danger btn-small" onclick="deleteProductConfirm(${product.id})">Apagar</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p class="empty-message">Erro ao carregar produtos</p>';
        console.error('Erro ao carregar produtos:', error);
    }
}

async function editProduct(id) {
    const product = products.find(p => p.id === id) || { nome: '' };
    const newNome = prompt('Novo nome:', product.nome || '');

    if (newNome && newNome.trim()) {
        const newPreco = prompt('Novo preço:', product.preco || '0');
        const newDesc = prompt('Nova descrição:', product.descricao || '');

        if (newPreco !== null && newDesc !== null) {
            try {
                await updateProduct({
                    id: id,
                    nome: newNome,
                    preco: parseFloat(newPreco),
                    descricao: newDesc,
                    aisleId: product.aisleId,
                    shelfId: product.shelfId
                });

                // atualizar localmente e recarregar
                const idx = products.findIndex(p => p.id === id);
                if (idx >= 0) {
                    products[idx].nome = newNome;
                    products[idx].preco = parseFloat(newPreco);
                    products[idx].descricao = newDesc;
                }

                await loadProductsList();
                alert('Produto atualizado com sucesso!');
            } catch (error) {
                alert('Erro ao atualizar produto: ' + (error.message || error));
            }
        }
    }
}

async function deleteProductConfirm(id) {
    if (!confirm('Tem a certeza que deseja apagar este produto?')) return;

    try {
        await deleteProduct(id);
        // remover localmente
        products = products.filter(p => p.id !== id);
        await loadProductsList();
        alert('Produto apagado com sucesso!');
    } catch (error) {
        alert('Erro ao apagar produto: ' + (error.message || error));
    }
}

// ============================================
// IMAGEM DA LOJA
// ============================================

function handleUploadImage(event) {
    event.preventDefault();

    const fileInput = document.getElementById('storeImageInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecione uma imagem');
        return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Por favor, selecione uma imagem PNG ou JPG');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        setStoreMapImage(imageData);

        const uploadedImage = document.getElementById('uploadedMapImage');
        const uploadedPlaceholder = document.getElementById('uploadedMapPlaceholder');

        if (uploadedImage) {
            uploadedImage.src = imageData;
            uploadedImage.style.display = 'block';
        }
        if (uploadedPlaceholder) uploadedPlaceholder.style.display = 'none';

        alert('Imagem carregada com sucesso!');
        fileInput.value = '';
    };

    reader.readAsDataURL(file);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function loadShelvesSelects() {
    const shelfCorridorSelect = document.getElementById('shelfCorridor');
    if (shelfCorridorSelect) {
        shelfCorridorSelect.innerHTML = '<option value="">Selecione um corredor</option>' +
            corridors.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    const productCorridorSelect = document.getElementById('productCorridor');
    if (productCorridorSelect) {
        productCorridorSelect.innerHTML = '<option value="">Nenhum</option>' +
            corridors.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    const productShelfSelect = document.getElementById('productShelf');
    if (productShelfSelect) {
        productShelfSelect.innerHTML = '<option value="">Nenhuma</option>' +
            shelves.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
}
