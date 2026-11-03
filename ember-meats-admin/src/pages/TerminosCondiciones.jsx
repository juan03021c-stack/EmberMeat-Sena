import { NavLink } from 'react-router-dom';
import { FileText, ShieldCheck } from 'lucide-react';
import '../assets/EmberMeat.css';

/* Cada documento es una lista de secciones: título + párrafos */
const terminos = [
    {
        titulo: '1. Aceptación',
        textos: [
            'Al navegar en EmberMeat o hacer un pedido, aceptas estos términos y condiciones. Si no estás de acuerdo, por favor no uses la tienda.',
        ],
    },
    {
        titulo: '2. Productos y precios',
        textos: [
            'Nuestros embutidos son artesanales, por lo que el peso, color o forma pueden variar un poco entre unidades.',
            'Los precios están en pesos colombianos (COP) e incluyen los impuestos aplicables. Pueden cambiar sin previo aviso, pero se respeta el precio que aparecía al momento de confirmar el pedido.',
            'Los pedidos están sujetos a la disponibilidad de inventario.',
        ],
    },
    {
        titulo: '3. Pedidos',
        textos: [
            'Para comprar debes llenar el formulario con datos reales: cédula, nombre, correo, teléfono y dirección. Al confirmar, recibirás un número de pedido y un correo de confirmación.',
            'EmberMeat puede cancelar un pedido si los datos son falsos, si no hay inventario o si el pago no se aprueba. En ese caso te avisaremos por correo o teléfono.',
        ],
    },
    {
        titulo: '4. Pagos',
        textos: [
            'Puedes pagar en línea a través de la pasarela Wompi (tarjeta, PSE, Nequi, entre otros) o pagar en el punto físico en efectivo o transferencia.',
            'EmberMeat no guarda los datos de tu tarjeta ni de tu cuenta bancaria; el pago en línea lo procesa directamente Wompi.',
        ],
    },
    {
        titulo: '5. Envíos y entregas',
        textos: [
            'Puedes elegir entrega a domicilio o recoger en el punto. Los tiempos de entrega son aproximados y pueden variar por la zona o el clima.',
            'Si el repartidor no logra entregar el pedido (no hay quien reciba, dirección incorrecta, etc.), te contactaremos para coordinar un nuevo intento.',
            'Al recibir, revisa que el producto llegue sellado y en buen estado.',
        ],
    },
    {
        titulo: '6. Derecho de retracto, cambios y garantía',
        textos: [
            'Por tratarse de alimentos perecederos, no aplica el derecho de retracto, según la excepción del artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor).',
            'Si el producto llega en mal estado, vencido o diferente a lo que pediste, avísanos dentro de las 24 horas siguientes a la entrega, con fotos, y te lo cambiamos o te devolvemos el dinero.',
        ],
    },
    {
        titulo: '7. Conservación del producto',
        textos: [
            'Una vez entregado, el cliente es responsable de mantener la cadena de frío según las indicaciones del empaque. No respondemos por daños causados por mal almacenamiento.',
        ],
    },
    {
        titulo: '8. Cambios a estos términos',
        textos: [
            'EmberMeat puede actualizar estos términos en cualquier momento. La versión vigente es la publicada en esta página.',
        ],
    },
];

const tratamientoDatos = [
    {
        titulo: '1. Responsable',
        textos: [
            'EmberMeat, tienda de embutidos artesanales ubicada en Antioquia, Colombia, es responsable del tratamiento de tus datos personales, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
            'Contacto: hola@embermeat.co · +57 300 000 0000.',
        ],
    },
    {
        titulo: '2. Datos que recolectamos',
        textos: [
            'Cédula, nombre completo, correo electrónico, teléfono, dirección de entrega y el historial de tus pedidos.',
        ],
    },
    {
        titulo: '3. Para qué usamos tus datos',
        textos: [
            'Finalidades necesarias para la compra: registrar y gestionar tus pedidos, procesar el pago, hacer la entrega, enviarte la confirmación y el estado del pedido, y atender quejas o garantías.',
        ],
    },
    {
        titulo: '4. Fines comerciales',
        textos: [
            'Con tu autorización, también podemos usar tu correo y teléfono para enviarte promociones, descuentos, lanzamientos de nuevos productos, encuestas de satisfacción y publicidad de EmberMeat, por correo electrónico, WhatsApp o mensaje de texto.',
            'Esta autorización es voluntaria: no aceptarla no te impide comprar. Puedes retirarla cuando quieras escribiéndonos a hola@embermeat.co o respondiendo al mensaje con la palabra "NO MÁS".',
            'EmberMeat no vende ni presta tus datos a terceros. Solo los compartimos con quienes nos ayudan a prestar el servicio (por ejemplo, la pasarela de pagos Wompi) y únicamente para esa finalidad.',
        ],
    },
    {
        titulo: '5. Tus derechos',
        textos: [
            'Como titular de los datos puedes: conocer, actualizar y corregir tu información; pedir prueba de la autorización que nos diste; saber cómo hemos usado tus datos; revocar la autorización o pedir que los borremos cuando no exista un deber legal de conservarlos; y presentar quejas ante la Superintendencia de Industria y Comercio (SIC).',
        ],
    },
    {
        titulo: '6. Cómo ejercer tus derechos',
        textos: [
            'Escríbenos a hola@embermeat.co indicando tu nombre, cédula y lo que solicitas.',
            'Respondemos consultas en máximo 10 días hábiles y reclamos en máximo 15 días hábiles, según la Ley 1581 de 2012.',
        ],
    },
    {
        titulo: '7. Seguridad y conservación',
        textos: [
            'Aplicamos medidas técnicas para proteger tu información, como el cifrado de contraseñas. Conservamos los datos mientras sean necesarios para las finalidades descritas o por obligación legal.',
        ],
    },
];

const documentos = {
    terminos: {
        titulo: 'Términos y condiciones',
        subtitulo: 'Reglas de uso de la tienda y de compra de nuestros productos',
        icono: FileText,
        secciones: terminos,
    },
    datos: {
        titulo: 'Tratamiento de datos personales',
        subtitulo: 'Cómo usamos tu información, incluidos los fines comerciales',
        icono: ShieldCheck,
        secciones: tratamientoDatos,
    },
};

export default function TerminosCondiciones({ tipo = 'terminos' }) {
    const documento = documentos[tipo];
    const Icono = documento.icono;

    return (
        <div className="catalogo-page">
            <div className="container py-4 py-lg-5" style={{ maxWidth: 860 }}>
                <header className="mb-4">
                    <h1 className="catalogo-titulo d-flex align-items-center gap-3">
                        <Icono size={36} strokeWidth={1.6} className="text-ember-red" />
                        {documento.titulo}
                    </h1>
                    <p className="catalogo-subtitulo">{documento.subtitulo}</p>
                </header>

                {/* Cambiar entre los dos documentos */}
                <nav className="d-flex gap-2 mb-4 flex-wrap">
                    <NavLink
                        to="/terminos"
                        className={tipo === 'terminos' ? 'btn-ember text-decoration-none' : 'btn-vaciar w-auto mt-0 px-4 text-decoration-none'}
                    >
                        Términos y condiciones
                    </NavLink>
                    <NavLink
                        to="/tratamiento-datos"
                        className={tipo === 'datos' ? 'btn-ember text-decoration-none' : 'btn-vaciar w-auto mt-0 px-4 text-decoration-none'}
                    >
                        Tratamiento de datos
                    </NavLink>
                </nav>

                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 p-md-5">
                        {documento.secciones.map((seccion) => (
                            <section key={seccion.titulo} className="mb-4">
                                <h2 className="h5 fw-bold text-ember-red mb-2">{seccion.titulo}</h2>
                                {seccion.textos.map((texto) => (
                                    <p key={texto} className="mb-2 lh-base">{texto}</p>
                                ))}
                            </section>
                        ))}

                        <p className="small text-muted mb-0 border-top pt-3">
                            Última actualización: noviembre de 2026.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
