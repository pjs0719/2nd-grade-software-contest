import './App.css';
import { Routes, Route } from 'react-router-dom';
import ChatApp from './chat';
import Login from './login';


function App() {

  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/chat' element={<ChatApp />} />
      </Routes>
    </div>

  );
}

export default App;