const URL_BASE = "http://localhost:8080/proyecto/backend";
export { URL_BASE };

export async function obtenerProductos() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Productos/Listar.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.productos)) return datos.productos;
        if (Array.isArray(datos)) return datos;
        return [];
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function obtenerUsuarios() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Usuarios/Listar.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener los usuarios");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.usuarios)) return datos.usuarios;
        if (Array.isArray(datos)) return datos;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function obtenerCategorias() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Categorias/Listar.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener las categorías");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.categorias)) return datos.categorias;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}
export async function obtenerPedidos() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Pedidos/Listar.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener los pedidos");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.pedidos)) return datos.pedidos;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}


export const obtenerPedidosRepartidor = async () => {
    try {
        const respuesta = await fetch(
            `${URL_BASE}/Pedidos/Repartidor.php`
        );

        const data = await respuesta.json();

        if (!respuesta.ok || !data.success) {
            throw new Error(data.mensaje || 'Error al obtener pedidos repartidor');
        }

        return data.pedidos;

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        throw error;
    }
};


export async function obtenerProductosDestacados() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Productos/ProductosDestacados.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos destacados");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.productos)) return datos.productos;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function crearProducto(datosFormulario) {
    try {
        const respuesta = await fetch(`${URL_BASE}/Productos/Crear.php`, {
            method: "POST",
            body: datosFormulario,
            
        });
        if (!respuesta.ok) {
            throw new Error("Error al crear el producto");
        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function actualizarProducto(datosFormulario) {
    try {
        const respuesta = await fetch(`${URL_BASE}/Productos/Actualizar.php`, {
            method: "POST",
            body: datosFormulario,
        });
        if (!respuesta.ok) {
            throw new Error("Error al actualizar el producto");
        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function cambiarEstadoProducto(id, activo) {
    try {
        const datosFormulario = new FormData();
        datosFormulario.append("id", id);
        datosFormulario.append("activo", activo ? "1" : "0");
        const respuesta = await fetch(`${URL_BASE}/Productos/Inhabilitar.php`, {
            method: "POST",
            body: datosFormulario,
        });
        const resultado = await respuesta.json().catch(() => null);
        if (!respuesta.ok || (resultado && resultado.success === false)) {
            throw new Error(resultado?.message || "Error al cambiar el estado del producto");
        }
        return resultado;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function inhabilitarProducto(id) {
    return cambiarEstadoProducto(id, false);
}

export async function eliminarProducto(id) {
    return inhabilitarProducto(id);
}

export async function obtenerRoles() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Usuarios/Roles.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener los roles");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.roles)) return datos.roles;
        if (Array.isArray(datos)) return datos;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function crearUsuarios(datosFormulario) {
    try {
        const respuesta = await fetch(`${URL_BASE}/Usuarios/Crear.php`, {
            method: "POST",
            body: datosFormulario,
        });
        if (!respuesta.ok) {
            throw new Error("Error al crear el usuario");
        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function actualizarUsuarios(id, datosFormulario) {
    try {
        const datos = datosFormulario instanceof FormData
            ? datosFormulario
            : new FormData();
        datos.append("id", id);

        const respuesta = await fetch(`${URL_BASE}/Usuarios/Actualizar.php`, {
            method: "POST",
            body: datos,
        });
        if (!respuesta.ok) {
            throw new Error("Error al actualizar el usuario");
        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function cambiarEstadoUsuario(id, activo) {
    try {
        const datosFormulario = new FormData();
        datosFormulario.append("id", id);
        datosFormulario.append("activo", activo ? "1" : "0");
        const respuesta = await fetch(`${URL_BASE}/Usuarios/Inhabilitar.php`, {
            method: "POST",
            body: datosFormulario,
        });
        const resultado = await respuesta.json().catch(() => null);
        if (!respuesta.ok || (resultado && resultado.success === false)) {
            throw new Error(resultado?.message || "Error al cambiar el estado del usuario");
        }
        return resultado;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function inhabilitarUsuario(id) {
    return cambiarEstadoUsuario(id, false);
}

export async function eliminarUsuarios(id) {
    return inhabilitarUsuario(id);
}


export async function login(datos) {
    const respuesta = await fetch(`${URL_BASE}/Login/Login.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(datos),
    });

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error("El servidor devolvió una respuesta no válida.");
    }

    if (!respuesta.ok || !resultado.success) {
        throw new Error(
            resultado.message || "No fue posible iniciar sesión."
        );
    }

    return resultado;
}



/**
 * Obtiene la lista de usuarios para usar como clientes en el modal de ventas.
 */
export async function obtenerClientes() {
    try {
      const respuesta = await fetch(`${URL_BASE}/Usuarios/Listar.php?rol=vendedor`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener los clientes");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.usuarios)) return datos.usuarios;
        if (Array.isArray(datos)) return datos;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Crea una nueva venta en la base de datos.
 * Endpoint: POST backend/Ventas/Crear.php
 */
export async function crearVenta(venta) {
    try {
        const respuesta = await fetch(`${URL_BASE}/Ventas/Crear.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(venta),
        });
        if (!respuesta.ok) {
            throw new Error("Error al crear la venta");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear la venta:", error);
        return { success: false, message: error.message };
    }
}



export async function crearPedido(datoCliente, productosPedido) {

    try {
        const respuesta = await fetch(`${URL_BASE}/Pedidos/Crear.php`, {
            method: "POST",
            /*estoy convirtiendo el objeto en json para enviar datos al backend*/
            body: JSON.stringify({ datoCliente, productosPedido }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!respuesta.ok) {
            throw new Error("Error al crear el pedido");

        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}


/**
 * Obtiene el listado de ventas ya registradas (con sus productos).
 * Endpoint: GET backend/Ventas/Listar.php
 */
export async function obtenerVentas() {
    try {
        const respuesta = await fetch(`${URL_BASE}/Ventas/Listar.php`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener las ventas");
        }
        const datos = await respuesta.json();
        if (datos && Array.isArray(datos.ventas)) return datos.ventas;
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default obtenerProductos;


export async function buscarClientePorCedula(cedula) {
    try {
        const respuesta = await fetch(
            /**lo que estoy haciendo aqui es buscar un cliente por cedula 
             cedula=${encodeURIComponent(cedula)} es para que el valor de la cedula
            se pueda enviar correctamente al backend*/
            `${URL_BASE}/Usuarios/BuscarPorCedula.php?cedula=${encodeURIComponent(cedula)}`
        )
        return await respuesta.json()
    } catch (error) {
        console.error(error)
        return { success: false, message: error.message }
    }
}

export async function consultarTransaccionWompi(transaccionId) {
    try {
        const respuesta = await fetch(
            `${URL_BASE}/Config/configWompi/ConsultarTransaccion.php?id=${encodeURIComponent(transaccionId)}`
        );
        if (!respuesta.ok) {
            throw new Error("Error al consultar la transacción en Wompi");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error al consultar transacción Wompi:", error);
        return { success: false, message: error.message };
    }   
}

export async function consultarTransaccionPorReferencia(referencia) {
    try {
        const respuesta = await fetch(
            `${URL_BASE}/Config/configWompi/ConsultarTransaccion.php?reference=${encodeURIComponent(referencia)}`
        );
        if (!respuesta.ok) {
            throw new Error("Error al consultar la referencia en Wompi");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error al consultar referencia Wompi:", error);
        return { success: false, message: error.message };
    }
}

export async function consultarEstadoPedido(numeroPedido, pedidoId = null) {
    try {
        const params = new URLSearchParams();
        if (numeroPedido) params.append('numero_pedido', numeroPedido);
        if (pedidoId) params.append('pedido_id', pedidoId);

        const respuesta = await fetch(`${URL_BASE}/Pedidos/ConsultarEstado.php?${params.toString()}`);
        if (!respuesta.ok) {
            throw new Error("Error al consultar el estado del pedido");
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Error al consultar estado del pedido:", error);
        return { success: false, message: error.message };
    }
}


/* estadisticas*/

export async function obtenerEstadisticas() {
    const respuesta = await fetch(
        `${URL_BASE}/Dashboard/Estadisticas.php`
    );

    if (!respuesta.ok) {
        throw new Error("Error al consultar las estadísticas");
    }

    const datos = await respuesta.json();

    if (!datos.success) {
        throw new Error(
            datos.mensaje || "Error del servidor"
        );
    }

    return datos;
}
export async function actualizarCategoria(idOrFormData, datosFormulario) {
    try {
        let datos;
        if (idOrFormData instanceof FormData) {
            datos = idOrFormData;
        } else {
            datos = datosFormulario instanceof FormData
                ? datosFormulario
                : new FormData();
            if (idOrFormData) {
                datos.set("id", idOrFormData);
            }
        }

        const respuesta = await fetch(`${URL_BASE}/Categorias/Actualizar.php`, {
            method: "POST",
            body: datos,
        });
        const resultado = await respuesta.json().catch(() => null);
        if (!respuesta.ok || (resultado && resultado.success === false)) {
            throw new Error(resultado?.message || "Error al actualizar la categoría");
        }
        return resultado;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function crearCategoria(datosFormulario) {
    try {
        const respuesta = await fetch(`${URL_BASE}/Categorias/Crear.php`, {
            method: "POST",
            body: datosFormulario,
        });
        const resultado = await respuesta.json().catch(() => null);
        if (!respuesta.ok || (resultado && resultado.success === false)) {
            throw new Error(resultado?.message || "Error al crear la categoría");
        }
        return resultado;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function cambiarEstadoCategoria(id, activa) {
    try {
        const datos = new FormData();
        datos.append("id", id);
        datos.append("activa", activa ? "1" : "0");

        const respuesta = await fetch(`${URL_BASE}/Categorias/Inhabilitar.php`, {
            method: "POST",
            body: datos,
        });
        const resultado = await respuesta.json().catch(() => null);
        if (!respuesta.ok || (resultado && resultado.success === false)) {
            throw new Error(resultado?.message || "Error al cambiar el estado de la categoría");
        }
        return resultado;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

export async function inhabilitarCategoria(id) {
    return cambiarEstadoCategoria(id, false);
}


 
