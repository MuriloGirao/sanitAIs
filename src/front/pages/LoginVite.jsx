import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function LoginVite() {
  const [activePage, setActivePage]                     = useState('login');
  const [emailLogin, setEmailLogin]                     = useState('');
  const [senhaLogin, setSenhaLogin]                     = useState('');
  const [nomeRegister, setNomeRegister]                 = useState('');
  const [emailRegister, setEmailRegister]               = useState('');
  const [senhaRegister, setSenhaRegister]               = useState('');
  const [dataNascimentoRegister, setDataNascimentoRegister] = useState('');
  const [mensagemReg, setMensagemReg]                   = useState('');
  const [mostrarSenha, setMostrarSenha]                 = useState(false);
  const [mostrarModal, setMostrarModal]                 = useState(false);
  const navigate = useNavigate();

  // ── Registro ──────────────────────────────────────────────────
  const registraUser = async () => {
    if (!nomeRegister.trim() || !emailRegister.trim() ||
        !senhaRegister.trim() || !dataNascimentoRegister.trim()) {
      setMensagemReg('Por favor, preencha todos os campos obrigatórios!');
      setMostrarModal(true);
      return;
    }

    try {
      const response = await fetch('/api/register/registeruser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:             nomeRegister,
          email:            emailRegister,
          senha:            senhaRegister,
          data_nascimento:  dataNascimentoRegister,
          classe:           'aluno',
        }),
      });

      if (response.ok) {
        setMensagemReg('Parabéns! Sua conta foi registrada com sucesso!');
        setMostrarModal(true);
        setActivePage('login');   // redireciona para aba de login
      } else {
        const data = await response.json();
        setMensagemReg(data.detail || 'Dados inválidos. Verifique e tente novamente.');
        setMostrarModal(true);
      }
    } catch {
      setMensagemReg('Erro de conexão com o servidor.');
      setMostrarModal(true);
    }
  };

  // ── Login ─────────────────────────────────────────────────────
  const efetuarLogin = async () => {
    if (!emailLogin.trim() || !senhaLogin.trim()) {
      setMensagemReg('Por favor, preencha todos os campos obrigatórios!');
      setMostrarModal(true);
      return;
    }

    try {
      // 1) autentica e recebe o JWT
      const loginRes = await fetch('/api/login/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogin, password: senhaLogin }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json();
        setMensagemReg(data.detail || 'E-mail ou senha incorretos.');
        setMostrarModal(true);
        return;
      }

      const { access_token } = await loginRes.json();
      localStorage.setItem('access_token', access_token);  // ← guarda o token

      // 2) busca perfil do usuário autenticado
      const meRes = await fetch('/api/me/me', {
        headers: { Authorization: `Bearer ${access_token}` },  // ← envia o token
      });

      if (!meRes.ok) {
        setMensagemReg('Erro ao carregar perfil do usuário.');
        setMostrarModal(true);
        return;
      }

      const userInfo = await meRes.json();

      // 3) redireciona conforme a classe
      if (userInfo.classe === 'admin') {
        navigate('/admHomePage');
      } else if (userInfo.classe === 'aluno') {
        navigate('/home');
      } else {
        setMensagemReg('Perfil de usuário desconhecido.');
        setMostrarModal(true);
      }
    } catch {
      setMensagemReg('Erro de conexão com o servidor.');
      setMostrarModal(true);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="pagina-autenticacao">
      <div className="lado-esquerdo no-image">
        <div className="logo-placeholder">Seu logo</div>
      </div>

      <div className="login-register">
        <div className="logo_mobile">
          <div className="logo-placeholder small">Seu logo</div>
        </div>

        <div className="botoes-login-register">
          <button
            className={`b-login ${activePage === 'login' ? 'active' : ''}`}
            onClick={() => setActivePage('login')}
          >Login</button>
          <button
            className={`b-register ${activePage === 'register' ? 'active' : ''}`}
            onClick={() => setActivePage('register')}
          >Registre-se</button>
        </div>

        <hr className="divisor" />

        {/* ── Aba Login ── */}
        <div className="aba-login" style={{ display: activePage === 'login' ? 'block' : 'none' }}>
          <div className="formulario-login">
            <input
              type="email"
              placeholder="E-mail"
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
            />
            <div className="input-senha-login">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Senha"
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
              />
              <button
                type="button"
                className="mostrar-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >{mostrarSenha ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </div>

          <div className="complementos">
            <div className="esqueceu-senha-login">
              <label>Esqueceu a senha? <a href="#">Clique aqui</a></label>
            </div>
          </div>

          <div className="botao-entrar">
            <button onClick={efetuarLogin}>Entrar</button>
          </div>
        </div>

        {/* ── Aba Registro ── */}
        <div className="aba-register" style={{ display: activePage === 'register' ? 'block' : 'none' }}>
          <div className="formulario-register">
            <input
              type="text"
              placeholder="Nome"
              value={nomeRegister}
              onChange={(e) => setNomeRegister(e.target.value)}
            />
            <input
              type="email"
              placeholder="E-mail"
              value={emailRegister}
              onChange={(e) => setEmailRegister(e.target.value)}
            />
            <div className="input-senha-register">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Senha"
                value={senhaRegister}
                onChange={(e) => setSenhaRegister(e.target.value)}
              />
              <button
                type="button"
                className="mostrar-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >{mostrarSenha ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            <input
              type="date"
              placeholder="Data de nascimento"
              value={dataNascimentoRegister}
              onChange={(e) => setDataNascimentoRegister(e.target.value)}
            />
            <p className="concorda-termos-politicas-user">
              Ao clicar em "Registrar" você concorda com nossas
            </p>
            <p className="politicas-termos">
              <a href="#">Políticas de privacidade</a> e <a href="#">Termos de uso</a>
            </p>
          </div>

          <div className="b-registrar">
            <button onClick={registraUser}>Registrar</button>
          </div>
        </div>

        {/* ── Modal de feedback ── */}
        {mostrarModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <p>{mensagemReg}</p>
              <button onClick={() => setMostrarModal(false)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}