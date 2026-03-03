# Documentação da Integração com Scryfall API

Este documento descreve como o projeto consome a API do Scryfall para importar dados de cartas de *Magic: The Gathering*.

## 1. Visão Geral

O sistema utiliza o endpoint de **Bulk Data** para baixar periodicamente todas as cartas da base de dados do Scryfall em um único arquivo JSON (`all_cards.json`).

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

A importação é realizada pela classe `Scryfall::Importer` e utiliza um parser incremental (`CardsJsonParser`) para lidar com o arquivo JSON de vários gigabytes sem estourar a memória RAM.

1. **Download:** O arquivo é baixado em `tmp/scryfall/all_cards.json`.
2. **Parsing:** O `Yajl::FFI::Parser` processa o arquivo em chunks.
3. **Batching:** As cartas são processadas em lotes de 500 para otimizar a inserção no banco de dados via `upsert_all`.
4. **Símbolos:** Os símbolos de mana e outros ícones são importados via endpoint `/symbology`.

---
*Baseado na documentação oficial de [Scryfall Cards API](https://scryfall.com/docs/api/cards).*
