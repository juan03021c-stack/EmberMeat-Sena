ALTER TABLE ventas
    ADD COLUMN pedido_id INT(10) UNSIGNED NULL AFTER id,
    ADD UNIQUE KEY uq_ventas_pedido_id (pedido_id),
    ADD CONSTRAINT fk_ventas_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
