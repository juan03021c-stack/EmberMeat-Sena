const URL_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/proyecto/backend";
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

export async function eliminarProducto(id) {
    try {
        const datosFormulario = new FormData();
        datosFormulario.append("id", id);
        const respuesta = await fetch(`${URL_BASE}/Productos/Eliminar.php`, {
            method: "POST",
            body: datosFormulario,
        });
        if (!respuesta.ok) {
            throw new Error("Error al eliminar el producto");
        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
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

export async function eliminarUsuarios(id) {
    try {
        const datosFormulario = new FormData();
        datosFormulario.append("id", id);
        const respuesta = await fetch(`${URL_BASE}/Usuarios/Eliminar.php`, {
            method: "POST",
            body: datosFormulario,
        });
        if (!respuesta.ok) {
            throw new Error("Error al eliminar el usuario");
        }
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}


export async function login(datos) {

    const respuesta = await fetch(`${URL_BASE}/Login/Login.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
    })
    return await respuesta.json();

}

export default obtenerProductos;


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