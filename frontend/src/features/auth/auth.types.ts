// 인증 입력 폼
export interface AuthForm {
  username: string;
  password: string;
}

// 사용자 정보
export interface User {
  id: number;
  username: string;
}

// 서버에서 로그인 성공 시 받는 데이터
export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string; // 토큰 쓰면 유지
}