# 🧪 Testes E2E (End-to-End)

## 📖 O que são Testes E2E?

Testes **End-to-End** (ponta a ponta) testam a aplicação completa, simulando **requisições HTTP reais** como um usuário/cliente faria.

## 🆚 Diferença entre Testes Unitários e E2E

| Aspecto | Testes Unitários (`src/**/*.spec.ts`) | Testes E2E (`test/**/*.e2e-spec.ts`) |
|---------|----------------------------------------|---------------------------------------|
| **Escopo** | Componente isolado | Aplicação completa |
| **Dependências** | Mockadas | Reais (banco, services, etc) |
| **Velocidade** | Rápidos (milissegundos) | Lentos (segundos) |
| **HTTP** | Não faz requisições | Faz requisições HTTP reais |
| **Banco de Dados** | Mock | Banco de testes real |
| **Quando rodar** | A cada mudança | Antes de deploy |

## 📁 Estrutura dos Testes E2E

```
test/
├── auth.e2e-spec.ts     # Testes de autenticação (registro, login, perfil)
├── post.e2e-spec.ts     # Testes de posts (CRUD, busca, permissões)
├── app.e2e-spec.ts      # Teste básico do app
└── jest-e2e.json        # Configuração do Jest para E2E
```

## 🧪 Testes Implementados

### 🔐 Auth (auth.e2e-spec.ts)

#### Registro (`/auth/register`)
- ✅ Registrar aluno
- ✅ Registrar professor
- ✅ Falhar com email duplicado
- ✅ Validar email inválido
- ✅ Validar senha curta

#### Login (`/auth/login`)
- ✅ Login com credenciais válidas
- ✅ Falhar com senha errada
- ✅ Falhar com usuário inexistente

#### Perfil (`/auth/profile`)
- ✅ Obter perfil com token válido
- ✅ Falhar sem token
- ✅ Falhar com token inválido

#### Atualizar Perfil (`/auth/profile PATCH`)
- ✅ Atualizar nome
- ✅ Atualizar email

#### Alterar Senha (`/auth/change-password`)
- ✅ Alterar senha com sucesso
- ✅ Falhar com senha atual errada

### 📝 Posts (post.e2e-spec.ts)

#### Criar Post (`/posts POST`)
- ✅ Professor pode criar
- ✅ Admin pode criar
- ✅ Aluno não pode criar (403)
- ✅ Falhar sem autenticação (401)
- ✅ Validar dados obrigatórios

#### Listar Posts (`/posts GET`)
- ✅ Listar posts publicados (público)
- ✅ Suportar paginação
- ✅ Não mostrar rascunhos

#### Listar Todos (`/posts/all GET`)
- ✅ Professor vê todos (incluindo rascunhos)
- ✅ Aluno não tem acesso (403)

#### Buscar Posts (`/posts/search GET`)
- ✅ Buscar por título
- ✅ Buscar por conteúdo
- ✅ Buscar por tags

#### Ver Post (`/posts/:id GET`)
- ✅ Ver post por ID
- ✅ Retornar 404 se não existe

#### Atualizar Post (`/posts/:id PATCH`)
- ✅ Professor pode atualizar
- ✅ Aluno não pode (403)

#### Deletar Post (`/posts/:id DELETE`)
- ✅ Professor pode deletar
- ✅ Aluno não pode (403)

## 🚀 Como Rodar os Testes

### Testes Unitários (em `src/`)
```bash
npm test
# ou
npm run test:watch    # modo watch
npm run test:cov      # com cobertura
```

### Testes E2E (em `test/`)
```bash
npm run test:e2e
```

## ⚙️ Configuração

Os testes E2E usam:
- **Supertest**: Para fazer requisições HTTP
- **NestJS Testing**: Para criar instância da aplicação
- **MongoDB**: Banco de dados de testes (usa o mesmo do .env)
- **Jest**: Framework de testes

### ⚠️ Importante

1. **Banco de Testes**: Configure uma database separada para testes no `.env`:
   ```
   MONGO_URI_TEST=mongodb://localhost:27017/escola_conecta_saber_test
   ```

2. **Limpeza**: Os testes limpam os dados antes/depois de rodar

3. **Ordem**: Testes E2E devem ser rodados em ordem (algumas suites dependem de dados criados)

## 📊 Cobertura de Testes

### Testes Unitários (`src/`)
- Controllers (auth, post)
- Services (auth, post)
- Guards (jwt, roles)
- Strategies (jwt)

### Testes E2E (`test/`)
- Fluxos completos de autenticação
- Fluxos completos de CRUD de posts
- Autorização e permissões
- Validações de entrada
- Tratamento de erros

## 🎯 Quando Rodar Cada Tipo

### Durante Desenvolvimento
```bash
npm run test:watch  # Testes unitários em modo watch
```

### Antes de Commit
```bash
npm test           # Todos os testes unitários
```

### Antes de Deploy/PR
```bash
npm test           # Testes unitários
npm run test:e2e   # Testes E2E
npm run test:cov   # Cobertura completa
```

## 🔍 Debugging

Para debugar um teste específico:

```bash
# Testes unitários
npm test -- auth.service.spec.ts

# Testes E2E
npm run test:e2e -- auth.e2e-spec.ts
```
---

**Desenvolvido para o Tech Challenge - Fase 2 - FIAP**

