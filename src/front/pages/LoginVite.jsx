import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// Note: popups/modal components were removed for brevity. Replace with your modal implementations if needed.
export default function LoginVite() {
  const [activePage, setActivePage] = useState('login');
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [nomeRegister, setNomeRegister] = useState('');
  const [emailRegister, setEmailRegister] = useState('');
  const [senhaRegister, setSenhaRegister] = useState('');
  const [dataNascimentoRegister, setDataNascimentoRegister] = useState('');
  const [mensagemReg, setMensagemReg] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const navigate = useNavigate();

  const registraUser = async () => {
    if (!nomeRegister.trim() || !emailRegister.trim() || !senhaRegister.trim() || !dataNascimentoRegister.trim()) {
      setMensagemReg('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const response = await fetch('/api/register/registeruser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeRegister,
          email: emailRegister,
          senha: senhaRegister,
          data_nascimento: dataNascimentoRegister,
          classe: 'aluno',
        }),
      });

      if (response.ok) {
        setMensagemReg('Parabéns! Sua conta foi registrada com sucesso!');
        return;
      } else if (response.status === 400) {
        const data = await response.json();
        setMensagemReg(data.error || 'Dados inválidos');
        return;
      } else {
        setMensagemReg('Infelizmente sua conta não foi registrada... Verifique os dados e tente novamente!');
        return;
      }
    } catch (error) {
      setMensagemReg('Erro de conexão com o servidor.');
      return;
    }
  };

  const efetuarLogin = async () => {
    if (!emailLogin.trim() || !senhaLogin.trim()) {
      setMensagemReg('Por favor, preencha todos os campos obrigatórios!');
      setMostrarModalLogin(true);
      return;
    }

    try {
      const response = await fetch('/api/login/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogin, password: senhaLogin }),
      });

      if (response.ok) {
        const meResponse = await fetch('/api/me/me');
        if (meResponse.ok) {
          const userInfo = await meResponse.json();
          if (userInfo.classe === 'admin') {
            navigate('/admHomePage');
          } else if (userInfo.classe === 'aluno') {
            navigate('/home');
          } else {
            setMensagemReg('Erro de conexão com o servidor.');
            setMostrarModalLogin(true);
            return;
          }
        } else {
          setMensagemReg('Erro de conexão com o servidor.');
          setMostrarModalLogin(true);
          return;
        }
      } else if (response.status === 400) {
        const data = await response.json();
        setMensagemReg(data.error);
        setMostrarModalLogin(true);
        return;
      }
    } catch (error) {
      setMensagemReg('Erro de conexão com o servidor.');
      setMostrarModalLogin(true);
      return;
    }
  };

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
          <button className={`b-login ${activePage === 'login' ? 'active' : ''}`} onClick={() => setActivePage('login')}>Login</button>
          <button className={`b-register ${activePage === 'register' ? 'active' : ''}`} onClick={() => setActivePage('register')}>Registre-se</button>
        </div>

        <hr className="divisor" />

        <div className="aba-login" style={{ display: activePage === 'login' ? 'block' : 'none' }}>
          <div className="formulario-login">
            <input type="email" placeholder="E-mail" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} />

            <div className="input-senha-login">
              <input type={mostrarSenha ? 'text' : 'password'} placeholder="Senha" value={senhaLogin} onChange={(e) => setSenhaLogin(e.target.value)} />
              <button type="button" className="mostrar-senha" onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </div>

          <div className="complementos">
            <div className="esqueceu-senha-login">
              <label>Esqueceu a senha? <a href="#">Clique aqui</a></label>
            </div>
          </div>

          <div className="botao-entrar">
            <button onClick={() => efetuarLogin()}>Entrar</button>
          </div>
        </div>

        <div className="aba-register" style={{ display: activePage === 'register' ? 'block' : 'none' }}>
          <div className="formulario-register">
            <input type="text" placeholder="Nome" value={nomeRegister} onChange={(e) => setNomeRegister(e.target.value)} />
            <input type="email" placeholder="E-mail" value={emailRegister} onChange={(e) => setEmailRegister(e.target.value)} />

            <div className="input-senha-register">
              <input type={mostrarSenha ? 'text' : 'password'} placeholder="Senha" value={senhaRegister} onChange={(e) => setSenhaRegister(e.target.value)} />
              <button type="button" className="mostrar-senha" onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? 'Ocultar' : 'Mostrar'}</button>
            </div>

            <input type="date" placeholder="Data de nascimento" value={dataNascimentoRegister} onChange={(e) => setDataNascimentoRegister(e.target.value)} />

            <p className="concorda-termos-politicas-user">Ao clicar em "Registrar" você concorda com nossas</p>
            <p className="politicas-termos">
              <a href="#">Políticas de privacidade</a> e <a href="#">Termos de uso</a>
            </p>
          </div>

          <div className="b-registrar">
            <button onClick={() => registraUser()}>Registrar</button>
          </div>
        </div>

        {mostrarModalLogin && (
          <div className="modal-backdrop">
            <div className="modal">
              <p>{mensagemReg || 'Erro'}</p>
              <button onClick={() => setMostrarModalLogin(false)}>Fechar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
