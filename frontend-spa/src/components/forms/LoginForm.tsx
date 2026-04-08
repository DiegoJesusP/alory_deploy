import { useState } from "react";

interface Props {
  onSubmit: (username: string, password: string) => Promise<void>;
}

const LoginForm = ({ onSubmit }: Props) => {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setusername(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <input
          type="password"
          className="form-control"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" className="btn login-btn w-100">
        Iniciar sesión
      </button>

      <div className="text-center mt-3">
        <a href="#" className="forgot-link">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;