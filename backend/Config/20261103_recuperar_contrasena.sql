-- Código de 6 números para recuperar la contraseña y cuándo vence
ALTER TABLE usuarios
    ADD COLUMN codigo_recuperacion VARCHAR(6) NULL,
    ADD COLUMN codigo_expira DATETIME NULL;
