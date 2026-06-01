import React from 'react';
import { useNavigate } from 'react-router-dom'; 

const Login = () => {
  const navigate = useNavigate(); 

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/mascotas'); 
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center">
      <div className="card p-4 shadow-lg" style={{ width: '380px', borderRadius: '20px' }}>
        <div className="card-body text-center">
          <h2 className="mb-4" style={{ color: '#663399', fontWeight: 'bold' }}>Veterinaria</h2>
          <form onSubmit={handleLogin}> 
            <div className="mb-3 text-start">
              <label className="form-label text-muted small">Usuario</label>
              <input type="text" className="form-control" placeholder="nombre@ejemplo.com" required />
            </div>
            <div className="mb-4 text-start">
              <label className="form-label text-muted small">Contraseña</label>
              <input type="password" className="form-control" placeholder="********" required />
            </div>
            <button type="submit" className="btn w-100 fw-bold shadow-sm" 
                    style={{ backgroundColor: '#99cc33', color: 'white', padding: '12px' }}>
              INGRESAR
            </button>
          </form>
          <p className="mt-3 small text-secondary">¿Olvidaste tu contraseña?</p>
        </div>
      </div>
    </div>
  );
};

export default Login;