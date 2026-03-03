# Documentação de Arquitetura do Frontend

Este documento detalha as diretrizes, tecnologias e padrões adotados no frontend (Angular) do projeto.

## 1. Tecnologias Principais

- **Angular 20+**: Utilização de standalone components, signals para gerenciamento de estado e `inject()` para injeção de dependência.
- **PrimeNG v20**: Biblioteca de componentes de interface.
- **Tailwind CSS v4**: Framework de utilitários CSS para layout e estilização.
- **PrimeUI (tailwindcss-primeui)**: Integração harmônica entre PrimeNG e Tailwind CSS.

## 2. Estrutura de Pastas

A estrutura segue uma divisão clara entre lógica global e funcionalidades específicas:

- **`src/app/core`**: Lógica central da aplicação, serviços globais, interceptores, guards e área administrativa.
  - **`interceptores`**: Manipulação global de requisições HTTP (ex: tratamento de erros).
  - **`interfaces`**: Definições globais de tipos e modelos de dados.
  - **`servicos`**: Serviços compartilhados (ex: `ApiService`, `ConfiguracaoService`).
  - **`paginas`**: Páginas de infraestrutura e administrativas (ex: `admin/usuarios`).
- **`src/app/features`**: Funcionalidades de domínio da aplicação (ex: `cartas`). Cada funcionalidade deve ter sua própria estrutura de componentes e serviços.
- **`src/styles`**: Arquivos SCSS globais e customizações de tema.

## 3. Convenções de Nomenclatura

### Arquivos e Pastas
- **Padrão Angular**: Devem seguir o formato `nome.tipo.ts` (ex: `usuario.service.ts`, `listagem.component.ts`).
- **Pastas**: Devem ser nomeadas em minúsculo, utilizando hífen como separador (kebab-case).

### Nomenclatura em Português (BR)
- Nomes de componentes, serviços, guardas e outros recursos devem ser preferencialmente em **Português do Brasil**.
  - *Exemplo*: `UsuariosComponent` em vez de `UsersComponent`.
  - *Exemplo*: `obterCartas()` em vez de `getCards()`.

## 4. Padrões de Código

### Injeção de Dependência
- Utilize a função `inject()` no lugar de injeção via construtor:
  ```typescript
  private readonly servico = inject(UsuariosService);
  ```

### Gerenciamento de Estado
- Utilize **Signals** para estado local de componentes e derivação de dados (`computed`).
- Utilize **ChangeDetectionStrategy.OnPush** em todos os componentes para melhor performance.

### Importações (Path Aliases)
- **Sempre** utilize aliases de caminho configurados no `tsconfig.json` para evitar importações relativas complexas:
  - `@core/*` para recursos dentro de `src/app/core`.
  - `@features/*` para recursos dentro de `src/app/features`.

## 5. Padrão de Comunicação com API

Todas as requisições devem passar pelo `ApiService` ou serviços específicos de funcionalidade que seguem o contrato definido no backend:

- **Envio de Dados**: Dados de recursos devem ser encapsulados em uma chave `data`.
  ```typescript
  this.api.post('usuarios', { data: { usuario: { ... } } });
  ```
- **Filtros e Paginação**: Devem ser passados via query params (`page`, `perPage`, `filters`).
- **Respostas**: Padronizadas através da interface `ApiResposta<T>`.

---
*Este documento deve ser atualizado sempre que houver mudanças significativas na arquitetura ou padrões do frontend.*
