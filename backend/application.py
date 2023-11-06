from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
import secrets

# Flask 앱 초기화
application = Flask(__name__)
# CORS 설정
CORS(application)
# 데이터베이스 설정
application.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
# JWT 비밀 키 설정
application.config['JWT_SECRET_KEY'] = secrets.token_hex(16)

# SQLAlchemy 인스턴스 생성
db = SQLAlchemy(application)
# JWT Manager 인스턴스 생성
jwt = JWTManager(application)

# User 모델 정의
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.String(50), primary_key=True)
    password = db.Column(db.String(50), nullable=False)

# Chat 모델 정의
class Chat(db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'))
    message = db.Column(db.String(500), nullable=False)
    sender = db.Column(db.String(50), nullable=False)

# 로그인 API
@application.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(id=data['id']).first()
    if user and user.password == data['password']:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify(message="Invalid credentials"), 401

# 회원가입 API
@application.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # 중복된 ID를 방지하기 위해 검사
    if User.query.filter_by(id=data['id']).first():
        return jsonify(message="User ID already exists!"), 400
    new_user = User(id=data['id'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(message="User registered successfully!"), 201

# 채팅 내용 저장 API
@application.route('/save_chat', methods=['POST'])
@jwt_required()
def save_chat():
    data = request.get_json()
    user_id = get_jwt_identity() # JWT에서 사용자 ID 가져오기
    new_chat = Chat(user_id=user_id, message=data['message'], sender=data['sender'])
    db.session.add(new_chat)
    db.session.commit()
    return jsonify(message="Chat saved successfully"), 200

# 저장된 채팅 불러오기 API
@application.route('/get_chats', methods=['GET'])
@jwt_required()
def get_chats():
    user_id = get_jwt_identity()
    chats = Chat.query.filter_by(user_id=user_id).all()
    chat_list = [{'message': chat.message, 'sender': chat.sender} for chat in chats]
    return jsonify(chats=chat_list), 200

# 보호된 경로 테스트 API
@application.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    return jsonify(message="This is a protected route!")

# 메인 페이지
@application.route('/')
def index():
    return "Welcome to my Flask App!"

# 메인 함수
if __name__ == '__main__':
    # 데이터베이스 테이블 생성
    with application.app_context():
        db.create_all()
    # 앱 실행
    application.run(debug=True, port=5002)
