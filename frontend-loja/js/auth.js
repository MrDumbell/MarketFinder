/* ============================================
   AUTENTICAÇÃO - INTEGRAÇÃO COM API
   ============================================ */

let currentUser = null;

/**
 * Fazer login do utilizador
 */
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // CHAMADA À API via função central em data.js
        const user = await getUserByName(username);

        if (user && user.senha === password) {
            const inferredRole = user.role ? user.role : (user.nome === 'admin' ? 'admin' : 'lojista');
            user.role = inferredRole;
            // normalizar id retornado pelo backend (UserResponse usa idUser)
            if (user.idUser && !user.id) user.id = user.idUser;
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert('Login realizado com sucesso!');

            // Redirecionar para a página apropriada
            if (user.role === 'admin') {
                loadPage('admin');
            } else if (user.role === 'lojista') {
                loadPage('lojista');
            } else {
                loadPage('cliente');
            }
        } else {
            alert('Nome de utilizador ou senha inválidos!');
        }
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }

    document.getElementById('loginForm').reset();
}

/**
 * Fazer registo de novo utilizador
 */
async function handleRegistar(event) {
    event.preventDefault();

    const nome = document.getElementById('registarNome').value;
    const email = document.getElementById('registarEmail').value;
    const password = document.getElementById('registarPassword').value;
    const confirmPassword = document.getElementById('registarConfirmPassword').value;

    // Validações
    if (password !== confirmPassword) {
        alert('As senhas não correspondem!');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    try {
        // CHAMADA À API via função central em data.js
        const newUser = await registerUser({
            nome: nome,
            email: email,
            senha: password,
            role: 'lojista'
        });

        // Fazer login automático
        // normalizar id retornado (idUser -> id)
        if (newUser && newUser.idUser && !newUser.id) newUser.id = newUser.idUser;
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        alert('Conta criada com sucesso!');

        // Redirecionar para página de lojista
        loadPage('lojista');

        document.getElementById('registarForm').reset();
    } catch (error) {
        alert('Erro ao criar conta: ' + error.message);
    }
}

/**
 * Fazer logout do utilizador
 */
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    loadPage('login');
}

/**
 * Verificar se há utilizador autenticado ao carregar a página
 */
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        // Redirecionar para a página apropriada
        if (currentUser.role === 'admin') {
            loadPage('admin');
        } else if (currentUser.role === 'lojista') {
            loadPage('lojista');
        } else {
            loadPage('cliente');
        }
    } else {
        loadPage('login');
    }
}

// Observação: getUserByName e registerUser são fornecidos por data.js para evitar duplicação
