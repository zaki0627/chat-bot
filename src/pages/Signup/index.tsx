import { Link, Navigate } from "react-router-dom";
import "./index.css";
import { useState } from "react";
import { authRepository } from "../../modules/auth/auth.repository";
import { useAtom } from "jotai";
import { currentUserAtom } from "../../modules/auth/current-user.state";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);

  const signup = async () => {
    setIsloading(true);
    try {
      const { user, token } = await authRepository.signup(
        name,
        email,
        password,
      );
      setCurrentUser(user);
      localStorage.setItem("token", token);
      console.log(user, token);
    } catch (error) {
      console.log("error");
    } finally {
      setIsloading(false);
    }
  };
  if (currentUser) return <Navigate to="/" />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">アカウント作成</h1>

        <div className="auth-form-container">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              placeholder="山田太郎"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              placeholder="example@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              placeholder="8文字以上"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="auth-button"
            onClick={signup}
            disabled={!email || !password || !name || isLoading}
          >
            アカウント作成
          </button>
        </div>

        <p className="auth-footer">
          既にアカウントをお持ちの方は
          <Link to="/signin">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
