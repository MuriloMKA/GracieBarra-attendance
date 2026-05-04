# Populating a Complete Test Student

Este arquivo descreve como executar o script de seed para popular um aluno completo com histórico desde janeiro.

## Pré-requisitos

- Node.js instalado
- MongoDB conectado (verificar `MONGODB_URI` no `.env`)
- Backend rodando ou variáveis de ambiente configuradas

## Executar o Script

No diretório raiz do projeto (ou `server/`):

```bash
node server/seed-complete-student.js
```

## O que será criado

### Aluno: Rafael Mendes

- **Email**: rafael.mendes@example.com
- **Senha**: aluno123
- **Faixa atual**: Azul (Blue)
- **Programa**: GB1
- **Graus atuais**: 1
- **Data de graduação**: 10 de abril de 2026
- **Presenças**: ~60+ presenças de janeiro a maio (segunda, quarta e sexta com 80% de assiduidade)

### Histórico

- **Janeiro - Março 2026**: Faixa Branca (presenças regulares)
- **10 de Abril 2026**: Graduação para Faixa Azul
- **Após graduação**: 2 graus automáticos marcados (12 de abril e 4 de maio)

## Testar no Sistema

1. Faça login como aluno:
   - Email: `rafael.mendes@example.com`
   - Senha: `aluno123`

2. Acesse seu cartão de frequência:
   - Você verá todas as presenças desde janeiro
   - X azul marcando os graus automáticos
   - Bolinha vermelha na data de graduação (10 de abril)

3. No painel do admin:
   - Veja o histórico completo de faixa do aluno
   - Clique nos botões de histórico para ver a ficha da época da faixa branca
   - Veja o progresso e cálculo de graus funcionando

## Dados Gerados

- **~60 presenças confirmadas** (distribuídas seg/qua/sex de jan-maio)
- **1 graduação marcada** (Branca → Azul)
- **2 graus automáticos** confirmados
- **Progressão realista** mostrando o sistema em uso diário

---

Se quiser limpar os dados e recriar, execute:

```bash
# Deletar todas as presenças deste aluno (apagar emails duplicados)
# Ou use o endpoint: POST /api/setup/reset
```
