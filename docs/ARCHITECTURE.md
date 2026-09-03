# Arquitetura CHEFE Elite v2

## Objetivo
Evoluir o protótipo singleton para uma plataforma multi-profissional sem quebrar as telas e tabelas `chefe_*` existentes.

## Limites de domínio
- `src/routes`: composição de páginas e loaders/actions.
- `src/features`: domínio por fluxo (`auth`, `social`, `discover`, `queue`, `alert`, `chat`, `cockpit`).
- `src/components`: componentes visuais compartilhados e legado.
- `src/lib`: integrações, autenticação, validação e serviços puros.

Cada operação nova recebe `professional_id` explícito. O profissional funciona como tenant operacional; usuários podem atuar como clientes ou membros profissionais por meio de `professional_members`.

## Segurança
Supabase Auth é a identidade. Tabelas expostas usam RLS. Dados públicos (perfil publicado, posts publicados e serviços ativos) têm leitura anônima limitada; escrita e dados operacionais exigem autenticação e políticas de membership. Nunca usar `user_metadata` para autorização.

## Tempo real e consistência
Fila, chat e alertas podem usar Supabase Realtime após as policies estarem validadas. A ordenação da fila é garantida por `position` e índice por profissional/status; a agenda usa intervalo temporal e constraint de status. Mutations devem ser idempotentes no nível da aplicação.

## Migração incremental
A migration nova é somente aditiva. O contrato legado (`chefe_profile`, filas e conteúdo existentes) permanece intacto. Adaptadores em `src/features` permitem migrar tela por tela sem mover o protótipo nesta etapa.

## Evolução
1. Criar profissional e membership.
2. Migrar serviços e agenda.
3. Migrar fila e alertas.
4. Migrar feed, stories, reviews e chat.
5. Remover dependências legadas somente em uma migração futura explicitamente aprovada.
