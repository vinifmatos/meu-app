# Documentação dos Endpoints da API (V1)

Esta API segue o padrão REST e retorna respostas JSON padronizadas via `JsonResponseHelper`.

## Formato de Resposta Padrão

```json
{
  "message": "Mensagem opcional",
  "validationErrors": { "campo": ["erro"] },
  "data": { ... }
}
```
*Nota: Todas as chaves do JSON são convertidas para `camelCase` pelo middleware.*

## Padrão de Requisições (Request Standard)

Todas as requisições enviadas pelo frontend devem seguir a estrutura abaixo para garantir consistência no processamento pelo backend.

### 1. Consultas e Listagens (GET)

Os metadados de controle e filtros devem ser passados via Query String:

- **Paginação:**
  - `page`: Inteiro representando a página desejada (ex: `?page=2`).
  - `perPage`: Inteiro representando a quantidade de itens por página (ex: `?perPage=50`).
- **Ordenação:**
  - `sort`: Nome do campo. Use o prefixo `-` para ordem descendente (ex: `?sort=-name`).
- **Filtros:**
  - Devem ser agrupados sob a chave `filters` (ex: `?filters[name]=Lightning&filters[set]=m21`).

### 2. Criação e Atualização (POST, PATCH, PUT)

O corpo da requisição deve encapsular o recurso dentro de uma chave `data`:

```json
{
  "data": {
    "usuario": {
      "nome": "João Silva",
      "email": "joao@example.com"
    }
  }
}
```

---

## 1. Configuração (`/api/v1/config`)
Retorna as configurações básicas da aplicação.

- **Método:** `GET`
- **Autenticação:** Não requer.

---

## 2. Registro de Usuários (`/api/v1/registro_usuarios`)
Endpoints para criação e ativação de novas contas.

### Criar Conta
Cria um novo usuário e envia e-mail de confirmação.

- **Método:** `POST`
- **Autenticação:** Não requer.
- **Parâmetros `data[usuario]`:**
  - `username` (Obrigatório)
  - `nome` (Obrigatório)
  - `email` (Obrigatório)
  - `password` (Obrigatório)
  - `password_confirmation` (Obrigatório)

### Confirmar Conta
Ativa a conta do usuário através do token enviado por e-mail.

- **Método:** `GET`
- **URL:** `/api/v1/registro_usuarios/confirmar?token=...`
- **Autenticação:** Não requer.

---

## 3. Perfil do Usuário (`/api/v1/perfil`)
Gerenciamento do perfil do usuário autenticado.

### Visualizar Perfil
Retorna as informações do usuário logado.

- **Método:** `GET`
- **Autenticação:** Requer token JWT.

### Atualizar Perfil
Permite alterar nome, e-mail ou senha.

- **Método:** `PATCH`
- **Autenticação:** Requer token JWT.
- **Parâmetros `data[usuario]`:**
  - `nome` (Opcional)
  - `email` (Opcional - Exige nova confirmação)
  - `current_password` (Obrigatório se estiver alterando a senha)
  - `password` (Opcional)
  - `password_confirmation` (Opcional)

---

## 4. Usuários (`/api/v1/usuarios`)
Gerenciamento de usuários do sistema.

### Listar Usuários
- **Método:** `GET`
- **Parâmetros:** `page`, `per_page`

### Criar Usuário
- **Método:** `POST`
- **Parâmetros:** `usuario[nome]`, `usuario[email]`, `usuario[senha]`

---

## 3. Cartas (`/api/v1/cartas`)
Consulta de cartas de Magic: The Gathering.

### Listar Cartas
Retorna uma lista paginada de cartas.

- **Método:** `GET`
- **Parâmetros:**
  - `page` (Inteiro): Número da página (padrão: 1).
  - `perPage` (Inteiro): Itens por página (padrão: 20).
- **Resposta `data`:**
  ```json
  {
    "cartas": [
      {
        "id": 1,
        "name": "Lightning Bolt",
        "manaCost": "{R}",
        "typeLine": "Instant",
        ...
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalCount": 1000
    }
  }
  ```

### Detalhes da Carta
Retorna os detalhes completos de uma carta específica, incluindo suas faces.

- **Método:** `GET`
- **URL:** `/api/v1/cartas/:id`
- **Resposta `data`:**
  ```json
  {
    "carta": {
      "id": 1,
      "name": "Delver of Secrets",
      "faces": [
        { "name": "Delver of Secrets", "face": "front", ... },
        { "name": "Insectile Aberration", "face": "back", ... }
      ],
      ...
    }
  }
  ```

---

## 4. Símbolos (`/api/v1/simbolos`)
Recupera a lista de símbolos de mana e outros ícones do jogo (Scryfall).

- **Método:** `GET`
- **Autenticação:** Não requer.
- **Resposta `data`:**
  ```json
  {
    "simbolos": [
      {
        "symbol": "{W}",
        "svgUri": "https://...",
        "english": "white mana",
        ...
      }
    ]
  }
  ```

---

## Erros Comuns

- **404 Not Found:** Retornado quando um recurso não existe.
  ```json
  { "message": "Registro não encontrado", "data": null }
  ```
- **422 Unprocessable Entity:** Retornado em falhas de validação.
  ```json
  { "message": "Mensagem de erro", "validationErrors": { ... }, "data": null }
  ```
- **429 Too Many Requests:** Retornado quando o limite de requisições (Rate Limit) é atingido (ex: proteção contra brute-force).
  ```json
  { "message": "Muitas tentativas. Tente novamente mais tarde." }
  ```
