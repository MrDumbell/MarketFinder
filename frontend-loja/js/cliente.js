/* ============================================
   CLIENTE - PESQUISA DE PRODUTOS (INTEGRAÇÃO COM API)
   ============================================ */

// Guardar resultados da última pesquisa para facilitar seleção
let lastSearchResults = [];

/**
 * Procurar produtos
 */
async function handleSearch(event) {
    event.preventDefault();

    const query = document.getElementById('searchInput').value || '';

    if (!query.trim()) {
        alert('Por favor, digite um produto para procurar');
        return;
    }

    try {
        // CHAMADA À API:
        // GET /Prod/ProdGet?nome={query}
        const results = await searchProducts(query);
        const arr = Array.isArray(results) ? results : (results ? [results] : []);
        lastSearchResults = arr;

        // Mostrar resultados
        displaySearchResults(arr);
    } catch (error) {
        alert('Erro ao procurar produtos: ' + (error.message || error));
    }
}

/**
 * Mostrar resultados da pesquisa
 */
function displaySearchResults(results) {
    const container = document.getElementById('searchResults');

    if (!results || results.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum produto encontrado</p>';
        return;
    }

    // Criar HTML para cada resultado; guardamos o índice para recuperar o produto
    container.innerHTML = results.map((product, idx) => `
        <div class="result-item" onclick="selectProductIndex(${idx}, this)">
            <div class="item-header">
                <div class="item-title">${product.nome || product.name || ''}</div>
                <div class="item-price">€${(product.preco !== undefined && product.preco !== null) ? parseFloat(product.preco).toFixed(2) : '0.00'}</div>
            </div>
            <div class="item-description">${product.descricao || product.description || ''}</div>
        </div>
    `).join('');
}

/**
 * Selecionar um produto da lista de resultados pelo índice
 */
function selectProductIndex(index, element) {
    // Atualizar visual
    document.querySelectorAll('.result-item').forEach(item => item.classList.remove('selected'));
    if (element) element.classList.add('selected');

    const product = lastSearchResults[index];
    if (!product) return;

    // Mostrar detalhes (a localização pode vir ou não do backend)
    // Normalizar propriedades possíveis
    const normalized = {
        id: product.id || product.ID || null,
        nome: product.nome || product.name || '',
        preco: (product.preco !== undefined && product.preco !== null) ? parseFloat(product.preco).toFixed(2) : (product.price ? parseFloat(product.price).toFixed(2) : '0.00'),
        descricao: product.descricao || product.description || '',
        corridorId: product.corridorId || product.aisleId || product.corredorId || null,
        corridorName: product.corridorName || product.aisleName || product.corredorName || null,
        shelfId: product.shelfId || product.prateleiraId || null,
        shelfName: product.shelfName || product.prateleiraName || null
    };

    displayProductDetails(normalized);
}

/**
 * Mostrar detalhes do produto
 * 
 * NOTA: A localização (Corredor e Prateleira) virá da API quando o backend retornar esses dados no objeto do produto
 */
function displayProductDetails(product) {
    const container = document.getElementById('productDetails');

    const hasCorridor = !!(product.corridorId || product.corridorName);
    const hasShelf = !!(product.shelfId || product.shelfName);

    if (!hasCorridor && !hasShelf) {
        container.innerHTML = `
            <div class="product-details">
                <h3>${product.nome}</h3>
                <p>${product.descricao}</p>
                <p class="item-price">€${product.preco}</p>
                <p class="empty-message">Localização não disponível para este produto</p>
            </div>
        `;
        return;
    }

    // Mostrar informações com localização
    container.innerHTML = `
        <div class="product-details">
            <h3>${product.nome}</h3>
            <p>${product.descricao}</p>
            <p class="item-price">€${product.preco}</p>

            <div class="location-item">
                <div class="location-icon">📍</div>
                <div>
                    <div class="location-label">Corredor</div>
                    <div class="location-value">${product.corridorName || (product.corridorId ? ('#' + product.corridorId) : 'N/A')}</div>
                </div>
            </div>

            <div class="location-item">
                <div class="location-icon">📦</div>
                <div>
                    <div class="location-label">Prateleira</div>
                    <div class="location-value">${product.shelfName || (product.shelfId ? ('#' + product.shelfId) : 'N/A')}</div>
                </div>
            </div>

            <div class="info-box">
                <strong>Dica:</strong> Dirija-se ao corredor e prateleira indicados acima para localizar o produto.
            </div>
        </div>
    `;
}

/**
 * Carregar imagem da loja na view de Cliente
 */
function loadStoreMapInClient() {
    const storeImage = getStoreMapImage();
    const mapImage = document.getElementById('storeMapImage');
    const mapPlaceholder = document.getElementById('storeMapPlaceholder');

    if (storeImage) {
        if (mapImage) {
            mapImage.src = storeImage;
            mapImage.style.display = 'block';
        }
        if (mapPlaceholder) mapPlaceholder.style.display = 'none';
    } else {
        if (mapImage) mapImage.style.display = 'none';
        if (mapPlaceholder) mapPlaceholder.style.display = 'block';
    }
}
