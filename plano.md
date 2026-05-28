# Plano multi-academia

## Objetivo

Transformar o sistema em um SaaS para várias academias, com isolamento de dados, permissões por perfil e assinatura ativa por unidade.

## Modelo base

- Uma única base de código.
- Um único sistema com suporte a múltiplas academias.
- Toda entidade principal deve carregar `academy_id`.

## Entidades principais

- Academia
- Usuário
- Perfil de acesso
- Aluno
- Turma
- Presença
- Plano de assinatura
- Pagamento
- Auditoria de ações

## Permissões

- `admin`: gerencia tudo da academia.
- `instrutor`: registra e consulta alunos/presenças.
- `recepção`: cadastra e atualiza alunos.
- `aluno`: acessa apenas seus próprios dados.

## Assinatura

- Cada academia terá status próprio: `trial`, `active`, `past_due`, `canceled`.
- O acesso ao sistema deve depender da assinatura ativa.
- Bloqueio por inadimplência deve acontecer no servidor.

## Segurança e isolamento

- Filtrar todas as consultas por `academy_id`.
- Usar autenticação com token e expiração.
- Registrar logs de login, alterações e exportações.
- Aplicar limite de requisições e validação de permissões.

## Escala futura

- Começar com banco único e isolamento por `academy_id`.
- Se crescer, avaliar banco por academia ou schema separado.
- Preparar estrutura para múltiplas unidades no mesmo cliente.

## Fases de implementação

1. Cadastro de academia e vínculo de usuários.
2. Controle de permissões por perfil.
3. Assinatura e bloqueio por status.
4. Logs, auditoria e relatórios.
5. Evolução para white-label e múltiplas unidades.

## Modelo comercial

- Preferência: assinatura mensal ou anual por academia.
- Possíveis planos: básico, profissional e enterprise.
- White-label pode virar plano premium no futuro.
