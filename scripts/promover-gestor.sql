-- Promove um usuário ao papel de gestor (US-04).
-- Uso: substitua o e-mail e execute no SQL Editor do Supabase
-- (ou: npx supabase db query --file scripts/promover-gestor.sql em dev local).

update usuarios
set papel = 'gestor'
where email = 'gestor@exemplo.com';
