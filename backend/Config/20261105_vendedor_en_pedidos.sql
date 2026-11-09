-- Guarda qué vendedor hizo el pedido para pasarlo a la venta
ALTER TABLE pedidos
    ADD COLUMN vendedor_id INT(10) UNSIGNED NULL AFTER repartidor_id,
    ADD CONSTRAINT fk_pedidos_vendedor
        FOREIGN KEY (vendedor_id) REFERENCES usuarios (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
