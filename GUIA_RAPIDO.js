#!/usr/bin/env node

/**
 * 🚀 GUIA RÁPIDO - IMPORTAÇÃO DE ALUNOS
 *
 * Instruções passo a passo para importar todos os 132 alunos
 * do arquivo AlunosGB.json para o banco de dados MongoDB
 */

console.log(`

╔════════════════════════════════════════════════════════════════╗
║                   📚 GUIA RÁPIDO DE IMPORTAÇÃO                ║
║              Gracie Barra Attendance System v1.0              ║
╚════════════════════════════════════════════════════════════════╝

📊 O QUE FOI GERADO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ alunos-import.json (33 KB)
   └─ 132 alunos formatados e classificados automaticamente
   
✅ alunos-ajustes-manuais.csv (2 KB)
   └─ 18 alunos que precisam de email (para preencher depois)

✅ bulk-import-students.js
   └─ Script que importa tudo no MongoDB

📋 DISTRIBUIÇÃO POR PROGRAMA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  GB3 (Azul para cima)     →  43 alunos
  GBK (Coloridas/Júnior)   →  53 alunos
  GB1 (Branca adulto-Júnior) → 20 alunos
  GB2 (Branca adulto)      →  16 alunos
  ─────────────────────────────────────
  TOTAL                    → 132 alunos ✅

🚀 PRÓXIMAS ETAPAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSO 1️⃣  - CONFIGURAR AMBIENTE
───────────────────────────────────────────────────────────────

  a) Crie ou atualize o arquivo .env:
  
     cp .env.example .env
     
  b) Edit .env e configure:
  
     MONGODB_URI=mongodb+srv://usuario:senha@seu-cluster.mongodb.net/graciebarra
     JWT_SECRET=sua_chave_secreta_aqui
     PORT=3001
  
  💡 TIP: Se usar MongoDB local:
     MONGODB_URI=mongodb://localhost:27017/graciebarra


PASSO 2️⃣  - VERIFICAR DEPENDÊNCIAS
───────────────────────────────────────────────────────────────

  Certifique-se que tem instalado:
  
  ✓ Node.js v16+ → node --version
  ✓ npm           → npm --version
  ✓ MongoDB       → Acessível e rodando
  
  Se faltar instalar dependências:
  
    npm install


PASSO 3️⃣  - EXECUTAR IMPORTAÇÃO
───────────────────────────────────────────────────────────────

  OPÇÃO A - Automática (Recomendada):
  
    node start-import.js
    
  OPÇÃO B - Manual:
  
    node bulk-import-students.js


PASSO 4️⃣  - VERIFICAR RESULTADO
───────────────────────────────────────────────────────────────

  ✓ Todos os 132 alunos foram criados?
  ✓ 114 usuários de acesso criados?
  ✓ Mensagens de erro?
  
  Teste um login:
  
    Email: adio.fn@hotmail.com
    Senha: 1988-07-23


PASSO 5️⃣  - AJUSTES MANUAIS (18 ALUNOS)
───────────────────────────────────────────────────────────────

  Arquivo: alunos-ajustes-manuais.csv
  
  Estes alunos precisam de EMAIL adicionado:
  
  1. Benjamim Chaibub Cortez (GBK - White)
  2. Daniel Florez Frezarim (GBK - Grey)
  3. Gabriel Andrade Serpeloni (GBK - White)
  4. Helena Oliveira Raposo (GBK - White)
  5. Henrique Antonio Valverde Meinking Jr (GB3 - Blue)
  6. Julianne Catherine Martinez de Mendonca (GBK - White)
  7. Lorenzo Bezerra Rodrigues (GBK - White)
  8. Lorenzo Rodrigues Vasconcelos Bastos (GBK - Grey)
  9. Lucca Florez Frezarim (GBK - Grey)
  10. Lucca Paes (GBK - White)
  11. Luis Fernando Saab (GB3 - Blue)
  12. Marcus Vinicius Rezende Multary (GB1 - White)
  13. Mariana Reyes Saab (GB3 - Blue)
  14. Rafael Milani Ferreira (GBK - Grey)
  15. Rafaela Bento Lourenco (GBK - Grey)
  16. Sofia Chaibub Cortez (GBK - White)
  17. melina bastos (GB3 - Purple)
  18. pedroca (GBK - White)
  
  👉 Abra alunos-ajustes-manuais.csv e preencha os emails

🎯 DADOS DE ACESSO CRIADOS AUTOMATICAMENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Email de Login:  Do arquivo JSON
  Senha Inicial:   Data de nascimento (YYYY-MM-DD)
  
  Exemplo:
  ┌──────────────────────────────────────────┐
  │ Email: adio.fn@hotmail.com               │
  │ Senha: 1988-07-23                        │
  └──────────────────────────────────────────┘
  
  ⚠️ IMPORTANTE:
  └─ Solicitar troca de senha na primeira login
  └─ Configurar 2FA/MFA para segurança


🔐 QR CODES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ QR codes existentes são REUTILIZADOS
  ✅ Não precisa tirar fichas físicas novamente
  ✅ Campo qrCode preservado de cada aluno
  
  Se alguém não tiver QR code:
  └─ Gerar depois via Admin Panel


📚 DOCUMENTAÇÃO COMPLETA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  IMPORTACAO_ALUNOS.md     → Guia detalhado com regras
  RESUMO_IMPORTACAO.md     → Estatísticas e checklists
  alunos-ajustes-manuais.csv → Alunos para ajustar
  alunos-import.json       → Dados em formato JSON


⚡ COMMAND RÁPIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  # Setup + Importação tudo junto:
  npm install && cp .env.example .env && echo "Configure .env" && node bulk-import-students.js


❓ PRECISA DE AJUDA?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Verifique os logs do script
  Leia IMPORTACAO_ALUNOS.md seção "Troubleshooting"
  Confirme que MongoDB está acessível


👉 COMECE AGORA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Configure .env
  2. Execute: node bulk-import-students.js
  3. Acompanhe o progresso
  4. Verifique no banco: 132 alunos criados ✅

╔════════════════════════════════════════════════════════════════╗
║                  🎉 Bom Sorte com a Importação!              ║
╚════════════════════════════════════════════════════════════════╝

`);
