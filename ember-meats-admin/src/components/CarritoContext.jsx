
import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'

import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  // Cargar el carrito guardado
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem('carritoEmber')
      return guardado ? JSON.parse(guardado) : []
    } catch (error) {
      console.error('Error al cargar el carrito:', error)
      return []
    }
  })

  // Guardar el carrito cada vez que cambie
  useEffect(() => {
    localStorage.setItem('carritoEmber', JSON.stringify(carrito))
  }, [carrito])

  // Agregar productos y mostrar notificaciones
  const agregarAlCarrito = (producto) => {
    const stock = Number(producto.stock)

    if (!producto.id) {
      Swal.fire({
        icon: 'error',
        title: 'Producto no válido',
        text: 'No se pudo identificar el producto.',
        confirmButtonColor: '#7B1F1F'
      })
      return false
    }

    if (!Number.isFinite(stock) || stock <= 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Producto sin existencias',
        showConfirmButton: false,
        timer: 2500
      })
      return false
    }

    const existente = carrito.find(
      (item) => String(item.id) === String(producto.id)
    )

    const cantidadActual = existente
      ? Number(existente.cantidad) || 0
      : 0

    if (cantidadActual >= stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock máximo alcanzado',
        text: `Solo hay ${stock} unidades disponibles de ${producto.nombre}.`,
        confirmButtonColor: '#7B1F1F'
      })
      return false
    }

    // Actualizar el carrito
    if (existente) {
      setCarrito((prev) =>
        prev.map((item) =>
          String(item.id) === String(producto.id)
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      )
    } else {
      setCarrito((prev) => [
        ...prev,
        { ...producto, cantidad: 1 }
      ])
    }

    // Notificación centralizada
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${producto.nombre} agregado al carrito`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })

    return true
  }

  // Aumentar cantidad respetando el stock
  const aumentarCantidad = (id) => {
    const producto = carrito.find(
      (item) => String(item.id) === String(id)
    )

    if (!producto) return

    if (Number(producto.cantidad) >= Number(producto.stock)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'No hay más unidades disponibles',
        showConfirmButton: false,
        timer: 2000
      })
      return
    }

    setCarrito((prev) =>
      prev.map((item) =>
        String(item.id) === String(id)
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    )
  }

  // Disminuir cantidad
  const disminuirCantidad = (id) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          String(item.id) === String(id)
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  // Eliminar un producto
  const eliminarDelCarrito = (id) => {
    setCarrito((prev) =>
      prev.filter((item) => String(item.id) !== String(id))
    )
  }

  // Vaciar el carrito
  const vaciarCarrito = () => setCarrito([])

  // Calcular cantidades y precio total
  const cantidadTotal = carrito.reduce(
    (sum, item) => sum + (Number(item.cantidad) || 0),
    0
  )

  const totalPrecio = carrito.reduce((sum, item) => {
    const precio = Number(item.precio) || 0
    const cantidad = Number(item.cantidad) || 0

    return sum + precio * cantidad
  }, 0)

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        cantidadTotal,
        totalPrecio
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}
