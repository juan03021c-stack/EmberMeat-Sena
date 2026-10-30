
import { useEffect, useState, useCallback } from "react";
import "../assets/Mispedidos.css";
import { obtenerPedidosRepartidor } from "../services/Api";

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const MOTIVOS = [
    "Cliente no estaba",
    "Dirección incorrecta",
    "Acceso denegado",
    "Otro",
];

const BADGES = {
    pendiente: {
        texto: "Pendiente",
        clase: "mp-badge--pendiente",
    },
    en_camino: {
        texto: "En camino",
        clase: "mp-badge--camino",
    },
    entregado: {
        texto: "Entregado",
        clase: "mp-badge--entregado",
    },
    cancelado: {
        texto: "Cancelado",
        clase: "mp-badge--cancelado",
    },
    en_preparacion: {
        texto: "En preparación",
        clase: "mp-badge--pendiente",
    },
    listo_para_entrega: {
        texto: "Listo para entrega",
        clase: "mp-badge--pendiente",
    },
};

const formatoCOP = (valor) =>
    "$" + (Number(valor) || 0).toLocaleString("es-CO");

const formatoFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const fechaValida = new Date(fecha.replace(" ", "T"));

    if (Number.isNaN(fechaValida.getTime())) return fecha;

    return fechaValida.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatoHora = (fecha) => {
    if (!fecha) return "No especificada";

    const fechaValida = new Date(fecha.replace(" ", "T"));

    if (Number.isNaN(fechaValida.getTime())) return fecha;

    return fechaValida.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* =====================================================
   NORMALIZAR INFORMACIÓN DE LA API
===================================================== */

function normalizarPedido(p) {
    let items = [];

    // Si la API devuelve los productos como un arreglo
    if (Array.isArray(p.items)) {
        items = p.items;
    } else if (Array.isArray(p.productos)) {
        items = p.productos;
    }

    // Si la API devuelve GROUP_CONCAT como texto
    else if (typeof p.productos === "string" && p.productos.trim()) {
        items = p.productos.split(", ").map((producto) => {
            const coincidencia = producto.match(/^(.*?) \(x(\d+)\)$/);

            return {
                nombre: coincidencia
                    ? coincidencia[1]
                    : producto,
                cantidad: coincidencia
                    ? Number(coincidencia[2])
                    : 1,
            };
        });
    }

    const nombreCliente =
        p.nombre_cliente ||
        p.cliente?.nombre ||
        "Cliente sin nombre";

    const telefono =
        p.telefono_cliente ||
        p.cliente?.telefono ||
        "";

    const direccion = [
        p.direccion_entrega || p.direccion,
        p.barrio,
        p.ciudad,
    ]
        .filter(Boolean)
        .join(", ");

    return {
        ...p,

        id: p.id,
        numero_pedido: p.numero_pedido || p.id,

        cliente: {
            nombre: nombreCliente,
            telefono,
        },

        direccion: direccion || "Sin dirección registrada",

        items,

        total: Number(p.total) || 0,

        fecha: formatoFecha(
            p.fecha_pedido || p.created_at || p.fecha
        ),

        estimado: formatoHora(
            p.hora_estimada_entrega
        ),

        estado: String(p.estado || "pendiente").toLowerCase(),
    };
}

/* =====================================================
   AVATAR
===================================================== */

function Avatar({ cliente }) {
    const iniciales = (cliente || "C")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-medium"
            style={{
                width: 36,
                height: 36,
                background: "var(--ember-red)",
                fontSize: "var(--text-body-sm)",
            }}
        >
            {iniciales}
        </div>
    );
}

/* =====================================================
   ICONOS
===================================================== */

const Svg = ({ size = 18, children, ...rest }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
    >
        {children}
    </svg>
);

const IconPhone = (p) => (
    <Svg {...p}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </Svg>
);

const IconPin = (p) => (
    <Svg {...p}>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Svg>
);

const IconClock = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </Svg>
);

const IconCheck = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12 3 3 5-6" />
    </Svg>
);

const IconX = (p) => (
    <Svg {...p}>
        <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
);

/* =====================================================
   TARJETA DE PEDIDO
===================================================== */

function PedidoCard({
    pedido,
    onMarcarEnCamino,
    onConfirmar,
    onFallido,
}) {
    const badge = BADGES[pedido.estado] || {
        texto: pedido.estado,
        clase: "mp-badge--pendiente",
    };

    const telefono = pedido.cliente.telefono;

    return (
        <article className="card mp-card p-3">

            <header className="d-flex flex-wrap justify-content-between gap-2 mb-3 align-items-center">

                <div className="d-flex align-items-center gap-2">
                    <span className="mp-order-id">
                        #{pedido.numero_pedido}
                    </span>

                    <span className={`mp-badge ${badge.clase}`}>
                        {badge.texto}
                    </span>
                </div>

                <span className="mp-date">
                    {pedido.fecha}
                </span>

            </header>

            <div className="d-flex align-items-center gap-2 mb-2">

                <Avatar cliente={pedido.cliente.nombre} />

                <div>
                    <div className="mp-client-name">
                        {pedido.cliente.nombre}
                    </div>

                    {telefono ? (
                        <a
                            className="mp-phone"
                            href={`tel:${telefono.replace(/\s/g, "")}`}
                        >
                            <IconPhone size={15} />
                            {telefono}
                        </a>
                    ) : (
                        <span className="mp-phone">
                            Teléfono no registrado
                        </span>
                    )}
                </div>

            </div>

            <div className="mp-address d-flex align-items-center gap-2 mb-2">
                <IconPin size={22} />
                <span>{pedido.direccion}</span>
            </div>

            <div className="mp-eta mb-3">
                <IconClock size={20} />
                <span>
                    Entrega estimada: {pedido.estimado}
                </span>
            </div>

            <ul className="mp-items mb-3">
                {pedido.items.length > 0 ? (
                    pedido.items.map((item, index) => (
                        <li key={item.id || index}>
                            {item.nombre || item.nombre_producto}
                            {" ×"}
                            {item.cantidad}
                        </li>
                    ))
                ) : (
                    <li>No hay productos registrados</li>
                )}
            </ul>

            <p className="mp-total mb-3">
                Total: {formatoCOP(pedido.total)}
            </p>

            {pedido.estado === "pendiente" ? (

                <button
                    type="button"
                    className="mp-btn mp-btn--primary"
                    onClick={() => onMarcarEnCamino(pedido.id)}
                >
                    Marcar en camino
                </button>

            ) : pedido.estado === "en_camino" ? (

                <div className="d-grid gap-2">

                    <button
                        type="button"
                        className="mp-btn mp-btn--success"
                        onClick={() => onConfirmar(pedido.id)}
                    >
                        Confirmar entrega
                    </button>

                    <button
                        type="button"
                        className="mp-btn mp-btn--danger-outline"
                        onClick={() => onFallido(pedido.id)}
                    >
                        Registrar intento fallido
                    </button>

                </div>

            ) : null}

        </article>
    );
}

/* =====================================================
   PEDIDO ENTREGADO
===================================================== */

function CompletadoRow({ pedido }) {
    return (
        <article className="mp-done card">

            <IconCheck size={40} />

            <div className="flex-grow-1">

                <div className="mp-order-id">
                    #{pedido.numero_pedido}
                </div>

                <div className="mp-done-sub">
                    {pedido.cliente.nombre}
                    {" · Entregado"}
                </div>

            </div>

            <span className="mp-badge mp-badge--entregado">
                Entregado
            </span>

        </article>
    );
}

/* =====================================================
   MODAL DE INTENTO FALLIDO
===================================================== */

function ModalFallido({ onCerrar, onRegistrar }) {

    const [motivo, setMotivo] = useState("");

    useEffect(() => {

        const onKey = (e) => {
            if (e.key === "Escape") onCerrar();
        };

        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("keydown", onKey);
        };

    }, [onCerrar]);

    return (
        <div
            className="mp-overlay"
            onClick={(e) =>
                e.target === e.currentTarget && onCerrar()
            }
        >

            <div
                className="mp-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mp-modal-title"
            >

                <div className="d-flex align-items-center justify-content-between mb-4">

                    <h2 id="mp-modal-title" className="mp-modal-title">
                        Registrar intento fallido
                    </h2>

                    <button
                        type="button"
                        className="mp-close"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                    >
                        <IconX size={26} />
                    </button>

                </div>

                <div className="row g-2 mb-4">

                    {MOTIVOS.map((m) => (
                        <div className="col-6" key={m}>

                            <button
                                type="button"
                                className={`mp-reason ${motivo === m ? "is-selected" : ""}`}
                                onClick={() => setMotivo(m)}
                            >
                                {m}
                            </button>

                        </div>
                    ))}

                </div>

                <div className="row g-2">

                    <div className="col-6">
                        <button
                            type="button"
                            className="mp-btn mp-btn--primary"
                            disabled={!motivo}
                            onClick={() => onRegistrar(motivo)}
                        >
                            Registrar
                        </button>
                    </div>

                    <div className="col-6">
                        <button
                            type="button"
                            className="mp-btn mp-btn--ghost"
                            onClick={onCerrar}
                        >
                            Cancelar
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}

/* =====================================================
   VISTA PRINCIPAL
===================================================== */

export default function MisPedidos() {

    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [tab, setTab] = useState("pendientes");
    const [pedidoFallido, setPedidoFallido] = useState(null);

    /* ---------------------------------------------
       CONSULTAR PEDIDOS
    --------------------------------------------- */

    const cargarPedidos = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const respuesta = await obtenerPedidosRepartidor();

            // Admite tanto un arreglo como la respuesta
            // { success: true, pedidos: [...] }
            const datos = Array.isArray(respuesta)
                ? respuesta
                : respuesta?.pedidos || [];

            const pedidosNormalizados = datos.map(normalizarPedido);

            setPedidos(pedidosNormalizados);

        } catch (error) {

            console.error("Error al consultar pedidos:", error);

            setError("No se pudieron cargar los pedidos.");

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {
        cargarPedidos();
    }, [cargarPedidos]);

    /* ---------------------------------------------
       FILTRAR PEDIDOS
    --------------------------------------------- */

    const pendientes = pedidos.filter((p) =>
        !["entregado", "cancelado"].includes(p.estado)
    );

    const completados = pedidos.filter(
        (p) => p.estado === "entregado"
    );

    /* ---------------------------------------------
       ACTUALIZAR ESTADO LOCAL
    --------------------------------------------- */

    const actualizar = (id, cambios) => {

        setPedidos((prev) =>
            prev.map((p) =>
                String(p.id) === String(id)
                    ? { ...p, ...cambios }
                    : p
            )
        );

    };

    /* ---------------------------------------------
       MARCAR EN CAMINO
    --------------------------------------------- */

    const marcarEnCamino = (id) => {

        actualizar(id, {
            estado: "en_camino",
        });

    };

    /* ---------------------------------------------
       CONFIRMAR ENTREGA
    --------------------------------------------- */

    const confirmarEntrega = (id) => {

        actualizar(id, {
            estado: "entregado",
            entregadoA: new Date().toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        });

    };

    /* ---------------------------------------------
       REGISTRAR INTENTO FALLIDO
    --------------------------------------------- */

    const registrarFallido = (motivo) => {

        console.log("Intento fallido:", {
            pedidoId: pedidoFallido,
            motivo,
        });

        // Por ahora solo cerramos el modal.
        // La actualización real debe hacerse mediante una API.

        setPedidoFallido(null);

    };

    /* =================================================
       RENDERIZADO
    ================================================= */

    return (

        <main className="mp">

            <div className="mp-inner">

                <header className="mp-header">

                    <h1 className="mp-title">
                        Mis pedidos
                    </h1>

                    <p className="mp-subtitle">
                        Gestiona las entregas y consulta el historial de tus pedidos.
                    </p>

                </header>

                {/* PESTAÑAS */}

                <div
                    className="d-flex flex-wrap gap-2 mb-4"
                    role="tablist"
                >

                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "pendientes"}
                        className={`mp-tab ${tab === "pendientes" ? "is-active" : ""}`}
                        onClick={() => setTab("pendientes")}
                    >
                        Pendientes de entrega ({pendientes.length})
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "completados"}
                        className={`mp-tab ${tab === "completados" ? "is-active" : ""}`}
                        onClick={() => setTab("completados")}
                    >
                        Completados ({completados.length})
                    </button>

                </div>

                {/* CONTENIDO */}

                <div className="mp-orders">

                    {loading ? (

                        <p className="mp-empty">
                            Cargando tus pedidos...
                        </p>

                    ) : error ? (

                        <div className="mp-empty">
                            <p>{error}</p>

                            <button
                                type="button"
                                className="mp-btn mp-btn--primary"
                                onClick={cargarPedidos}
                            >
                                Intentar nuevamente
                            </button>
                        </div>

                    ) : tab === "pendientes" ? (

                        pendientes.length > 0 ? (

                            pendientes.map((pedido) => (

                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onMarcarEnCamino={marcarEnCamino}
                                    onConfirmar={confirmarEntrega}
                                    onFallido={setPedidoFallido}
                                />

                            ))

                        ) : (

                            <p className="mp-empty">
                                No tienes pedidos pendientes por entregar.
                            </p>

                        )

                    ) : (

                        completados.length > 0 ? (

                            completados.map((pedido) => (

                                <CompletadoRow
                                    key={pedido.id}
                                    pedido={pedido}
                                />

                            ))

                        ) : (

                            <p className="mp-empty">
                                Aún no tienes pedidos entregados.
                            </p>

                        )

                    )}

                </div>

            </div>

            {/* MODAL */}

            {pedidoFallido !== null && (

                <ModalFallido
                    onCerrar={() => setPedidoFallido(null)}
                    onRegistrar={registrarFallido}
                />

            )}

        </main>

    );

}
