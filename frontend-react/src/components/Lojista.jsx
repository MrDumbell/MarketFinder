import React, { useState, useEffect } from 'react';
import { apiService } from '../Services/api';

const Lojista = ({ user, onLogout }) => {
    // --- ESTADOS ---
    const [viewMode, setViewMode] = useState('gestao'); // 'gestao' ou 'cliente'
    const [activeTab, setActiveTab] = useState('corredores');
    
    // Dados da Loja
    const [corredores, setCorredores] = useState([]);
    const [prateleiras, setPrateleiras] = useState([]);
    const [produtos, setProdutos] = useState([]);
    
    // Configuração da Loja (Mapa)
    // Inicializa com um placeholder ou imagem padrão
    const DEFAULT_MAP = 'https://via.placeholder.com/800x600?text=Nenhum+Mapa+Configurado';

// 2. Estado inicial usa o default
const [lojaConfig, setLojaConfig] = useState({ 
    mapaUrl: DEFAULT_MAP 
});

    // Formulários
    const [novoCorredor, setNovoCorredor] = useState('');
    const [novaPrateleira, setNovaPrateleira] = useState({ nome: '', idCorredor: '' });
    const [novoProduto, setNovoProduto] = useState({ nome: '', preco: '', idCorredor: '', idPrateleira: '' });
    
    // Feedback
    const [notification, setNotification] = useState(null); 

    // Busca Cliente
    const [busca, setBusca] = useState('');
    const [produtoEncontrado, setProdutoEncontrado] = useState(null);

    useEffect(() => {
        carregarTudo();
    }, []);

    // --- HELPER: Buscar Nomes por ID ---
    // Esta função cruza os IDs do produto com as listas de Corredores e Prateleiras
    const getLocationInfo = (prod) => {
        // Encontra o corredor
        const corr = corredores.find(c => c.id === (prod.idCorredor || prod.corredorId));
        // Encontra a prateleira
        const prat = prateleiras.find(p => p.id === (prod.idPrateleira || prod.prateleiraId));

        return {
            nomeCorredor: corr ? (corr.name || corr.nome) : 'N/A',
            nomePrateleira: prat ? (prat.name || prat.nome) : 'N/A'
        };
    };

    const showNotify = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const carregarTudo = async () => {
        try {
            const [c, p, prod] = await Promise.all([
                apiService.getCorredores(),
                apiService.getPrateleiras(),
                apiService.getProducts()
            ]);
            setCorredores(Array.isArray(c) ? c : []);
            setPrateleiras(Array.isArray(p) ? p : []);
            setProdutos(Array.isArray(prod) ? prod : []);
        } catch (error) {
            console.error("Erro ao carregar:", error);
            showNotify('error', 'Falha ao carregar dados.');
        }
    };

    // --- FUNÇÕES DE DELETE (Mantidas) ---
    const handleDeleteCorredor = async (id) => {
        if (!window.confirm("Apagar este corredor?")) return;
        try {
            await apiService.deleteCorredor(id);
            setCorredores(corredores.filter(c => c.id !== id));
            showNotify('success', 'Corredor apagado!');
        } catch (error) { showNotify('error', 'Erro ao apagar.'); }
    };
    const handleDeletePrateleira = async (id) => {
        if (!window.confirm("Apagar esta prateleira?")) return;
        try {
            await apiService.deletePrateleira(id);
            setPrateleiras(prateleiras.filter(p => p.id !== id));
            showNotify('success', 'Prateleira apagada!');
        } catch (error) { showNotify('error', 'Erro ao apagar.'); }
    };
    const handleDeleteProduto = async (id) => {
        if (!window.confirm("Apagar este produto?")) return;
        try {
            await apiService.deleteProduct(id);
            setProdutos(produtos.filter(p => p.id !== id));
            showNotify('success', 'Produto apagado!');
        } catch (error) { showNotify('error', 'Erro ao apagar.'); }
    };

    // --- FUNÇÕES DE CREATE (Mantidas) ---
    const handleAddCorredor = async (e) => {
        e.preventDefault();
        try {
            await apiService.createCorredor({ nome: novoCorredor });
            showNotify('success', 'Corredor criado!');
            setNovoCorredor('');
            carregarTudo();
        } catch (err) { showNotify('error', 'Erro ao criar corredor.'); }
    };

    const handleAddPrateleira = async (e) => {
        e.preventDefault();
        try {
            if (!novaPrateleira.idCorredor) throw new Error("Selecione um corredor!");
            await apiService.createPrateleira({
                nome: novaPrateleira.nome,
                idCorredor: parseInt(novaPrateleira.idCorredor)
            });
            showNotify('success', 'Prateleira criada!');
            setNovaPrateleira({ nome: '', idCorredor: '' });
            carregarTudo();
        } catch (err) { showNotify('error', err.message); }
    };

    const handleAddProduto = async (e) => {
        e.preventDefault();
        try {
            const { nome, preco, idCorredor, idPrateleira } = novoProduto;
            if(!idCorredor || !idPrateleira) throw new Error("Localização incompleta!");
            await apiService.createProduct({
                nome,
                preco: parseFloat(preco),
                idCorredor: parseInt(idCorredor),
                idPrateleira: parseInt(idPrateleira)
            });
            showNotify('success', 'Produto criado!');
            setNovoProduto({ nome: '', preco: '', idCorredor: '', idPrateleira: '' });
            carregarTudo();
        } catch (err) { showNotify('error', 'Erro ao criar produto.'); }
    };

    // --- UPLOAD DE MAPA ---
    const handleMapUpload = (e) => {
    const file = e.target.files[0];

    // Se o utilizador cancelar a janela de seleção
    if (!file) return;

    // VALIDAÇÃO: Verifica se o tipo do ficheiro começa por "image/" (ex: image/svg+xml, image/png)
    if (!file.type.startsWith('image/')) {
        showNotify('error', 'Formato inválido! Por favor carrega apenas imagens (SVG, PNG, JPG).');
        e.target.value = ''; // Limpa o input para permitir tentar de novo
        return;
    }

    try {
        // Cria o URL temporário
        const tempUrl = URL.createObjectURL(file);
        setLojaConfig({ ...lojaConfig, mapaUrl: tempUrl });
        showNotify('success', 'Novo mapa carregado com sucesso!');
    } catch (err) {
        console.error(err);
        showNotify('error', 'Erro ao processar o ficheiro de imagem.');
    }
};

// --- NOVA FUNÇÃO PARA REMOVER MAPA ---
const handleRemoveMap = () => {
    if (!window.confirm("Tens a certeza que queres remover o mapa atual?")) return;
    
    // Volta ao placeholder padrão
    setLojaConfig({ ...lojaConfig, mapaUrl: DEFAULT_MAP });
    
    // Limpa o input de ficheiros (caso queiras carregar o mesmo ficheiro depois)
    const fileInput = document.getElementById('mapUploadInput');
    if (fileInput) fileInput.value = '';

    showNotify('info', 'Mapa removido. Restaurado o padrão.');
};

    // --- BUSCA CLIENTE ---
    const handleClientSearch = (e) => {
        e.preventDefault();
        const found = produtos.find(p => {
            const pName = p.name || p.nome || '';
            return pName.toLowerCase().includes(busca.toLowerCase());
        });

        if (found) {
            setProdutoEncontrado(found);
            const loc = getLocationInfo(found);
            // Mensagem mais rica
            showNotify('success', `Encontrado: ${loc.nomeCorredor} > ${loc.nomePrateleira}`);
        } else {
            setProdutoEncontrado(null);
            showNotify('error', 'Produto não encontrado.');
        }
    };

    return (
        <div className="dashboard-wrapper">
            {notification && (
                <div className={`notification-toast ${notification.type}`}>
                    {notification.type === 'success' ? '✅' : '❌'} {notification.text}
                </div>
            )}

            <header className="glass-header">
                <div className="brand">
                    <h1>Supermarket <span>{viewMode === 'gestao' ? 'Manager' : 'Finder'}</span></h1>
                </div>
                <div className="controls" style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="btn-primary" 
                        style={{ background: viewMode === 'gestao' ? '#ec4899' : '#4f46e5' }}
                        onClick={() => setViewMode(viewMode === 'gestao' ? 'cliente' : 'gestao')}
                    >
                        {viewMode === 'gestao' ? '👁️ Ir para Modo Cliente' : '⚙️ Voltar à Gestão'}
                    </button>
                    <button className="btn-icon" onClick={onLogout} title="Sair">🚪</button>
                </div>
            </header>

            {viewMode === 'gestao' ? (
                <>
                    <nav className="glass-tabs">
                        <button className={`tab-btn ${activeTab === 'corredores' ? 'active' : ''}`} onClick={() => setActiveTab('corredores')}>🛣️ Corredores</button>
                        <button className={`tab-btn ${activeTab === 'prateleiras' ? 'active' : ''}`} onClick={() => setActiveTab('prateleiras')}>📚 Prateleiras</button>
                        <button className={`tab-btn ${activeTab === 'produtos' ? 'active' : ''}`} onClick={() => setActiveTab('produtos')}>🍎 Produtos</button>
                        {/* NOVA ABA CONFIGURAÇÕES */}
                        <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>⚙️ Config</button>
                    </nav>

                    <main className="animate-fade">
                        {activeTab === 'corredores' && (
                            <div className="glass-card">
                                <h3>Gerir Corredores</h3>
                                <form onSubmit={handleAddCorredor} className="floating-form">
                                    <input value={novoCorredor} onChange={e => setNovoCorredor(e.target.value)} placeholder="Nome do Corredor" required />
                                    <button type="submit" className="btn-primary">Adicionar</button>
                                </form>
                                <div style={{marginTop: '20px'}} className="space-y-2">
                                    {corredores.map(c => (
                                        <div key={c.id} className="list-item" style={{display:'flex', justifyContent:'space-between'}}>
                                            <strong>{c.name || c.nome}</strong>
                                            <button onClick={() => handleDeleteCorredor(c.id)} className="btn-icon" style={{color:'red'}}>🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'prateleiras' && (
                            <div className="glass-card">
                                <h3>Gerir Prateleiras</h3>
                                <form onSubmit={handleAddPrateleira} className="floating-form">
                                    <input value={novaPrateleira.nome} onChange={e => setNovaPrateleira({...novaPrateleira, nome: e.target.value})} placeholder="Nome da Prateleira" required />
                                    <select value={novaPrateleira.idCorredor} onChange={e => setNovaPrateleira({...novaPrateleira, idCorredor: e.target.value})} required>
                                        <option value="">Escolha o Corredor</option>
                                        {corredores.map(c => <option key={c.id} value={c.id}>{c.name || c.nome}</option>)}
                                    </select>
                                    <button type="submit" className="btn-primary">Adicionar</button>
                                </form>
                                <div style={{marginTop: '20px'}}>
                                    {prateleiras.map(p => {
                                        // Busca nome do corredor para mostrar na lista
                                        const cNome = corredores.find(c => c.id === p.idCorredor)?.name || corredores.find(c => c.id === p.idCorredor)?.nome || 'N/A';
                                        return (
                                            <div key={p.id} className="list-item" style={{display:'flex', justifyContent:'space-between'}}>
                                                <div>
                                                    <strong>{p.name || p.nome}</strong>
                                                    <span className="tag">Em: {cNome}</span>
                                                </div>
                                                <button onClick={() => handleDeletePrateleira(p.id)} className="btn-icon" style={{color:'red'}}>🗑️</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'produtos' && (
                            <div className="glass-card">
                                <h3>Gerir Produtos</h3>
                                <form onSubmit={handleAddProduto} className="floating-form">
                                    <input value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} placeholder="Nome" required />
                                    <input type="number" value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})} placeholder="Preço" required />
                                    <select value={novoProduto.idCorredor} onChange={e => setNovoProduto({...novoProduto, idCorredor: e.target.value})} required>
                                        <option value="">Corredor...</option>
                                        {corredores.map(c => <option key={c.id} value={c.id}>{c.name || c.nome}</option>)}
                                    </select>
                                    <select value={novoProduto.idPrateleira} onChange={e => setNovoProduto({...novoProduto, idPrateleira: e.target.value})} required>
                                        <option value="">Prateleira...</option>
                                        {prateleiras
                                            .filter(p => (p.idCorredor || p.corredorId) == novoProduto.idCorredor)
                                            .map(p => <option key={p.id} value={p.id}>{p.name || p.nome}</option>)
                                        }
                                    </select>
                                    <button type="submit" className="btn-primary">Salvar</button>
                                </form>
                                <div style={{marginTop: '20px'}}>
                                    {produtos.map(p => {
                                        // AQUI ESTÁ A ALTERAÇÃO: Mostra Corredor e Prateleira
                                        const loc = getLocationInfo(p);
                                        return (
                                            <div key={p.id} className="list-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                <div>
                                                    <div style={{fontWeight:'bold'}}>{p.name || p.nome}</div>
                                                    <div style={{fontSize:'0.85em', color:'#666', marginTop:'4px'}}>
                                                        📍 {loc.nomeCorredor} &gt; {loc.nomePrateleira}
                                                    </div>
                                                </div>
                                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                                    <span className="tag">{p.preco}€</span>
                                                    <button onClick={() => handleDeleteProduto(p.id)} className="btn-icon" style={{color:'red'}}>🗑️</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* NOVA ABA: CONFIGURAÇÃO DO MAPA */}
                      
{activeTab === 'config' && (
    <div className="glass-card">
        <h3>Configuração da Loja</h3>
        
        <div className="floating-form">
            <label style={{display:'block', marginBottom:'10px', fontWeight:'bold'}}>Carregar Mapa da Loja:</label>
            
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <input 
                    id="mapUploadInput"
                    type="file" 
                    accept="image/*,.svg" 
                    onChange={handleMapUpload}
                    style={{
                        padding:'10px', 
                        border:'1px solid #ddd', 
                        borderRadius:'8px', 
                        flex: 1, // Ocupa o espaço disponível
                        cursor: 'pointer'
                    }}
                />
                
                {/* Botão Remover: Só aparece se o mapa NÃO for o padrão */}
                {lojaConfig.mapaUrl !== DEFAULT_MAP && (
                    <button 
                        onClick={handleRemoveMap}
                        className="btn-primary"
                        style={{background: '#ef4444', border: 'none'}} // Vermelho
                        title="Remover mapa atual"
                    >
                        🗑️ Remover
                    </button>
                )}
            </div>

            <p style={{fontSize:'0.8em', color:'#666', marginTop:'8px'}}>
                ⚠️ <strong>Nota:</strong> Aceita apenas ficheiros de imagem (SVG, PNG, JPG).
                Recomendamos SVG para melhor qualidade.
            </p>
        </div>

        <div style={{marginTop:'30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
            <h4 style={{marginBottom: '10px'}}>Pré-visualização atual:</h4>
            
            <div style={{
                border: '2px dashed #ccc', 
                borderRadius: '12px', 
                padding: '10px', 
                background: '#f9f9f9',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '200px',
                alignItems: 'center'
            }}>
                <img 
                    src={lojaConfig.mapaUrl} 
                    alt="Preview Mapa" 
                    style={{
                        maxWidth:'100%', 
                        maxHeight: '400px',
                        objectFit: 'contain', // Garante que a imagem não distorce
                        borderRadius:'8px' 
                    }} 
                />
            </div>
        </div>
    </div>
)}
                    </main>
                </>
            ) : (
                /* --- MODO CLIENT VIEW --- */
                <main className="animate-fade">
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <h2>Olá, cliente! O que procura hoje?</h2>
                        <form onSubmit={handleClientSearch} style={{ maxWidth: '500px', margin: '20px auto', display: 'flex', gap: '10px' }}>
                            <input 
                                value={busca} 
                                onChange={e => setBusca(e.target.value)} 
                                placeholder="Ex: Leite, Bolachas..." 
                                style={{ fontSize: '1.2rem', padding: '15px' }}
                            />
                            <button type="submit" className="btn-primary">🔍</button>
                        </form>
                    </div>

                    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', minHeight:'300px' }}>
                        {/* Mostra o Mapa Configurado */}
                        <img 
                            src={lojaConfig.mapaUrl} 
                            alt="Mapa da Loja" 
                            style={{ maxWidth: '100%', borderRadius: '12px', opacity: produtoEncontrado ? 1 : 0.8 }} 
                        />
                        
                        {produtoEncontrado && (() => {
                            // Calcula nomes para mostrar no PIN
                            const loc = getLocationInfo(produtoEncontrado);
                            return (
                                <div className="pin" style={{ 
                                    position: 'absolute', 
                                    top: '50%', left: '50%', 
                                    transform: 'translate(-50%, -100%)',
                                    animation: 'bounce 1s infinite'
                                }}>
                                    <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))' }}>📍</div>
                                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', boxShadow:'0 4px 15px rgba(0,0,0,0.2)' }}>
                                        <div style={{fontWeight:'bold', color:'#ec4899'}}>{produtoEncontrado.name || produtoEncontrado.nome}</div>
                                        <div style={{fontSize:'0.9em', color:'#333', marginTop:'5px'}}>
                                            {loc.nomeCorredor} <br/> 
                                            <span style={{color:'#666', fontSize:'0.85em'}}>{loc.nomePrateleira}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </main>
            )}
        </div>
    );
};

export default Lojista;