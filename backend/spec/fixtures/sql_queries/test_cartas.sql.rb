# backend/spec/fixtures/sql_queries/test_cartas.sql.rb
tables :cartas
@cartas.project(@cartas[:name])
       .where(@cartas[:rarity].eq(params[:rarity]))
