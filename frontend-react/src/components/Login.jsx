import React, { useState } from 'react';
import { apiService } from '../Services/api';

const Login = ({ onLoginSuccess, onNavigateToRegister }) => {
    // Estados para controlar os inputs e mensagens
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            // 1. Chama a função que criámos no api.js
            const user = await apiService.login(nome);

            // 2. Valida a senha (como fazias no auth.js antigo)
            if (user && user.senha === senha) {
                // Definimos o role se não vier do banco (admin vs lojista)
                const userWithRole = {
                    ...user,
                    role: user.nome.toLowerCase() === 'admin' ? 'admin' : 'lojista'
                };
                
                // 3. Avisa o App.jsx que o login foi um sucesso
                onLoginSuccess(userWithRole);
            } else {
                setErro('Palavra-passe incorreta!');
            }
        } catch (err) {
            setErro('Utilizador não encontrado ou erro de ligação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo">🛒</div>
                <h1>Supermarket Finder</h1>
                
                <form onSubmit={handleSubmit} className="form">
                    {erro && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{erro}</p>}
                    
                    <div className="form-group">
                        <label>Nome de Utilizador</label>
                        <input
                            type="text"
                            placeholder="Introduza o seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Palavra-passe</label>
                        <input
                            type="password"
                            placeholder="Introduza a sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>

                <p className="form-footer">
                    Ainda não tem conta?{' '}
                    <button 
                        onClick={onNavigateToRegister} 
                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Registar-se
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;