-- Cria o usuário
CREATE USER ironpump_user WITH PASSWORD 'iron_secret_2024';

-- Dá superpoderes (em dev é mais fácil que ficar dando GRANT um por um)
ALTER USER ironpump_user WITH SUPERUSER;

-- Cria o banco com esse dono
CREATE DATABASE ironpump OWNER ironpump_user;