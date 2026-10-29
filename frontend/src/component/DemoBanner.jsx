import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEnvelope, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

// Cartel flotante que se muestra solo en el modo demo (reclutadores y clientes)
const contacto = [
  { icono: faWhatsapp, href: 'https://wa.me/5493815192208?text=Hola%20Luciana%2C%20vi%20Malfi%20Veterinaria%20en%20tu%20portfolio', titulo: 'WhatsApp' },
  { icono: faEnvelope, href: 'mailto:lucianadanizapaz@hotmail.com', titulo: 'Email' },
  { icono: faLinkedin, href: 'https://www.linkedin.com/in/daniza-paz-67920a415', titulo: 'LinkedIn' },
  { icono: faGithub, href: 'https://github.com/LuPaz-GH/ProyectoFinal-fullstack', titulo: 'Código en GitHub' },
];

const DemoBanner = () => {
  const [abierto, setAbierto] = useState(true);

  if (!abierto) {
    return (
      <button className="btn text-white rounded-pill shadow-lg fw-bold px-3 py-2"
        onClick={() => setAbierto(true)}
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 5000, background: '#663399' }}>
        <FontAwesomeIcon icon={faEye} className="me-2" /> Modo demo
      </button>
    );
  }

  return (
    <div className="shadow-lg p-3"
      style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 5000, maxWidth: 'calc(100vw - 32px)', width: 320, borderRadius: 20, background: 'rgba(255, 255, 255, 0.97)', border: '2px solid #663399' }}>
      <button className="btn btn-sm position-absolute text-muted" onClick={() => setAbierto(false)}
        style={{ top: 6, right: 8 }} aria-label="Minimizar">
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <div className="fw-bold mb-1" style={{ color: '#663399' }}>
        <FontAwesomeIcon icon={faEye} className="me-2" /> Modo demo · solo lectura
      </div>
      <p className="small text-muted mb-2">
        Podés recorrer todo el sistema. Los cambios no se guardan.
      </p>
      <p className="small mb-2">
        Desarrollado por <strong>Luciana Daniza Paz</strong>. ¿Te interesa trabajar conmigo?
      </p>

      <div className="d-flex gap-2">
        {contacto.map(({ icono, href, titulo }) => (
          <a key={titulo} href={href} target="_blank" rel="noopener noreferrer" title={titulo}
            className="btn rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40, background: '#f3ecfa', color: '#663399' }}>
            <FontAwesomeIcon icon={icono} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default DemoBanner;
