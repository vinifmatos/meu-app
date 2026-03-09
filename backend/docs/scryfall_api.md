# Documentação da Integração com Scryfall API

Este documento descreve como o projeto consome a API do Scryfall para importar dados de cartas de *Magic: The Gathering*.

## 1. Visão Geral

O sistema utiliza o endpoint de **Bulk Data** para baixar periodicamente todas as cartas da base de dados do Scryfall em um arquivo JSON compactado (`all-cards-*.json.bz2`).

- **URL Base:** `https://api.scryfall.com`
- **Bulk Data Endpoint:** `/bulk-data/all_cards`
- **Polidez da API:** De acordo com as diretrizes do Scryfall, as requisições devem incluir um `User-Agent` identificável e um intervalo de 50-100ms entre as chamadas de API (rate limit).

## 2. Estrutura de Dados (Card Object)

Os campos abaixo são os mais relevantes para o nosso modelo `Carta` e `FaceCarta`.

### Campos Principais (Core)
- **`id` (UUID):** Identificador único e estável da impressão no Scryfall.
- **`oracle_id` (UUID):** Identificador único para a identidade "Oracle" da carta. Permanece o mesmo em todos os reprints.
- **`name` (String):** Nome completo da carta. Para cartas de múltiplas faces, inclui ambos os nomes separados por ` // `.
- **`layout` (String):** Código que descreve o layout físico da carta (ex: `normal`, `split`, `transform`, `modal_dfc`).

### Campos de Gameplay
- **`mana_cost` (String):** Custo de mana (ex: `{3}{R}{W}`).
- **`cmc` (Decimal):** Valor de mana convertido (Mana Value).
- **`type_line` (String):** Linha de tipo completa (ex: `Legendary Creature — Human Wizard`).
- **`oracle_text` (String):** Texto oficial e atualizado das regras.
- **`power` / `toughness` (String):** Atributos de criaturas (podem conter valores não numéricos como `*`).
- **`colors` (Array):** Cores da carta (ex: `["W", "U"]`).

### Campos de Impressão (Print)
- **`set` (String):** Código da edição (ex: `m21`).
- **`collector_number` (String):** Número da carta na edição.
- **`rarity` (String):** Raridade (ex: `common`, `uncommon`, `rare`, `mythic`).
- **`image_uris` (Object):** Dicionário de URIs para imagens em diferentes tamanhos (`small`, `normal`, `large`, `png`, `art_crop`).

## 3. Cartas de Múltiplas Faces (Card Faces)

Cartas como *Transform*, *Modal DFC* ou *Split* utilizam o array `card_faces`.

- **`card_faces` (Array):** Se presente, cada elemento é um objeto `Card Face`.
- **Estrutura:** Cada face tem seu próprio `name`, `type_line`, `oracle_text`, `mana_cost` e, no caso de cartas de duas faces físicas, seus próprios `image_uris`.
- **Implementação Local:** No nosso sistema, essas faces são armazenadas no modelo `FaceCarta`, associadas a uma `Carta`.

## 4. Processo de Importação

A importação é realizada por serviços especializados (`Scryfall::Importadores`) e utiliza processamento em stream para lidar com arquivos de vários gigabytes.

1. **Localização:** O sistema busca o arquivo `.json.bz2` mais recente no diretório configurado em `SCRYFALL_DATA_DIR`.
2. **Streaming & Progress:**
   - Uma thread de leitura (`writer`) lê o arquivo compactado em chunks de 64KB e o envia para o comando `bzcat`.
   - O progresso é calculado com base nos bytes lidos do arquivo compactado, garantindo alta precisão.
   - Atualizações no banco de dados ocorrem a cada 8MB processados para otimizar a performance de I/O.
3. **Parsing:** O fluxo descompactado é processado pelo `Yajl::FFI::Parser` de forma incremental.
4. **Batching:** As cartas são inseridas no banco de dados em lotes (2000 em prod, 5000 em dev) via `upsert_all`.
5. **Cancelamento:** O sistema verifica o status de cancelamento a cada 50 chunks no parser e a cada 1MB no writer, permitindo a interrupção segura do processo.
6. **Símbolos:** Os símbolos de mana e outros ícones são importados de `simbolos.json.bz2`.

## 5. Observabilidade

O sistema gera logs detalhados do processo de importação (início, fim, progresso e erros) em um arquivo separado:
`log/scryfall_import.log`

---
*Baseado na documentação oficial de [Scryfall Cards API](https://scryfall.com/docs/api/cards).*
