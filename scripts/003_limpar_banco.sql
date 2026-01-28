-- Script para limpar todos os dados do banco de dados
-- ATENÇÃO: Este script remove TODOS os dados das tabelas!
-- Execute apenas se tiver certeza de que deseja limpar o banco.

-- Desabilitar temporariamente as verificações de foreign key
SET session_replication_role = 'replica';

-- Limpar dados em ordem (respeitando foreign keys)
TRUNCATE TABLE public.historico CASCADE;
TRUNCATE TABLE public.comentarios CASCADE;
TRUNCATE TABLE public.anexos CASCADE;
TRUNCATE TABLE public.demandas CASCADE;
TRUNCATE TABLE public.escalas CASCADE;
TRUNCATE TABLE public.navios CASCADE;
TRUNCATE TABLE public.membros CASCADE;

-- Reabilitar verificações de foreign key
SET session_replication_role = 'origin';

-- Verificar se as tabelas estão vazias
DO $$
DECLARE
    tabela TEXT;
    contador INTEGER;
BEGIN
    FOR tabela IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('membros', 'navios', 'escalas', 'demandas', 'comentarios', 'anexos', 'historico')
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM public.%I', tabela) INTO contador;
        RAISE NOTICE 'Tabela %: % registros', tabela, contador;
    END LOOP;
END $$;

-- Mensagem de sucesso
SELECT 'Banco de dados limpo com sucesso!' AS resultado;
