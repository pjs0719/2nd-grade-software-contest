// 필요한 라이브러리 및 이미지 가져오기
import React, { useState, useEffect, useRef } from "react";
import './chat.css'; // 스타일 파일 가져오기
import { useNavigate } from "react-router-dom"; // React Router에서 사용하는 네비게이션 훅 가져오기
import backlogo from './img/backlogo.svg'; // 이미지 가져오기
import mainimg from './img/mainimg.png'; // 이미지 가져오기
import TypingIndicator from "./TypingIndicator"; // TypingIndicator 컴포넌트 가져오기

const Chat = () => {
  
  const navigate = useNavigate(); // React Router의 네비게이션 함수 가져오기

  // 메시지 배열 상태를 초기화합니다.
  const [messages, setMessages] = useState([]);

  // 사용자 입력을 저장하는 상태를 초기화합니다.
  const [input, setInput] = useState("");

  const apiKey = "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"; // OpenAI API 키
  const [isSending, setIsSending] = useState(false); // 메시지 전송 중 여부를 추적할 상태

  const chatContentRef = useRef(null); // 채팅 창의 DOM 요소를 참조하기 위한 ref

  // 토큰이 있다면 저장된 채팅을 불러옵니다.
  useEffect(() => {
    if (localStorage.getItem('token')) {
        fetch('http://localhost:5002/get_chats', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.chats && data.chats.length > 0) {
                setMessages(data.chats);
            } else {
                setMessages([{
                    sender: "AI Chatbot",
                    message: "안녕하세요! 한신대 챗봇 도우미 한챗이에요! 무엇을 도와드릴까요?",
                }]);
            }
        });
    }
  }, []);


  // 채팅 창을 가장 아래로 스크롤하는 함수
  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  };

  // 메시지를 추가하는 함수
  const addMessage = (sender, message) => {
    const newMessage = { sender, message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    scrollToBottom();
  };

  // OpenAI GPT-3 API로부터 응답을 가져오는 함수
  const fetchGPTResponse = (userInput) => {
    const data = {
      model: 'ft:gpt-3.5-turbo-0613:jilesan::8FdVF5tU',
      temperature: 0.5,
      n: 1,
      messages: [
        { role: 'system', content: "HANSHIN UNIVERSITY Assistant Bot." },
        { role: 'user', content: userInput + '에 대하여 학습 데이터를 기반으로 알려주세요' }
      ],
    };

    return fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => data.choices[0].message.content)
      .catch(error => {
        console.error(error);
        return "죄송해요, 에러가 발생했어요.";
      });
  };

  // 메시지 전송 버튼 클릭 시 호출되는 함수
  const handleSendMessage = async () => {
    if (isSending) {
      return;
    }

    setIsSending(true);

    const userInput = input.trim();

    if (userInput === "") {
      setIsSending(false);
      return;
    }

    addMessage("User", userInput);

    // 타이핑 상태로 변경
    addMessage("AI Chatbot", <TypingIndicator />);
    
    try {
      const response = await fetchGPTResponse(userInput);

      // "답변을 작성중"을 GPT의 실제 답변으로 대체
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const typingMessageIndex = updatedMessages.findIndex(
          (msg) => msg.sender === "AI Chatbot" && typeof msg.message === "object"
        );
        if (typingMessageIndex !== -1) {
          updatedMessages[typingMessageIndex] = {
            sender: "AI Chatbot",
            message: response,
          };
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error(error);
      addMessage("AI Chatbot", "죄송해요, 에러가 발생했어요.");
    }

    setInput(""); // 메시지를 보낸 후 input 칸을 빈 상태로 만듭니다
    setIsSending(false);
  };

  // 입력 필드 내용이 변경될 때 호출되는 함수
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  // 엔터 키 입력 시 메시지 전송 함수 호출
  const handleInputKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  // 채팅 창의 높이를 동적으로 조정하는 부분
  useEffect(() => {
    const adjustChatContentHeight = () => {
      const chatContent = chatContentRef.current;
      const windowHeight = window.innerHeight;
      const chatContentTop = chatContent.getBoundingClientRect().top;
      const newHeight = windowHeight - chatContentTop;
      chatContent.style.height = newHeight - 45 + 'px';
      scrollToBottom();
    };

    window.addEventListener('resize', adjustChatContentHeight);
    adjustChatContentHeight();

    return () => {
      window.removeEventListener('resize', adjustChatContentHeight);
    };
  }, []);

  // 새로운 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 토큰이 있다면 저장된 채팅을 불러옵니다.
  useEffect(() => {
    if (localStorage.getItem('token')) {
        fetch('http://localhost:5002/get_chats', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.chats && data.chats.length > 0) {
                setMessages(data.chats);
            } else {
                setMessages([{
                    sender: "AI Chatbot",
                    message: "안녕하세요! 한신대 챗봇 도우미 한챗이에요! 무엇을 도와드릴까요?",
                }]);
            }
        });
    }
  }, []);

  return (
    <div>
      <div className="top-backcolor">
        <img className="back-logo" src={backlogo} width='30px' height='35px'
        onClick={() => { navigate('/'); }}></img>
        <span className="chat-name">한챗이</span>
        <span className="chat-main-img">
          <img className="chat-main" src={mainimg} width='40px' alt="AI"></img>
        </span>
      </div>
      <div className="chat-content" ref={chatContentRef}>
        {messages.map((message, index) => (
          <div className="line" key={index}>
            <span className={`chat-box ${message.sender === "User" ? "user-message" : "ai-message"}`}>
              {typeof message.message === "string" ? message.message : <TypingIndicator />}
            </span>
          </div>
        ))}
      </div>
      <input
        className="chat-box"
        id="input"
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
        placeholder="궁금한 모든 것을 물어보세요"
      />
    </div>
  );
};

export default Chat;
