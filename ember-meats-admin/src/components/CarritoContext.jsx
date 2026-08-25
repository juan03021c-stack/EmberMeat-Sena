import { createContext, useContext, useState, useEffect } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  // Cargar carrito desde localStorage al iniciar
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carritoEmber')
    return guardado ? JSON.parse(guardado) : []
  })

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('carritoEmber', JSON.stringify(carrito))
  }, [carrito])

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const aumentarCantidad = (id) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    )
  }

  const disminuirCantidad = (id) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }

  const vaciarCarrito = () => setCarrito([])

  // Totales calculados
  const cantidadTotal = carrito.reduce((sum, item) => sum + item.cantidad, 0)
  const totalPrecio = carrito.reduce((sum, item) => {
    const precio =
      typeof item.precio === 'number'
        ? item.precio
        : Number(item.precio)

          
    return sum + (precio * item.cantidad)  
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
        totalPrecio,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}