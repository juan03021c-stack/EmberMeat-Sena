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
        return [];
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
