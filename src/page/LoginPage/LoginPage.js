import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./style/login.style.css";
import { loginWithEmail, loginWithGoogle } from "../../features/user/userSlice";
import { clearErrors } from "../../features/user/userSlice";
import { getCartQty } from "../../features/cart/cartSlice";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_KEY;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loginError } = useSelector((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로그인 버튼 로딩 중인지

  useEffect(() => {
    if (loginError) {
      dispatch(clearErrors());
    }
  }, [navigate]);

  //이메일 로그인
  const handleLoginWithEmail = async (event) => {
    event.preventDefault();
    setIsLoading(true); // 로딩 중 표시

    try {
      await dispatch(loginWithEmail({ email, password })).unwrap(); // loginWithEmail 성공 시에만 getCartList 실행
      await dispatch(getCartQty());
    } finally {
      setIsLoading(false); // 로드 완료되면 원래의 회원가입 버튼으로 돌아옴.
    }
    
  };

  const handleGoogleLogin = async (googleData) => {
    //구글 로그인 하기
    dispatch(loginWithGoogle(googleData.credential));
  };

  // onChange 핸들러
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (loginError) dispatch(clearErrors()); // 로그인 에러가 있으면 초기화

    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  // 사용자가 로그인했을 때 메인 페이지로 리다이렉트
  useEffect(() => {
    if (user) {
      navigate("/"); // //메인 페이지로 리다이렉트. 로그인=유저값 있으면 로그인페이지x(다양한 상황에서)
    }
  }, [user, navigate]);

  return (
    <>
      <Container className="login-area">
        {loginError && (
          <div className="error-message">
            <Alert variant="danger">{loginError}</Alert>
          </div>
        )}
        <Form className="login-form" onSubmit={handleLoginWithEmail}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              required
              name="email"
              value={email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              required
              name="password"
              value={password}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="display-space-between login-button-area">
            <Button variant="danger" type="submit" disabled={isLoading}>
              {isLoading ? "처리 중..." : "Login"}
            </Button>
            <div>
              아직 계정이 없으세요?<Link to="/register">회원가입 하기</Link>{" "}
            </div>
          </div>

          <div className="text-align-center mt-2">
            <p>-외부 계정으로 로그인하기-</p>
            <div className="display-center">
              {/* 
                1. 구글 로그인 버튼 가져오기
                2. oauth로그인 : google api 사이트 가입 및 클라이언트키, 시크릿키 받아오기
                3. 로그인
                4. 백엔드 로그인
                  a. 이미 로그인 => 로그인 & 토큰 발행
                  b. 처음 로그인 => 유저 정보 먼저 생성 => 토큰 발행
              */}
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default Login;
