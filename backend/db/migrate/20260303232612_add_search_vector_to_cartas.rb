class AddSearchVectorToCartas < ActiveRecord::Migration[8.0]
  def up
    # Adiciona a coluna tsvector gerada automaticamente
    # Pesos: A (Nomes), B (Tipos), C (Texto de Regras)
    execute <<-SQL
      ALTER TABLE cartas ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(printed_name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(type_line, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(printed_type_line, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(oracle_text, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(printed_text, '')), 'C')
      ) STORED;
    SQL

    # Cria o índice GIN para performance
    add_index :cartas, :search_vector, using: :gin
  end

  def down
    remove_index :cartas, :search_vector
    remove_column :cartas, :search_vector
  end
end
