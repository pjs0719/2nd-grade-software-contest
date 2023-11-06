import React, { useState } from 'react';
import hanshinlogo from './img/hanshinlogo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [displaySignIn, setDisplaySignIn] = useState(true);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    setDisplaySignIn(false);
  };

  const handleSignInClick = () => {
    setDisplaySignIn(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "id") {
      setId(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleLogin = () => {
    fetch('http://localhost:5002/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          alert("로그인 성공!");
          navigate('/chat');  // 페이지 전환
        } else {
          alert("다시 확인하세요.");
        }
      });
  };

  const handleRegister = () => {
    fetch('http://localhost:5002/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "User registered successfully!") {
          alert("회원가입 성공!");
          handleSignInClick();  // 회원가입 후 로그인 화면으로 전환
        } else {
          alert(data.message);
        }
      });
  };

    return (
      <div className="container">
        <div className="welcome">
          <div className="loginbox" style={{ transform: displaySignIn ? 'translateX(0%)' : 'translateX(80%)' }}>
            <div className={displaySignIn ? 'signin' : 'signup nodisplay'}>
              <h1>sign in</h1>
              <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <input className="input2" type="text" placeholder="ID" name="id" value={id} onChange={handleInputChange} />
                <input className="input2" type="password" placeholder="password" name="password" value={password} onChange={handleInputChange} />
                <button className="button submit">login</button>
              </form>
            </div>
            <div className={displaySignIn ? 'signup nodisplay' : 'signup'}>
              <h1>register</h1>
              <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                <input className="input2" type="text" placeholder="ID" name="id" value={id} onChange={handleInputChange} />
                <input className="input2" type="password" placeholder="password" name="password" value={password} onChange={handleInputChange} />
                <button className="button submit">create account</button>
              </form>
            </div>
          </div>
          <div className="leftbox">
            <h2 className="title"><span className="span2">한신대학교</span><br />ChatBot</h2>
            <p className="desc"><span className="span2">한챗봇</span>과 이야기를 나누세요.</p>
            <img className="hanshinlogo" src={hanshinlogo} alt="hanshinlogo" />
            <p className="account">계정이 있으신가요?</p>
            <button className="button" onClick={handleSignInClick} id="signin">
              {displaySignIn ? 'login' : 'sign in'}
            </button>
          </div>
          <div className="rightbox">
           <h2 className="title"><span className="span2">한신대학교</span><br />ChatBot</h2>
            <p className="desc"><span className="span2">한챗봇</span>과 이야기를 나누세요.</p>
            <img className="hanshinlogo" src={hanshinlogo} alt="hanshinlogo" />
            <p className="account">계정이 없으신가요?</p>
            <button className="button" onClick={handleSignUpClick} id="signup">
              {displaySignIn ? 'sign up' : 'login'}
            </button>
          </div>
        </div>
      </div>
    );
  };

export default Login;
