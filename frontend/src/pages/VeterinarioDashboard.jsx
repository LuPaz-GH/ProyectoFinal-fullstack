import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStethoscope, faCalendarCheck, faPaw, 
  faSyringe, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const VeterinarioDashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.35)', 
          zIndex: 0 
        }}
      />

      {/* Contenido Principal */}
      <div 
        className="position-relative text-center text-white p-5 rounded-5 shadow-lg"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.45)', 
          backdropFilter: 'blur(15px)',
          maxWidth: '800px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Botón de Salir - Esquina superior derecha */}
        <button 
          className="btn btn-sm position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2"
          style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
          onClick={onLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Salir
        </button>

        {/* Saludo Principal */}
        <h1 className="display-4 fw-bold mb-3">
          ¡Hola Doc! <FontAwesomeIcon icon={faStethoscope} className="text-info" />
        </h1>
        <p className="lead fs-5 mb-5 opacity-90">
          Listo para cuidar patitas hoy
        </p>

        {/* Botones Principales */}
        <div className="d-flex flex-column gap-3 mb-5">
          <button 
            className="btn btn-lg rounded-pill px-5 py-4 fw-bold shadow-lg border-0"
            style={{ 
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: 'white',
              fontSize: '1.2rem',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/turnos')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(6, 182, 212, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
            }}
          >
            <FontAwesomeIcon icon={faCalendarCheck} className="me-3 fs-5" />
            Agenda de Consultas
          </button>

          <button 
            className="btn btn-lg rounded-pill px-5 py-4 fw-bold shadow-lg border-0"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontSize: '1.2rem',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/historial')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
            }}
          >
            <FontAwesomeIcon icon={faPaw} className="me-3 fs-5" />
            Historial Clínico
          </button>
        </div>

        {/* Tarjetas de Información */}
        <div className="row g-3">
          {/* Mensaje del Día */}
          <div className="col-md-6">
            <div 
              className="p-4 rounded-4 h-100"
              style={{ 
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FontAwesomeIcon 
                  icon={faStethoscope} 
                  size="2x" 
                  className="text-info me-3"
                />
                <h5 className="mb-0 fw-bold">Mensaje del día</h5>
              </div>
              <p className="mb-0 opacity-90" style={{ fontSize: '0.95rem' }}>
                "Cada diagnóstico preciso salva una vida. ¡Seguí cuidando con pasión y ciencia!"
              </p>
              <small className="d-block mt-3 opacity-75">— Tu equipo Malfi</small>
            </div>
          </div>

          {/* Recordatorio Rápido */}
          <div className="col-md-6">
            <div 
              className="p-4 rounded-4 h-100"
              style={{ 
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FontAwesomeIcon 
                  icon={faSyringe} 
                  size="2x" 
                  className="text-success me-3"
                />
                <h5 className="mb-0 fw-bold">Recordatorio rápido</h5>
              </div>
              <p className="mb-0 opacity-90" style={{ fontSize: '0.95rem' }}>
                Revisá el stock de vacunas, antipulgas y medicamentos antes de empezar las consultas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinarioDashboard;