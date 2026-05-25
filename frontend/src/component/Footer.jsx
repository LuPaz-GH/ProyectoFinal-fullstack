import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faHeart } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        color: 'rgba(255, 255, 255, 0.85)',
        padding: '1rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        marginTop: 'auto',
      }}
    >
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
        <span>
          <FontAwesomeIcon icon={faPaw} className="me-1" style={{ color: '#ff69b4' }} />
          <strong>Malfi Veterinaria</strong>
        </span>
        <span className="d-none d-sm-inline opacity-50">·</span>
        <span>
          Hecho con{' '}
          <FontAwesomeIcon icon={faHeart} style={{ color: '#ff69b4' }} />{' '}
          para las colitas felices
        </span>
        <span className="d-none d-sm-inline opacity-50">·</span>
        <span className="opacity-75">&copy; {year} Todos los derechos reservados</span>
      </div>
    </footer>
  );
};

export default Footer;
