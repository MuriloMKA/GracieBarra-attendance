# 📚 Guia de Importação de Alunos em Lote

## 📋 Resumo Executivo

Foram processados **132 alunos** do arquivo `AlunosGB.json` com classificação automática por programa:

| Programa  | Quantidade | Descrição                                        |
| --------- | ---------- | ------------------------------------------------ |
| **GB3**   | 43         | Faixas Azul, Roxa, Marrom, Preta (avançadas)     |
| **GB2**   | 16         | Faixa Branca com 16+ anos e 2+ graus             |
| **GB1**   | 20         | Faixa Branca com 16+ anos e menos de 2 graus     |
| **GBK**   | 53         | Faixa Branca menor de 16 anos + Faixas coloridas |
| **TOTAL** | 132        | Todos processados com sucesso                    |

**Alunos que precisam ajuste manual:** 18 (sem email)

---

## 🚀 Processo de Importação

### Etapa 1: Preparação (Já Concluída)

Os arquivos necessários foram gerados automaticamente:

```
✅ alunos-import.json           ← Dados formatados para importação
✅ import-students.js           ← Script de processamento (já executado)
✅ report-missing-data.js       ← Gerador de relatório
✅ alunos-ajustes-manuais.csv   ← Lista de alunos sem email
```

### Etapa 2: Importação no Banco de Dados

#### Opção A: Usando o Script (Recomendado)

```bash
# Configure o .env com a conexão MongoDB
# Exemplo:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/graciebarra

node bulk-import-students.js
```

**O que o script faz:**

- ✅ Conecta ao MongoDB
- ✅ Cria registros de aluno com dados básicos
- ✅ Cria usuários de acesso (email = usuário, data nascimento = senha)
- ✅ Mantém os QR codes existentes
- ✅ Gera relatório final

**Output esperado:**

```
✅ Alunos criados: 114
✅ Usuários de acesso criados: 114
⏭️ Alunos ignorados (já existem): 0
❌ Erros: 0
```

#### Opção B: Manual via API

Se preferir usar a API REST:

```bash
# 1. Gere um token de autenticação
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@academy.com","password":"sua_senha"}'

# 2. Use o token para criar alunos em lote
TOKEN="seu_token_aqui"

cat alunos-import.json | jq '.[]' | while read -r aluno; do
  curl -X POST http://localhost:3001/api/students \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$aluno"
done
```

---

## 🔧 Regras de Classificação Automática

### Programa GB3 (Faixas Avançadas)

- **Faixas:** Azul, Roxa, Marrom, Preta, Cinza/Preta
- **Aplicação:** Automática para todas essas faixas

### Programa GB1 (Branca - 16+ anos, 0-1 grau)

- **Faixas:** Branca
- **Critérios:**
  - Idade ≥ 16 anos
  - Graus < 2

### Programa GB2 (Branca - 16+ anos, 2+ graus)

- **Faixas:** Branca
- **Critérios:**
  - Idade ≥ 16 anos
  - Graus ≥ 2

### Programa GBK (Branca Junior ou Coloridas)

- **Faixas:** Branca (< 16 anos), Cinza/Branca, Amarela/Preta, etc
- **Critérios:**
  - Idade < 16 anos (para faixa branca), OU
  - Faixa colorida que não é Azul/Roxa/Marrom/Preta

---

## 👥 Tratamento de Dados de Acesso

### Usuários com Email e Data de Nascimento ✅

- **Email de acesso:** Usado como login
- **Senha inicial:** Data de nascimento (formato: YYYY-MM-DD)
- **Ação:** Usuário criado automaticamente

Exemplo: João (14/08/1995) → Login: joao@email.com / Senha: 1995-08-14

### Usuários sem Email ❌

- **Quantidade:** 18 alunos
- **Ação:** Cadastre mesmo assim, ajuste email depois
- **Arquivo:** `alunos-ajustes-manuais.csv`

**Lista de alunos sem email:**

1. Benjamim Chaibub Cortez (GBK - White 4°)
2. Daniel Florez Frezarim (GBK - Grey 2°)
3. Gabriel Andrade Serpeloni (GBK - White)
4. Helena Oliveira Raposo (GBK - White 2°)
5. Henrique Antonio Valverde Meinking Junior (GB3 - Blue)
6. Julianne Catherine Martinez de Mendonca (GBK - White 2°)
7. Lorenzo Bezerra Rodrigues (GBK - White 3°)
8. Lorenzo Rodrigues Vasconcelos Bastos (GBK - Grey 2°)
9. Lucca Florez Frezarim (GBK - Grey 7°)
10. Lucca Paes (GBK - White)
11. Luis Fernando Saab (GB3 - Blue)
12. Marcus Vinicius Rezende Multary (GB1 - White)
13. Mariana Reyes Saab (GB3 - Blue)
14. Rafael Milani Ferreira (GBK - Grey 3°)
15. Rafaela Bento Lourenco (GBK - Grey 11°)
16. Sofia Chaibub Cortez (GBK - White 3°)
17. melina bastos (GB3 - Purple 4°)
18. pedroca (GBK - White 10°)

---

## 📱 QR Codes

### Estratégia de Reutilização

- ✅ QR codes existentes são **reutilizados** (não gera novos)
- ✅ Campo `qrCode` no JSON preserva os QR codes originais
- ✅ Alunos sem QR code terão `qrCode: null`

### Se precisar gerar novos QR codes depois:

1. Acesse a página de admin
2. Selecione alunos sem QR code
3. Use o botão "Gerar QR Code em Lote"
4. Imprima os códigos

---

## 🛠️ Pós-Importação

### 1. Ajustar Alunos sem Email

```bash
# Edite o arquivo: alunos-ajustes-manuais.csv
# Preencha as colunas de Email e Data Nascimento

# Depois, atualize via API ou Admin Panel
```

### 2. Verificar Dados

- [ ] Todos os 132 alunos foram criados?
- [ ] Programas corretos por faixa?
- [ ] QR codes preservados?
- [ ] Usuários de acesso funcionando?

### 3. Testar Acesso

```bash
# Teste login de um aluno
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adio.fn@hotmail.com","password":"1988-07-23"}'

# Esperado: Token JWT válido retornado
```

---

## 📊 Estrutura dos Arquivos

### `alunos-import.json`

```json
[
  {
    "name": "Adionara Regina Comin Napoli",
    "email": "adio.fn@hotmail.com",
    "program": "GB2",
    "belt": "White",
    "degrees": 3,
    "birthDate": "1988-07-23",
    "password": "1988-07-23",
    "qrCode": "...base64_ou_string...",
    "skipEmailPassword": false
  },
  ...
]
```

### `alunos-ajustes-manuais.csv`

```csv
Nome,Programa,Faixa,Graus,Email,Data de Nascimento,Observações
Benjamim Chaibub Cortez,GBK,White,4,"FALTANDO","1995-08-14","Sem Email"
...
```

---

## 🆘 Troubleshooting

### Erro: "Email already exists"

**Causa:** Aluno já foi importado antes  
**Solução:** Verifique no banco se já existe, use `skipExisting=true`

### Erro: "Invalid birthDate format"

**Causa:** Data de nascimento em formato incorreto  
**Solução:** Use formato YYYY-MM-DD

### Erro: "MONGODB_URI not configured"

**Causa:** Variável de ambiente não definida  
**Solução:** Crie arquivo `.env` com:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/graciebarra
JWT_SECRET=sua_chave_secreta
```

---

## 📝 Checklist de Implementação

- [ ] Arquivo `AlunosGB.json` disponível
- [ ] Node.js e npm instalados
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env` configurado com MONGODB_URI
- [ ] Script `import-students.js` executado ✅
- [ ] Arquivo `alunos-import.json` gerado ✅
- [ ] Script `bulk-import-students.js` executado
- [ ] 114 alunos criados no banco
- [ ] 18 alunos ajustados manualmente (email)
- [ ] Todos os usuários de acesso funcionando
- [ ] QR codes verificados

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do MongoDB
2. Confira se o `bulk-import-students.js` rodou sem erros
3. Verifique os 18 alunos no arquivo `alunos-ajustes-manuais.csv`
4. Teste login manual no sistema

---

**Última atualização:** 08/05/2026  
**Versão:** 1.0
