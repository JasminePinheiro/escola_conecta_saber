# 🎓 Escola Conecta Saber - API de Blogging Educacional

API REST completa para plataforma de blogging educacional, construída com NestJS, MongoDB e TypeScript.

## 📋 Sobre o Projeto

Sistema de gerenciamento de conteúdo educacional com autenticação JWT, controle de permissões e gestão de posts. Desenvolvido como Tech Challenge da FIAP - Fase 2.

### Funcionalidades Principais

- 🔐 **Autenticação JWT** com refresh tokens
- 👥 **Sistema de Roles**: Admin, Professor e Aluno
- 📝 **Gestão de Posts**: Criar, editar, deletar e buscar
- 🔍 **Busca Avançada**: Por título, conteúdo e tags
- 📊 **Paginação**: Todas as listagens suportam paginação
- 🛡️ **Validação**: Schemas Zod para validação robusta
- 🔒 **Segurança**: Senhas criptografadas com bcrypt

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ 
- MongoDB 6+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Configuração do `.env`

```env
MONGO_URI=mongodb://localhost:27017/escola_conecta_saber
JWT_SECRET=sua-chave-secreta-super-segura-aqui
PORT=3000
```

### Executar a Aplicação

```bash
# Modo desenvolvimento (recarrega automaticamente)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

A API estará disponível em: `http://localhost:3000`

---

## 👤 Criando o Primeiro Admin

**🔒 Por questões de segurança, admins NÃO podem ser criados pela rota pública `/auth/register`.**

### Método Recomendado: Script Seed

```bash
npm run seed:admin
```

Este comando cria um admin com as credenciais padrão:
- **Email**: `admin@escola.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

### Método Alternativo: Inserção Manual

```bash
mongosh
```

```javascript
use escola_conecta_saber

db.users.insertOne({
  email: "admin@escola.com",
  name: "Administrador",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIW.UhbQBe", // admin123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 🧪 Testando a API

### Sequência Recomendada de Testes

Para testar todas as funcionalidades da API, siga esta ordem:

1. **Criar usuário admin**
   ```bash
   npm run seed:admin
   ```
   Credenciais: `admin@escola.com` / `admin123`

2. **Fazer login e obter token**
   - Use a rota `POST /auth/login`
   - Copie o `accessToken` retornado

3. **Testar funcionalidades de admin**
   - Listar professores: `GET /auth/teachers`
   - Listar alunos: `GET /auth/students`
   - Criar posts: `POST /posts`

4. **Cadastrar professor e aluno**
   - `POST /auth/register` com role `teacher`
   - `POST /auth/register` com role `student`

5. **Testar como professor**
   - Login como professor
   - Criar posts (todos os status: draft, published, scheduled, private)
   - Listar todos os posts: `GET /posts/all`
   - Editar e deletar posts

6. **Testar como aluno/público**
   - Ver posts publicados: `GET /posts`
   - Buscar posts: `GET /posts/search?query=educação`
   - Tentar criar post (deve dar erro 403)

### Comportamentos Esperados

| Ação | Resultado Esperado | Status HTTP |
|------|-------------------|-------------|
| Criar admin via `/auth/register` | ❌ Erro de validação | 400 |
| Criar post sem autenticação | ❌ Não autorizado | 401 |
| Aluno criar post | ❌ Sem permissão | 403 |
| Aluno acessar `/posts/all` | ❌ Sem permissão | 403 |
| Professor acessar `/auth/teachers` | ❌ Sem permissão | 403 |
| Post com título vazio | ❌ Dados inválidos | 400 |

⏰ **Nota**: Tokens JWT expiram em 15 minutos. Faça login novamente se necessário.

---

## 📖 Exemplos de Uso

### Autenticação

```bash
# Registrar um professor
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@escola.com",
    "name": "Professor Silva",
    "password": "senha123",
    "role": "teacher"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@escola.com",
    "password": "senha123"
  }'
```

### Gerenciamento de Posts

```bash
# Criar post (requer autenticação de professor/admin)
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Introdução à Programação",
    "content": "Neste post vamos aprender os conceitos básicos de programação...",
    "tags": ["educação", "programação", "iniciantes"],
    "published": true,
    "status": "published"
  }'

# Criar post como rascunho
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Rascunho de Post",
    "content": "Este post ainda está sendo escrito",
    "status": "draft",
    "published": false
  }'

# Editar post
curl -X PATCH http://localhost:3000/posts/ID_DO_POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Título Atualizado"
  }'

# Buscar posts (público)
curl "http://localhost:3000/posts/search?query=programação"

# Listar posts com paginação
curl "http://localhost:3000/posts?page=1&limit=10"
```

💡 **Dica**: Substitua `SEU_TOKEN_AQUI` pelo token retornado no login e `ID_DO_POST` pelo ID real do post.

---

## 📚 Documentação da API

### Rotas de Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Cadastrar usuário (student/teacher) | ❌ |
| POST | `/auth/login` | Login | ❌ |
| GET | `/auth/profile` | Ver perfil | ✅ |
| PATCH | `/auth/profile` | Atualizar perfil | ✅ |
| PATCH | `/auth/change-password` | Alterar senha | ✅ |
| GET | `/auth/teachers` | Listar professores | ✅ Admin |
| GET | `/auth/students` | Listar alunos | ✅ Admin |

### Rotas de Posts

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/posts` | Listar posts públicos | ❌ |
| GET | `/posts/:id` | Buscar post por ID | ❌ |
| GET | `/posts/search` | Buscar posts | ❌ |
| GET | `/posts/all` | Listar todos os posts | ✅ Professor |
| POST | `/posts` | Criar post | ✅ Professor |
| PATCH | `/posts/:id` | Editar post | ✅ Professor |
| DELETE | `/posts/:id` | Deletar post | ✅ Professor |

## 🏗️ Arquitetura

```
src/
├── common/                          # Recursos compartilhados entre módulos
│   ├── decorators/                  # Decorators customizados
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── index.ts
│   ├── guards/                      # Guards de autenticação e autorização
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── index.ts
│   ├── strategies/                  # Estratégias de autenticação (Passport)
│   │   ├── jwt.strategy.ts
│   │   └── index.ts
│   ├── middlewares/                 # Middlewares HTTP
│   │   ├── logger.middleware.ts
│   │   ├── logger.middleware.spec.ts
│   │   └── index.ts
│   ├── interceptors/                # Interceptors para transformação de dados
│   │   ├── logging.interceptor.ts
│   │   ├── logging.interceptor.spec.ts
│   │   ├── transform.interceptor.ts
│   │   ├── transform.interceptor.spec.ts
│   │   └── index.ts
│   │
├── modules/                         # Módulos de funcionalidade
│   ├── auth/                        # Módulo de Autenticação
│   │   ├── controllers/             # Controladores (rotas HTTP)
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.controller.spec.ts
│   │   ├── services/                # Lógica de negócio
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.spec.ts
│   │   ├── repositories/            # Camada de acesso a dados
│   │   │   ├── user.repository.interface.ts
│   │   │   └── user.repository.ts
│   │   ├── models/                  # Schemas e modelos do MongoDB
│   │   │   └── user.model.ts
│   │   ├── dto/                     # Data Transfer Objects
│   │   │   ├── auth.dto.ts
│   │   │   └── index.ts
│   │   ├── schemas/                 # Schemas de validação (Zod)
│   │   │   └── user.schema.ts
│   │   └── auth.module.ts           # Módulo NestJS
│   │
│   └── post/                        # Módulo de Posts
│       ├── controllers/
│       │   ├── post.controller.ts
│       │   └── post.controller.spec.ts
│       ├── services/
│       │   ├── post.service.ts
│       │   └── post.service.spec.ts
│       ├── repositories/
│       │   ├── post.repository.interface.ts
│       │   └── post.repository.ts
│       ├── models/
│       │   └── post.model.ts
│       ├── dto/
│       │   ├── post.dto.ts
│       │   └── index.ts
|       ├── schemas/                
│       │   └── post.schema.ts
│       └── post.module.ts
│
├── config/                          # Configurações e seeds
│   └── seed-admin.ts
│
├── app.module.ts                    # Módulo raiz da aplicação
├── app.controller.ts                # Controller raiz
├── app.service.ts                   # Service raiz
└── main.ts                          # Ponto de entrada da aplicação
```

### Tecnologias Utilizadas

- **Framework**: NestJS 11
- **Banco de Dados**: MongoDB com Mongoose
- **Autenticação**: JWT com Passport
- **Validação**: Zod + Class Validator
- **Criptografia**: bcryptjs
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest + Supertest
- **Linguagem**: TypeScript

### Padrões Arquiteturais

- **Modular**: Separação clara entre módulos (Auth, Post)
- **Repository Pattern**: Camada de abstração de dados
- **DTO Pattern**: Validação e transformação de dados de entrada/saída
- **Dependency Injection**: Injeção de dependências nativa do NestJS
- **Guards**: Proteção de rotas e autorização
- **Middlewares**: Logging de requisições HTTP
- **Interceptors**: Logging de execução e transformação de respostas

### Fluxo de Requisição

```
Cliente → Middleware (Logger) → Guard (Auth/Roles) → Interceptor (Before) → Controller → Service → Repository → MongoDB
                                                                                                                    ↓
Cliente ← Interceptor (After) ← Controller ← Service ← Repository ← MongoDB
```

**Componentes do Fluxo:**

1. **Middleware (LoggerMiddleware)**: Registra entrada/saída de requisições HTTP
2. **Guards (JwtAuthGuard, RolesGuard)**: Valida autenticação e permissões
3. **Interceptor (LoggingInterceptor)**: Monitora execução e calcula tempo de resposta
4. **Controller**: Recebe requisição e delega para o Service
5. **Service**: Contém lógica de negócio
6. **Repository**: Abstração de acesso aos dados
7. **MongoDB**: Persistência de dados
---

## 🔐 Sistema de Permissões

| Funcionalidade | Admin | Professor | Aluno | Público |
|----------------|-------|-----------|-------|---------|
| Ver posts publicados | ✅ | ✅ | ✅ | ✅ |
| Buscar posts | ✅ | ✅ | ✅ | ✅ |
| Ver todos os posts | ✅ | ✅ | ❌ | ❌ |
| Criar posts | ✅ | ✅ | ❌ | ❌ |
| Editar posts | ✅ | ✅ | ❌ | ❌ |
| Deletar posts | ✅ | ✅ | ❌ | ❌ |
| Listar professores | ✅ | ❌ | ❌ | ❌ |
| Listar alunos | ✅ | ❌ | ❌ | ❌ |
| Cadastrar usuários | ❌ | ✅* | ✅* | ✅* |

\* Pode cadastrar apenas `student` ou `teacher`, não `admin`  
**👑 Admin tem permissões totais no sistema**

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev        # Inicia em modo watch

# Produção
npm run build            # Compila o projeto
npm run start:prod       # Inicia em produção

# Utilidades
npm run seed:admin       # Cria o primeiro admin
npm run lint             # Executa linter
npm run format           # Formata código

# Testes
npm run test             # Testes unitários
npm run test:e2e         # Testes end-to-end
npm run test:cov         # Cobertura de testes
```

---

## 🛡️ Segurança

### Boas Práticas Implementadas

✅ **Senhas criptografadas** com bcrypt (salt rounds: 12)  
✅ **JWT com expiração** (15min para access token, 7 dias para refresh token)  
✅ **Admin não pode ser criado por rota pública**  
✅ **Validação robusta** com Zod schemas  
✅ **Guards de proteção** para rotas sensíveis  
✅ **CORS configurado** para ambientes específicos

## 📝 Licença

Este projeto é licenciado sob a licença MIT.

---

## 👨‍💻 Autor

**Jasmine Pinheiro de Souza**  
---

## 📞 Suporte

Para dúvidas ou problemas:

1. 📚 Acesse a [Documentação Swagger](https://escola-conecta-saber-latest.onrender.com/api)
---

**🎉 Projeto desenvolvido com NestJS e MongoDB!**
