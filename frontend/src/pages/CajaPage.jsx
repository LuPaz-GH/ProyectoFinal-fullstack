import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCashRegister, faPlus, faSearch, faStethoscope, faScissors, 
    faHandHoldingUsd, faBoxOpen, faChevronDown, faBowlFood, 
    faPills, faShoppingBag, faTags, faTrash, faCartPlus, faBan, 
    faPlusCircle, faMinusCircle, faExclamationCircle, faMicroscope, 
    faSyringe, faUserMd, faFileInvoiceDollar, faStar, faCalendarDay,
    faMoneyBillWave, faCreditCard, faExchangeAlt, faTimes, faArrowLeft, 
    faInfoCircle, faEdit, faFileExcel, faFilePdf, faCheckCircle, faPrint, faSignature, faPaw,
    faTools, faChevronLeft, faChevronRight, faTrashRestore,
    faHistory, faToggleOff, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportarExcelEstilizado, exportarPDFEstilizado } from '../utils/exportExcel';
import api from '../services/api';
import ConfirmModal from '../component/ConfirmModal';

const CajaPage = ({ user }) => {
    const [ventas, setVentas] = useState([]); 
    const [showModal, setShowModal] = useState(false);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [datosEdicion, setDatosEdicion] = useState(null);

    const [showTicketConfirm, setShowTicketConfirm] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [lastSaleData, setLastSaleData] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [ventaToDelete, setVentaToDelete] = useState(null);

    const [nombreCliente, setNombreCliente] = useState('');
    const [sugerenciasCliente, setSugerenciasCliente] = useState([]);
    const [mostrarClientes, setMostrarClientes] = useState(false);

    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState(new Date().toISOString().split('T')[0]);
    const [filtroFechaHasta, setFiltroFechaHasta] = useState(new Date().toISOString().split('T')[0]);

    const [busquedaProd, setBusquedaProd] = useState('');
    const [sugerenciasProd, setSugerenciasProd] = useState([]);
    const [mostrarProd, setMostrarProd] = useState(false);
    const [mostrarVet, setMostrarVet] = useState(false);

    const [carrito, setCarrito] = useState([]);
    const [metodoPago, setMetodoPago] = useState('efectivo');

    const [serviciosBD, setServiciosBD] = useState([]);
    const [cobrosBorrados, setCobrosBorrados] = useState([]);
    const [showPapelera, setShowPapelera] = useState(false);
    const [busquedaPapelera, setBusquedaPapelera] = useState('');

    const [showConfirmPermanent, setShowConfirmPermanent] = useState(false);
    const [idToPermanentDelete, setIdToPermanentDelete] = useState(null);

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;
    
    const wrapperRefProd = useRef(null);
    const wrapperRefVet = useRef(null);
    const wrapperRefCliente = useRef(null);

    const lanzarExito = (mensaje) => {
        setMensajeExito(mensaje);
        setShowTicketConfirm(true);
    };

    useEffect(() => {
        cargarServicios();
        cargarPapeleraCaja();
        const handleClickOutside = (event) => {
            if (wrapperRefProd.current && !wrapperRefProd.current.contains(event.target)) setMostrarProd(false);
            if (wrapperRefVet.current && !wrapperRefVet.current.contains(event.target)) setMostrarVet(false);
            if (wrapperRefCliente.current && !wrapperRefCliente.current.contains(event.target)) setMostrarClientes(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => { cargarCaja(); }, filtroBusqueda ? 400 : 0);
        return () => clearTimeout(timeout);
    }, [filtroBusqueda, filtroFechaDesde, filtroFechaHasta]);

    const cargarCaja = async () => {
        try {
            const params = new URLSearchParams();
            if (filtroFechaDesde) params.set('fechaDesde', filtroFechaDesde);
            if (filtroFechaHasta) params.set('fechaHasta', filtroFechaHasta);
            if (filtroBusqueda.trim()) params.set('q', filtroBusqueda.trim());
            const res = await api.get(`/caja?${params.toString()}`);
            setVentas(Array.isArray(res.data) ? res.data : []);
            setPaginaActual(1);
        } catch (err) {
            console.error("Error cargando caja:", err);
        }
    };

    const buscarClientesExistentes = async (termino) => {
        setNombreCliente(termino);
        if (termino.length < 2) { setSugerenciasCliente([]); setMostrarClientes(false); return; }
        try {
            const res = await api.get(`/clientes/buscar?q=${encodeURIComponent(termino)}`);
            setSugerenciasCliente(Array.isArray(res.data) ? res.data : []);
            setMostrarClientes(true);
        } catch { setSugerenciasCliente([]); }
    };

    const cargarPapeleraCaja = async () => {
        try {
            const res = await api.get('/caja-papelera');
            setCobrosBorrados(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error cargando papelera caja:", err);
        }
    };

    const cargarServicios = async () => {
        try {
            const res = await api.get('/servicios');
            setServiciosBD(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error cargando servicios:", err);
        }
    };

    const listaVet = serviciosBD.filter(s => s.categoria === 'veterinaria');

    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const ventasPaginadas = ventas.slice(primerIndice, ultimoIndice);
    const totalPaginas = Math.ceil(ventas.length / registrosPorPagina);

    const cambiarPagina = (numero) => {
        if (numero >= 1 && numero <= totalPaginas) setPaginaActual(numero);
    };

    const generarTicketPDF = (datosCarrito, total, metodo, cliente) => {
        const itemH = 9;
        const extraCliente = cliente ? 6 : 0;
        const docHeight = 135 + (datosCarrito.length * itemH) + extraCliente;
        const doc = new jsPDF({ unit: 'mm', format: [80, docHeight] });
        const W = 80;
        const cx = W / 2;

        // ── HEADER ──────────────────────────────────────────
        doc.setFillColor(44, 62, 80);          
        doc.rect(0, 0, W, 28, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("MALFI VETERINARIA", cx, 11, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("San Miguel de Tucuman", cx, 17, { align: "center" });
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(8, 22, W - 8, 22);

        // ── INFO ─────────────────────────────────────────────
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8);
        let y = 34;

        doc.text(`Fecha:`, 5, y);
        doc.setFont("helvetica", "bold");
        doc.text(new Date().toLocaleString('es-AR'), 22, y);
        doc.setFont("helvetica", "normal");
        y += 6;

        doc.text(`Cajero/a:`, 5, y);
        doc.setFont("helvetica", "bold");
        doc.text(user?.nombre || 'Luciana', 22, y);
        doc.setFont("helvetica", "normal");
        y += 6;

        doc.text(`Pago:`, 5, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 111, 196);
        doc.text(metodo.toUpperCase(), 22, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        y += 6;

        if (cliente) {
            doc.text(`Cliente:`, 5, y);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(44, 62, 80);
            doc.text(cliente, 22, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60);
            y += 6;
        }

        // ── SEPARADOR ─────────────────────────────────────────
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(5, y + 1, W - 5, y + 1);
        y += 6;

        // ── CABECERA DE ÍTEMS ─────────────────────────────────
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 130);
        doc.setFont("helvetica", "bold");
        doc.text("PRODUCTO", 5, y);
        doc.text("MONTO", W - 5, y, { align: "right" });
        doc.setTextColor(60, 60, 60);
        y += 4;
        doc.line(5, y, W - 5, y);
        y += 5;

        // ── ÍTEMS ──────────────────────────────────────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        datosCarrito.forEach(item => {
            const nombre = item.nombre.length > 26 ? item.nombre.substring(0, 26) + '…' : item.nombre;
            doc.setFont("helvetica", "bold");
            doc.text(`${item.cantidad}x`, 5, y);
            doc.setFont("helvetica", "normal");
            doc.text(nombre, 12, y);
            doc.setFont("helvetica", "bold");
            doc.text(`$${Number(item.subtotal).toLocaleString('es-AR')}`, W - 5, y, { align: "right" });
            doc.setFont("helvetica", "normal");
            y += itemH;
        });

        // ── TOTAL ──────────────────────────────────────────────
        doc.setLineWidth(0.3);
        doc.line(5, y, W - 5, y);
        y += 3;

        doc.setFillColor(245, 248, 252);
        doc.rect(0, y, W, 14, 'F');
        y += 9;

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 62, 80);
        doc.text("TOTAL:", 5, y);
        doc.setTextColor(39, 174, 96);
        doc.text(`$${Number(total).toLocaleString('es-AR')}`, W - 5, y, { align: "right" });

        // ── FOOTER ─────────────────────────────────────────────
        y += 12;
        doc.setTextColor(160, 160, 160);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("Gracias por elegirnos!", cx, y, { align: "center" });
        y += 5;
        doc.text("Malfi Veterinaria - Tu mascota, nuestra pasion", cx, y, { align: "center" });

        doc.save(`Ticket_Malfi_${Date.now()}.pdf`);
    };

    const exportarExcel = async () => {
        await exportarExcelEstilizado({
            data: ventas.map(v => ({
                fecha: v.fecha_formateada,
                concepto: v.descripcion.replace(/\n/g, ' | '),
                cliente: v.nombre_cliente || '',
                empleado: (v.empleado_nombre || '').replace(/_/g, ' ').toUpperCase(),
                medio: v.metodo_pago.toUpperCase(),
                monto: Number(v.monto)
            })),
            columns: [
                { header: 'Fecha', key: 'fecha', width: 18 },
                { header: 'Concepto', key: 'concepto', width: 38 },
                { header: 'Cliente', key: 'cliente', width: 22 },
                { header: 'Empleado', key: 'empleado', width: 20 },
                { header: 'Medio de Pago', key: 'medio', width: 16 },
                { header: 'Monto ($)', key: 'monto', width: 14 },
            ],
            filename: `Reporte_Caja_Malfi_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`,
            sheetName: 'Ventas',
            headerColor: '6B21A8'
        });
    };

    const exportarPDF = () => {
        exportarPDFEstilizado({
            titulo: 'Reporte de Caja - Malfi Veterinaria',
            columnas: ['Fecha', 'Concepto', 'Cliente', 'Empleado', 'Medio', 'Monto'],
            filas: ventas.map(v => [v.fecha_formateada, v.descripcion.substring(0, 40), v.nombre_cliente || '-', (v.empleado_nombre || '-').replace(/_/g, ' ').toUpperCase(), v.metodo_pago.toUpperCase(), `$${v.monto}`]),
            filename: 'Reporte_Caja_Malfi.pdf',
            headerColor: [107, 33, 168],
            accentColor: [134, 192, 70]
        });
    };

    const handleConfirmarEliminarPermanente = async () => {
        if (!idToPermanentDelete) return;
        try {
            await api.delete(`/caja/papelera/${idToPermanentDelete}`); 
            lanzarExito("Operación eliminada definitivamente");
            setShowConfirmPermanent(false);
            setIdToPermanentDelete(null);
            cargarPapeleraCaja();
        } catch (err) {
            console.error("Error al eliminar permanentemente:", err);
        }
    };

    const obtenerPapeleraFiltrada = () => {
        return cobrosBorrados.filter(v => 
            (v.descripcion || '').toLowerCase().includes(busquedaPapelera.toLowerCase())
        );
    };

    const restaurarMovimiento = async (id) => {
        try {
            await api.put(`/caja/restaurar/${id}`);
            cargarCaja();
            cargarPapeleraCaja();
            lanzarExito("Venta restaurada a la caja");
        } catch (err) { 
            alert("Error al restaurar"); 
        }
    };

    const handleEliminar = (id, e) => { e.stopPropagation(); setVentaToDelete(id); setShowDeleteConfirm(true); };

    const confirmarEliminacion = async () => {
        try {
            await api.delete(`/caja/${ventaToDelete}`);
            cargarCaja();
            cargarPapeleraCaja();
            lanzarExito("Cobro enviado a la papelera");
        } catch (err) { alert("Error al anular venta"); }
        finally { setShowDeleteConfirm(false); setVentaToDelete(null); }
    };

    const prepararEdicion = (v, e) => {
        e.stopPropagation();
        setDatosEdicion(v);
        setMetodoPago(v.metodo_pago);
        setNombreCliente(v.nombre_cliente || '');
        const lineas = v.descripcion ? v.descripcion.split('\n') : [];
        const itemsParseados = lineas.map((linea, index) => {
            const match = linea.match(/(\d+)x\s+(.+?)\s*\(\$\s*([\d.,]+)/);
            if (match) {
                const cantidad = parseInt(match[1]);
                const subtotal = parseFloat(match[3].replace(/\./g, '').replace(',', '.'));
                return {
                    idUnico: `edit-${Date.now()}-${index}`,
                    nombre: match[2].trim(),
                    precio: subtotal / cantidad,
                    cantidad,
                    subtotal,
                    stock_max: 999,
                    original: true
                };
            }
            return null;
        }).filter(Boolean);
        setCarrito(itemsParseados.length > 0 ? itemsParseados : [{ idUnico: 'edit-1', nombre: v.descripcion || 'Operación', precio: Number(v.monto), cantidad: 1, subtotal: Number(v.monto), original: true }]);
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (carrito.length === 0) return alert("El carrito está vacío");
        const totalActual = totalVentaCarrito;
        const itemsActuales = [...carrito];
        const metodoActual = metodoPago;
        const descripcionFinal = carrito.map(i => `${i.cantidad}x ${i.nombre} ($${i.subtotal})`).join('\n');
        try {
            const res = await api({
                url: datosEdicion ? `/caja/${datosEdicion.id}` : '/caja',
                method: datosEdicion ? 'PUT' : 'POST',
                data: { tipo_operacion: 'ingreso', categoria: 'Venta Múltiple', descripcion: descripcionFinal, monto: totalActual, metodo_pago: metodoActual, usuario_id: user?.id, nombre_cliente: nombreCliente.trim() || null, detalles: itemsActuales }
            });
            if (res.status === 200 || res.status === 201) { 
                setLastSaleData({ carrito: itemsActuales, total: totalActual, metodo: metodoActual, cliente: nombreCliente.trim() || null });
                setShowModal(false); 
                setCarrito([]); 
                cargarCaja(); 
                lanzarExito("Operación procesada con éxito");
            }
        } catch (err) { alert("Error al guardar la venta."); }
    };

    const obtenerProductos = async (termino = '') => {
        setBusquedaProd(termino);
        try {
            const res = await api.get(`/productos/buscar?q=${encodeURIComponent(termino)}`);
            setSugerenciasProd(Array.isArray(res.data) ? res.data : []);
            setMostrarProd(true);
        } catch (err) { setSugerenciasProd([]); }
    };

    const agregarAlCarrito = (item, tipo = 'producto') => {
        const idUnico = tipo !== 'producto' ? `${tipo}-${item.id}` : `prod-${item.id}`;
        const precio = Number(tipo === 'producto' ? item.precio_venta : item.precio);
        setCarrito(prev => {
            const existe = prev.find(i => i.idUnico === idUnico);
            if (existe) {
                return prev.map(i => {
                    if (i.idUnico !== idUnico) return i;
                    const nuevaCant = i.cantidad + 1;
                    if (nuevaCant > i.stock_max) return i;
                    return { ...i, cantidad: nuevaCant, subtotal: nuevaCant * Number(i.precio) };
                });
            }
            return [...prev, {
                idUnico, producto_id: tipo === 'producto' ? item.id : null,
                nombre: item.nombre, precio,
                cantidad: 1, subtotal: precio,
                stock_max: tipo === 'producto' ? item.stock : 999, original: false
            }];
        });
    };

    const actualizarCantidad = (idUnico, cambio) => {
        setCarrito(prev => prev.map(item => {
            if (item.idUnico === idUnico) {
                const nuevaCant = item.cantidad + cambio;
                if (nuevaCant > item.stock_max || nuevaCant < 1) return item;
                return { ...item, cantidad: nuevaCant, subtotal: nuevaCant * Number(item.precio) };
            }
            return item;
        }));
    };

    const totalVentaCarrito = carrito.reduce((acc, i) => acc + Number(i.subtotal), 0);
    
    // --- CORRECCIÓN LÓGICA TOTALES ---
    const hoy = new Date();
    const hoyISO = hoy.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const hoyLocal = hoy.toLocaleDateString('es-AR'); // "DD/MM/YYYY"

    const ventasHoy = ventas.filter(v => {
        // Comparamos contra v.fecha (ISO) o v.fecha_formateada (Local)
        const fechaVentaISO = v.fecha ? v.fecha.split('T')[0] : "";
        const fechaVentaLocal = v.fecha_formateada ? v.fecha_formateada.split(' ')[0] : "";
        return (fechaVentaISO === hoyISO || fechaVentaLocal === hoyLocal) && v.tipo_operacion === 'ingreso';
    });

    const recaudacionTotal = ventasHoy.reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
    const totalEfectivo = ventasHoy.filter(v => v.metodo_pago === 'efectivo').reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
    const totalTransferencia = ventasHoy.filter(v => v.metodo_pago === 'transferencia').reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
    const totalTarjeta = ventasHoy.filter(v => v.metodo_pago === 'tarjeta').reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
    

    return (
        <div className="container-fluid min-vh-100 p-4 text-dark position-relative" style={{ backgroundImage: `url('https://i.pinimg.com/736x/ef/1f/af/ef1faf0a74cd6ef7768e445731e194eb.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.1)', zIndex: 0 }} />
            <div className="position-relative" style={{ zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h1 className="text-white fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}><FontAwesomeIcon icon={faCashRegister} className="me-2"/> Caja de Malfi</h1>
                    <div className="d-flex gap-2">
                        <button className="btn btn-success rounded-pill px-3 shadow-sm" onClick={exportarExcel}><FontAwesomeIcon icon={faFileExcel} /></button>
                        <button className="btn btn-danger rounded-pill px-3 shadow-sm" onClick={exportarPDF}><FontAwesomeIcon icon={faFilePdf} /></button>
                        {(user?.rol === 'admin' || user?.rol === 'dueno') && (
                            <button className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" onClick={() => window.location.href = '/configuracion'}><FontAwesomeIcon icon={faTools} className="me-2" /> Precios</button>
                        )}
                        <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={() => {cargarPapeleraCaja(); setShowPapelera(true);}}><FontAwesomeIcon icon={faEyeSlash} className="me-2" /> Inactivos ({cobrosBorrados.length})</button>
                        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => { setDatosEdicion(null); setCarrito([]); setNombreCliente(''); setShowModal(true); }}><FontAwesomeIcon icon={faPlus} className="me-2" /> Nueva Operación</button>
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    {[ 
                        { label: 'TOTAL HOY', val: recaudacionTotal, color: 'border-primary', text: 'text-primary' }, 
                        { label: 'EFECTIVO', val: totalEfectivo, color: 'border-success', text: 'text-success' }, 
                        { label: 'TRANSF.', val: totalTransferencia, color: 'border-info', text: 'text-info' }, 
                        { label: 'TARJETAS', val: totalTarjeta, color: 'border-warning', text: 'text-warning' } 
                    ].map((item, idx) => (
                        <div className="col-md-3" key={idx}>
                            <div className={`card border-0 shadow-sm p-3 rounded-4 border-start border-5 ${item.color} h-100`} style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}>
                                <small className="text-muted fw-bold">{item.label}</small>
                                <h3 className={`fw-bold mb-0 ${item.text}`}>$ {item.val.toLocaleString('es-AR')}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* BUSCADOR */}
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-3" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                            <div className="input-group rounded-pill overflow-hidden bg-white border shadow-sm">
                                <span className="input-group-text bg-white border-0 ps-3"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
                                <input type="text" className="form-control border-0 py-2 text-dark"
                                    placeholder="Buscar por concepto o cliente..."
                                    value={filtroBusqueda}
                                    onChange={e => setFiltroBusqueda(e.target.value)} />
                                {filtroBusqueda && (
                                    <button className="btn btn-white border-0 px-3 text-muted" onClick={() => setFiltroBusqueda('')}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted mb-1 ps-1">Desde</label>
                            <input type="date" className="form-control rounded-pill border py-2"
                                value={filtroFechaDesde}
                                onChange={e => setFiltroFechaDesde(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted mb-1 ps-1">Hasta</label>
                            <input type="date" className="form-control rounded-pill border py-2"
                                value={filtroFechaHasta}
                                onChange={e => setFiltroFechaHasta(e.target.value)} />
                        </div>
                        <div className="col-md-4 d-flex gap-2">
                            <button className="btn btn-outline-secondary rounded-pill px-3 py-2 small fw-bold"
                                onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroBusqueda(''); }}>
                                Ver historial completo
                            </button>
                            <button className="btn btn-outline-primary rounded-pill px-3 py-2 small fw-bold"
                                onClick={() => { const hoy = new Date().toISOString().split('T')[0]; setFiltroFechaDesde(hoy); setFiltroFechaHasta(hoy); setFiltroBusqueda(''); }}>
                                Hoy
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 ps-1">
                        <small className="text-muted fst-italic">
                            {!filtroFechaDesde && !filtroFechaHasta && !filtroBusqueda
                                ? '📋 Mostrando todo el historial'
                                : !filtroFechaDesde && !filtroFechaHasta
                                ? `🔍 Buscando "${filtroBusqueda}" en todo el historial`
                                : filtroFechaDesde === filtroFechaHasta && filtroFechaDesde === new Date().toISOString().split('T')[0]
                                ? `📅 Mostrando registros de hoy${filtroBusqueda ? ` — "${filtroBusqueda}"` : ''}`
                                : filtroFechaDesde === filtroFechaHasta
                                ? `📅 Mostrando registros del ${filtroFechaDesde}${filtroBusqueda ? ` — "${filtroBusqueda}"` : ''}`
                                : `📅 Del ${filtroFechaDesde || '...'} al ${filtroFechaHasta || '...'}${filtroBusqueda ? ` — "${filtroBusqueda}"` : ''}`}
                        </small>
                    </div>
                </div>

                <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)' }}>
                    <table className="table table-hover mb-0 text-dark">
                        <thead className="bg-light"><tr><th className="ps-4 py-3">Fecha</th><th>Concepto</th><th>Cliente</th><th>Empleado</th><th>Medio</th><th className="text-end">Monto</th><th className="text-center">Acciones</th></tr></thead>
                        <tbody>
                            {ventasPaginadas.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No hay operaciones registradas</td></tr>
                            ) : (
                                ventasPaginadas.map(v => (
                                    <tr key={v.id} onClick={() => setVentaSeleccionada(v)} style={{ cursor: 'pointer' }}>
                                        <td className="ps-4 small text-muted">{v.fecha_formateada}</td>
                                        <td className="fw-bold small">{v.descripcion.substring(0, 40)}...</td>
                                        <td className="small">{v.nombre_cliente || <span className="text-muted">—</span>}</td>
                                        <td className="small fw-bold text-dark" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{v.empleado_nombre ? v.empleado_nombre.replace(/_/g, ' ') : <span className="text-muted fw-normal">—</span>}</td>
                                        <td><span className="badge bg-light text-dark border">{v.metodo_pago.toUpperCase()}</span></td>
                                        <td className="text-end fw-bold text-success">$ {Number(v.monto).toLocaleString('es-AR')}</td>
                                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                            <button className="btn btn-sm text-primary me-2" onClick={(e) => prepararEdicion(v, e)}><FontAwesomeIcon icon={faEdit} /></button>
                                            <button className="btn btn-sm text-danger" title="Desactivar" onClick={(e) => handleEliminar(v.id, e)}><FontAwesomeIcon icon={faToggleOff} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-center py-3 bg-light border-top text-dark">
                        <button className="btn btn-sm btn-white border px-3" disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)}><FontAwesomeIcon icon={faChevronLeft} /></button>
                        <span className="mx-3 fw-bold">Página {paginaActual}</span>
                        <button className="btn btn-sm btn-white border px-3" disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)}><FontAwesomeIcon icon={faChevronRight} /></button>
                    </div>
                </div>
            </div>

            {/* MODAL PAPELERA */}
            {showPapelera && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2100 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-5 overflow-hidden">
                            <div className="text-center p-4 text-white" style={{ backgroundColor: '#dc3545' }}>
                                <h4 className="fw-bold m-0 text-uppercase"><FontAwesomeIcon icon={faHistory} className="me-2" /> Papelera de Cobros Anulados</h4>
                            </div>
                            <div className="modal-body p-4 bg-white text-dark">
                                <div className="mb-4 d-flex justify-content-center text-dark">
                                    <div className="input-group shadow-sm rounded-pill overflow-hidden bg-light border w-50">
                                        <span className="input-group-text bg-transparent border-0 ps-3 text-muted"><FontAwesomeIcon icon={faSearch} /></span>
                                        <input 
                                            type="text" 
                                            className="form-control border-0 py-2 bg-light text-dark" 
                                            placeholder="Buscar en papelera..." 
                                            value={busquedaPapelera} 
                                            onChange={(e) => setBusquedaPapelera(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                    <table className="table align-middle text-dark">
                                        <thead className="bg-light sticky-top">
                                            <tr className="text-muted small text-uppercase">
                                                <th>Concepto</th><th>Monto</th><th className="text-center">Borrado por</th><th>Fecha</th><th className="text-center">Restaurar</th><th className="text-center">Eliminar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {obtenerPapeleraFiltrada().length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-5 text-muted fw-bold">No hay registros en la papelera.</td></tr>
                                            ) : (
                                                obtenerPapeleraFiltrada().map(v => (
                                                    <tr key={v.id}>
                                                        <td><div className="fw-bold small text-truncate" style={{maxWidth: '200px'}}>{v.descripcion}</div></td>
                                                        <td className="text-success fw-bold">$ {Number(v.monto).toLocaleString('es-AR')}</td>
                                                        <td className="text-center"><span className="badge bg-light text-dark border px-3 py-2" style={{borderRadius:'8px'}}>{v.borrado_por_nombre || 'Luciana'}</span></td>
                                                        <td className="small text-muted">{new Date(v.fecha_borrado).toLocaleString('es-AR')}</td>
                                                        <td className="text-center"><button className="btn btn-success rounded-circle shadow-sm" onClick={() => restaurarMovimiento(v.id)} style={{width:'40px', height:'40px'}}><FontAwesomeIcon icon={faTrashRestore} /></button></td>
                                                        <td className="text-center"><button className="btn btn-danger rounded-circle shadow-sm" onClick={() => { setIdToPermanentDelete(v.id); setShowConfirmPermanent(true); }} style={{width:'40px', height:'40px'}}><FontAwesomeIcon icon={faTrash} /></button></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-center mt-4">
                                    <button className="btn text-white px-5 py-2 fw-bold shadow" style={{ backgroundColor: '#2C3E50', borderRadius: '25px' }} onClick={() => setShowPapelera(false)}>CERRAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ÉXITO */}
            {showTicketConfirm && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 4000 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
                        <div className="modal-content border-0 rounded-5 text-center p-5 position-relative shadow-lg" style={{ overflow: 'visible', marginTop: '40px' }}>
                            <div className="position-absolute start-50 translate-middle bg-white rounded-circle shadow d-flex align-items-center justify-content-center" 
                                 style={{ top: '0', width: '100px', height: '100px' }}>
                                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '80px', color: '#2ecc71' }} />
                            </div>
                            <div className="mt-4 pt-2 text-dark">
                                <h2 className="fw-bold mb-3 text-dark text-uppercase">¡Éxito!</h2>
                                <p className="text-muted fs-5 mb-4">{mensajeExito}</p>
                                <div className="d-flex flex-column gap-2">
                                    {lastSaleData && <button className="btn btn-outline-success rounded-pill py-2 fw-bold" onClick={() => generarTicketPDF(lastSaleData.carrito, lastSaleData.total, lastSaleData.metodo, lastSaleData.cliente)}><FontAwesomeIcon icon={faPrint} className="me-2"/> IMPRIMIR TICKET</button>}
                                    <button className="btn w-100 rounded-pill py-3 fw-bold text-white shadow-sm" style={{ backgroundColor: '#2C3E50' }} onClick={() => setShowTicketConfirm(false)}>Entendido</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal show={showConfirmPermanent} onClose={() => { setShowConfirmPermanent(false); setIdToPermanentDelete(null); }} onConfirm={handleConfirmarEliminarPermanente} title="¿Eliminar permanentemente?" message="Esta acción no se puede deshacer. El registro se borrará por completo de la base de datos." confirmText="Sí, eliminar para siempre" confirmColor="danger" />
            <ConfirmModal show={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmarEliminacion} title="¿Anular cobro?" message="El cobro se moverá a la papelera de anulados." confirmText="Sí, anular" confirmColor="danger" />

            {ventaSeleccionada && (
                <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.7)', zIndex: 3000}}>
                    <div className="modal-dialog modal-dialog-centered text-dark">
                        <div className="modal-content border-0 rounded-4 shadow-lg p-4">
                            <h4 className="fw-bold text-primary mb-3 text-uppercase">Detalle de Operación</h4>
                            <div className="bg-light p-3 rounded-3 mb-4 text-dark" style={{whiteSpace: 'pre-wrap'}}>{ventaSeleccionada.descripcion}</div>
                            <button className="btn btn-secondary w-100 rounded-pill fw-bold" onClick={() => setVentaSeleccionada(null)}>CERRAR</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '1100px' }}>
                        <div className="modal-content border-0 rounded-5 shadow-2xl overflow-hidden text-dark" style={{ height: '88vh' }}>
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white text-dark">
                                <h5 className="fw-bold mb-0 text-primary">{datosEdicion ? <><FontAwesomeIcon icon={faEdit} className="me-2"/> Modificar Operación</> : <><FontAwesomeIcon icon={faCartPlus} className="me-2" /> Nueva Operación</>}</h5>
                                <button type="button" className="btn-close shadow-none" onClick={() => { setShowModal(false); setCarrito([]); setNombreCliente(''); setDatosEdicion(null); }}></button>
                            </div>
                            <div className="row g-0 h-100 overflow-hidden">
                                <div className="col-md-8 bg-white d-flex flex-column h-100 border-end">
                                    <div className="p-4 flex-grow-1 overflow-auto">
                                        <h6 className="fw-bold text-muted text-uppercase small mb-3">Ítems en esta operación</h6>
                                        {carrito.length === 0 ? (<div className="text-center py-5 opacity-50"><FontAwesomeIcon icon={faShoppingBag} size="4x" className="mb-3 text-light" /><p>El carrito está vacío.</p></div>) : (
                                            <div className="table-responsive text-dark">
                                                <table className="table align-middle text-dark">
                                                    <thead><tr className="text-dark"><th>Concepto</th><th className="text-center">Cant.</th><th className="text-end">Subtotal</th><th></th></tr></thead>
                                                    <tbody>
                                                        {carrito.map(item => (
                                                            <tr key={item.idUnico}>
                                                                <td className="text-dark"><div className="fw-bold">{item.nombre}</div></td>
                                                                <td className="text-center"><div className="btn-group btn-group-sm rounded-pill border overflow-hidden"><button className="btn btn-white" onClick={() => actualizarCantidad(item.idUnico, -1)}>-</button><span className="btn btn-white px-3 fw-bold">{item.cantidad}</span><button className="btn btn-white" onClick={() => actualizarCantidad(item.idUnico, 1)}>+</button></div></td>
                                                                <td className="text-end fw-bold text-dark">$ {item.subtotal.toLocaleString()}</td>
                                                                <td className="text-end"><button className="btn btn-link text-danger p-0" onClick={() => setCarrito(carrito.filter(i => i.idUnico !== item.idUnico))}><FontAwesomeIcon icon={faTrash}/></button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-light border-top">
                                        <div className="row g-3">
                                            <div className="col-md-6 position-relative" ref={wrapperRefProd}>
                                                <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border"><span className="input-group-text bg-white border-0"><FontAwesomeIcon icon={faSearch} /></span><input type="text" className="form-control border-0 py-2 text-dark" placeholder="Agregar Producto..." value={busquedaProd} onChange={(e) => obtenerProductos(e.target.value)} onFocus={() => setMostrarProd(true)} /></div>
                                                {mostrarProd && sugerenciasProd.length > 0 && (
                                                    <div className="position-absolute shadow-lg border rounded-3 bg-white overflow-auto text-dark" style={{ bottom: '100%', marginBottom: '10px', zIndex: 9999, width: '100%', maxHeight: '300px' }}>
                                                        {sugerenciasProd.map(p => (<button key={p.id} disabled={p.stock <= 0} className="list-group-item list-group-item-action d-flex justify-content-between p-2 small border-0" onClick={() => { agregarAlCarrito(p); setMostrarProd(false); setBusquedaProd(''); }}><div><strong>{p.nombre}</strong><br/><small>Stock: {p.stock}</small></div><span>$ {p.precio_venta}</span></button>))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-3 position-relative" ref={wrapperRefVet}>
                                                <button className="btn btn-danger w-100 rounded-pill shadow-sm" onClick={() => setMostrarVet(!mostrarVet)}>VETERINARIA <FontAwesomeIcon icon={faChevronDown}/></button>
                                                {mostrarVet && (
                                                    <div className="position-absolute shadow-lg border rounded-3 bg-white text-dark" style={{ bottom: '100%', marginBottom: '10px', zIndex: 9999, width: '220px', maxHeight: '280px', overflowY: 'auto' }}>
                                                        {listaVet.map(s => (<button key={s.id} className="list-group-item list-group-item-action p-2 small border-0 text-dark" onClick={() => { agregarAlCarrito(s, 'vet'); setMostrarVet(false); }}>{s.nombre}</button>))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 p-4 d-flex flex-column bg-light h-100 border-start">
                                    {datosEdicion ? (() => {
                                        const montoOriginal = Number(datosEdicion.monto || 0);
                                        const diferencia = totalVentaCarrito - montoOriginal;
                                        return (
                                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white text-center">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-muted fw-bold">YA COBRADO</small>
                                                    <span className="fw-bold text-secondary">$ {montoOriginal.toLocaleString('es-AR')}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <small className="text-muted fw-bold">NUEVO TOTAL</small>
                                                    <span className="fw-bold text-primary">$ {totalVentaCarrito.toLocaleString('es-AR')}</span>
                                                </div>
                                                <hr className="my-0 mb-3"/>
                                                {diferencia > 0 ? (
                                                    <div className="rounded-3 py-2 px-3" style={{ backgroundColor: '#fff3cd' }}>
                                                        <small className="text-warning fw-bold d-block">DIFERENCIA A COBRAR</small>
                                                        <h3 className="fw-bold mb-0" style={{ color: '#e67e22' }}>$ {diferencia.toLocaleString('es-AR')}</h3>
                                                    </div>
                                                ) : diferencia < 0 ? (
                                                    <div className="rounded-3 py-2 px-3" style={{ backgroundColor: '#d1ecf1' }}>
                                                        <small className="text-info fw-bold d-block">A DEVOLVER</small>
                                                        <h3 className="fw-bold text-info mb-0">$ {Math.abs(diferencia).toLocaleString('es-AR')}</h3>
                                                    </div>
                                                ) : (
                                                    <small className="text-success fw-bold">Sin diferencia</small>
                                                )}
                                            </div>
                                        );
                                    })() : (
                                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white text-center">
                                            <h6 className="fw-bold text-muted mb-3">TOTAL A COBRAR</h6>
                                            <h2 className="fw-bold text-primary mb-0">$ {totalVentaCarrito.toLocaleString('es-AR')}</h2>
                                        </div>
                                    )}
                                    <div className="mb-4 text-dark">
                                        <label className="fw-bold small text-muted text-uppercase mb-2">Cliente (opcional)</label>
                                        <div className="position-relative" ref={wrapperRefCliente}>
                                            <input
                                                type="text"
                                                className="form-control rounded-pill border px-3 py-2"
                                                placeholder="Buscar cliente existente o escribir nombre..."
                                                value={nombreCliente}
                                                onChange={e => buscarClientesExistentes(e.target.value)}
                                                onFocus={() => nombreCliente.length >= 2 && setMostrarClientes(true)}
                                            />
                                            {mostrarClientes && sugerenciasCliente.length > 0 && (
                                                <div className="position-absolute shadow-lg border rounded-3 bg-white text-dark" style={{ top: '100%', marginTop: '4px', zIndex: 9999, width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {sugerenciasCliente.map(c => (
                                                        <button key={c.id}
                                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 small border-0"
                                                            onClick={() => { setNombreCliente(c.nombre); setSugerenciasCliente([]); setMostrarClientes(false); }}>
                                                            <div>
                                                                <strong>{c.nombre}</strong>
                                                                {c.dni && <span className="text-muted ms-2">DNI: {c.dni}</span>}
                                                            </div>
                                                            {c.telefono && <small className="text-muted">{c.telefono}</small>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4 text-dark">
                                        <label className="fw-bold small text-muted text-uppercase mb-2">Método de Pago</label>
                                        <div className="d-flex flex-column gap-2 text-dark">
                                            {['efectivo', 'transferencia', 'tarjeta'].map(met => (<button key={met} className={`btn rounded-pill py-2 text-capitalize fw-bold ${metodoPago === met ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setMetodoPago(met)}>{met}</button>))}
                                        </div>
                                    </div>
                                    <button
                                        className={`btn w-100 py-3 rounded-pill fw-bold shadow-lg ${datosEdicion ? 'btn-warning text-dark' : 'btn-success'}`}
                                        disabled={carrito.length === 0}
                                        onClick={handleGuardar}
                                    >
                                        {datosEdicion ? 'GUARDAR CAMBIOS' : 'CONFIRMAR Y COBRAR'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CajaPage;