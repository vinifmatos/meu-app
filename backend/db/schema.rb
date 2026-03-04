# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_03_04_024147) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "cartas", force: :cascade do |t|
    t.string "scryfall_id", null: false
    t.string "oracle_id"
    t.string "power"
    t.string "toughness"
    t.string "mana_cost"
    t.string "set"
    t.string "collector_number"
    t.string "lang", null: false
    t.jsonb "colors"
    t.jsonb "color_identity"
    t.jsonb "color_indicator"
    t.string "name"
    t.string "type_line"
    t.text "oracle_text"
    t.jsonb "image_uris"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "released_at"
    t.string "rarity"
    t.string "printed_name"
    t.string "printed_type_line"
    t.text "printed_text"
    t.virtual "search_vector", type: :tsvector, as: "(((((setweight(to_tsvector('simple'::regconfig, (COALESCE(name, ''::character varying))::text), 'A'::\"char\") || setweight(to_tsvector('simple'::regconfig, (COALESCE(printed_name, ''::character varying))::text), 'A'::\"char\")) || setweight(to_tsvector('simple'::regconfig, (COALESCE(type_line, ''::character varying))::text), 'B'::\"char\")) || setweight(to_tsvector('simple'::regconfig, (COALESCE(printed_type_line, ''::character varying))::text), 'B'::\"char\")) || setweight(to_tsvector('simple'::regconfig, COALESCE(oracle_text, ''::text)), 'C'::\"char\")) || setweight(to_tsvector('simple'::regconfig, COALESCE(printed_text, ''::text)), 'C'::\"char\"))", stored: true
    t.jsonb "legalities"
    t.index ["lang"], name: "index_cartas_on_lang"
    t.index ["oracle_id"], name: "index_cartas_on_oracle_id"
    t.index ["scryfall_id"], name: "index_cartas_on_scryfall_id", unique: true
    t.index ["search_vector"], name: "index_cartas_on_search_vector", using: :gin
  end

  create_table "deck_cartas", force: :cascade do |t|
    t.bigint "deck_id", null: false
    t.bigint "carta_id", null: false
    t.integer "quantidade"
    t.boolean "eh_comandante"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["carta_id"], name: "index_deck_cartas_on_carta_id"
    t.index ["deck_id"], name: "index_deck_cartas_on_deck_id"
  end

  create_table "decks", force: :cascade do |t|
    t.bigint "usuario_id", null: false
    t.string "nome"
    t.integer "formato"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["usuario_id"], name: "index_decks_on_usuario_id"
  end

  create_table "faces_cartas", force: :cascade do |t|
    t.bigint "carta_id", null: false
    t.integer "face", null: false
    t.string "power"
    t.string "toughness"
    t.string "type_line"
    t.string "mana_cost"
    t.jsonb "colors"
    t.string "name"
    t.text "oracle_text"
    t.jsonb "image_uris"
    t.string "illustration_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "printed_name"
    t.string "printed_type_line"
    t.text "printed_text"
    t.index ["carta_id", "face", "illustration_id"], name: "index_faces_cartas_on_carta_id_and_face_and_illustration_id", unique: true
    t.index ["carta_id"], name: "index_faces_cartas_on_carta_id"
    t.index ["face"], name: "index_faces_cartas_on_face"
  end

  create_table "simbolos", force: :cascade do |t|
    t.string "symbol", null: false
    t.string "english", null: false
    t.boolean "represents_mana", null: false
    t.integer "mana_value"
    t.boolean "appears_in_mana_costs", null: false
    t.jsonb "colors", null: false
    t.boolean "hybrid", null: false
    t.boolean "phyrexian", null: false
    t.string "svg_uri"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["symbol"], name: "index_simbolos_on_symbol", unique: true
  end

  create_table "usuarios", force: :cascade do |t|
    t.string "username", null: false
    t.string "nome"
    t.string "password_digest"
    t.integer "role", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role"], name: "index_usuarios_on_role"
    t.index ["username"], name: "index_usuarios_on_username", unique: true
  end

  add_foreign_key "deck_cartas", "cartas"
  add_foreign_key "deck_cartas", "decks"
  add_foreign_key "decks", "usuarios"
  add_foreign_key "faces_cartas", "cartas"
end
