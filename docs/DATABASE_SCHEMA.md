# Schema CHEFE Elite v2

## Entidades
- `profiles`: extensão pública mínima do usuário autenticado.
- `professionals`: tenant/perfil profissional.
- `professional_members`: vínculo usuário-profissional com papel `owner`, `manager` ou `staff`.
- `services`: catálogo e duração/preço.
- `queues` e `queue_entries`: fila diária e posição do cliente.
- `appointments`: agenda com início/fim e status.
- `posts`, `stories`, `reviews`: conteúdo público moderado por profissional.
- `conversations`, `conversation_members`, `messages`: chat entre usuários.
- `arrival_alerts`: alertas de chegada/status para clientes.
- `notification_preferences`: preferências por usuário e profissional.

Todos os IDs novos são UUID e registros operacionais carregam `professional_id`. Timestamps são `timestamptz` com default UTC.

## Status e integridade
Status são `text` com `check constraints`, evitando enums difíceis de evoluir. Índices cobrem fila ativa, agenda por janela, feed publicado, stories vigentes e mensagens não lidas. Chaves únicas impedem memberships e reviews duplicados.

## RLS
Leitura pública somente de profissionais publicados, serviços ativos, posts publicados, stories vigentes e reviews aprovados. Membros gerenciam o tenant; usuários autenticados acessam apenas suas próprias conversas, mensagens e alertas. Clientes podem criar suas próprias entradas e agendamentos, nunca alterar `professional_id` ou `user_id` via `with check`.

## Compatibilidade legada
Nenhuma tabela `chefe_*` é renomeada, removida ou alterada. A nova camada é a fonte de verdade para novos fluxos; uma futura ponte poderá mapear o singleton legado depois de validação remota e testes de dados.
