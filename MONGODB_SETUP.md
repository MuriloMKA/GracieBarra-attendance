# 🗄️ Setup MongoDB - Guia Completo

## ✅ Conexão Configurada

Sua conexão com MongoDB Atlas já está configurada!

```
Database: graciebarra
Cluster: gb-attendence.vw27p8v.mongodb.net
```

## 🚀 Como Usar

### 1. Instalar Dependências

```powershell
cd backend
npm install
```

### 2. Popular o Banco de Dados (Seed)

Execute o script de seed para criar dados iniciais:

```powershell
npm run seed
```

Isso irá criar:

- ✅ 5 usuários de exemplo (1 admin + 4 alunos)
- ✅ 6 horários de aulas
- ✅ 3 check-ins de exemplo

### 3. Iniciar o Servidor

```powershell
npm start
```

Ou em modo desenvolvimento (com auto-reload):

```powershell
npm run dev
```

## 👥 Contas de Teste Criadas

Após executar o seed, você terá:

### Administrador

- **Email**: admin@gb.com
- **Senha**: 123456
- **Faixa**: Preta (1 grau)

### Alunos

- **Email**: aluno@gb.com | **Senha**: 123456 | **Faixa**: Azul (2 graus)
- **Email**: maria@gb.com | **Senha**: 123456 | **Faixa**: Branca (1 grau)
- **Email**: pedro@gb.com | **Senha**: 123456 | **Faixa**: Roxa (3 graus)
- **Email**: ana@gb.com | **Senha**: 123456 | **Faixa**: Branca (0 graus)

## 📊 Verificar Dados no MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Faça login na sua conta
3. Vá para o cluster "gb-attendence"
4. Clique em "Browse Collections"
5. Você verá 3 collections:
   - **users** - Usuários do sistema
   - **checkins** - Check-ins realizados
   - **classes** - Horários de aulas

## 🔧 Estrutura do Banco de Dados

### Collection: users

```javascript
{
  _id: ObjectId,
  name: "João Silva",
  email: "aluno@gb.com",
  password: "$2a$10$...", // bcrypt hash
  type: "student", // ou "admin"
  belt: "AZUL", // GBK, BRANCA, AZUL, ROXA, MARROM, PRETA
  degrees: 2,
  birthDate: ISODate("1995-05-15"),
  lastGraduation: ISODate("2025-06-10"),
  nextGraduation: ISODate("2026-06-10"),
  active: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Collection: checkins

```javascript
{
  _id: ObjectId,
  user: ObjectId, // referência para users
  classId: 1,
  className: "GB2 Avançado",
  time: "19:00",
  date: ISODate,
  status: "pending", // pending, confirmed, rejected
  confirmedBy: ObjectId, // referência para admin que confirmou
  confirmedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Collection: classes

```javascript
{
  _id: ObjectId,
  name: "GB1 Fundamental",
  time: "06:00",
  weekdays: [1, 3, 5], // 0=Domingo, 1=Segunda, etc
  level: "GB1", // GB1, GB2, GB3, Kids, All Levels
  instructor: "Professor Carlos",
  maxStudents: 30,
  active: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🔄 Resetar Banco de Dados

Para limpar e recriar todos os dados:

```powershell
npm run seed
```

⚠️ **Atenção**: Isso apagará TODOS os dados existentes e criará novos dados de exemplo.

## 🔐 Segurança

### Senhas

As senhas são automaticamente criptografadas com bcrypt antes de serem salvas:

```javascript
// No model User, há um pre-save hook:
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### Validação de Senha

```javascript
// Método para comparar senhas:
user.comparePassword(candidatePassword);
```

## 📝 Comandos Úteis

### Conectar ao MongoDB via Shell (Opcional)

Se você tem o MongoDB Compass instalado:

```
mongodb+srv://murilo_dev:MuriloKaspar93blocobe@gb-attendence.vw27p8v.mongodb.net/graciebarra
```

### Verificar Conexão

O servidor mostra o status da conexão ao iniciar:

```
✅ Connected to MongoDB Atlas successfully!
🚀 Server is running on http://localhost:3000
```

Se houver erro:

```
❌ MongoDB connection error: ...
⚠️  Running with mock data...
```

## 🐛 Troubleshooting

### Erro: "Authentication failed"

- Verifique se o usuário e senha estão corretos no `.env`
- Confirme que o usuário tem permissões no MongoDB Atlas

### Erro: "Network timeout"

- Verifique sua conexão com a internet
- Confirme que seu IP está na whitelist do MongoDB Atlas
- No Atlas, vá em "Network Access" e adicione `0.0.0.0/0` para permitir de qualquer lugar

### Erro: "Cannot find module 'mongoose'"

```powershell
cd backend
npm install
```

### Erro ao executar seed

Certifique-se de que:

1. O arquivo `.env` existe na pasta `backend`
2. A `MONGODB_URI` está correta no `.env`
3. Você está dentro da pasta `backend` ao executar o comando

## 📚 Próximos Passos

### 1. Integrar com Frontend

Atualize o arquivo `src/services/api.js` para usar a API real em vez de dados mock.

### 2. Implementar Autenticação JWT

O backend já tem as rotas preparadas, basta implementar a geração e verificação de tokens.

### 3. Adicionar Validações

Implemente validações mais robustas usando `express-validator`.

### 4. Criar Mais Endpoints

Adicione endpoints para:

- Relatórios
- Upload de fotos
- Histórico completo
- Filtragem avançada

## 🎯 Recursos Adicionais

- [MongoDB University](https://university.mongodb.com/) - Cursos gratuitos
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

---

✅ **Seu banco de dados está pronto para uso!**

Execute `npm run seed` na pasta backend para começar! 🚀
