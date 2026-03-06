require 'rails_helper'

RSpec.describe ArelQueryLoader do
  # Redireciona a busca de queries para a pasta de fixtures durante os testes
  before do
    allow_any_instance_of(ArelQueryLoader).to receive(:query_path) do |instance|
      Rails.root.join("spec", "fixtures", "sql_queries", "#{instance.instance_variable_get(:@query_name)}.sql.rb")
    end
  end

  describe ".load" do
    let(:params) { { rarity: 'rare' } }
    let(:query_name) { 'test_cartas' }

    it "gera o SQL correto a partir do arquivo .sql.rb na pasta de fixtures" do
      sql = ArelQueryLoader.load(query_name, params)

      expect(sql).to include('SELECT "cartas"."name" FROM "cartas"')
      expect(sql).to include('WHERE "cartas"."rarity" = \'rare\'')
    end

    it "levanta erro quando o arquivo não existe" do
      expect {
        ArelQueryLoader.load('query_fantasma')
      }.to raise_error(ArelQueryLoader::NotFoundError)
    end

    it "levanta erro quando o arquivo não retorna um objeto Arel" do
      expect {
        ArelQueryLoader.load('test_invalid')
      }.to raise_error(ArelQueryLoader::Error, /não retornou um objeto Arel/)
    end
  end

  describe "ApplicationRecord helpers" do
    before do
      create(:carta, name: 'Black Lotus', rarity: 'rare', scryfall_id: 'bl-1')
    end

    it "responde a arel_query" do
      expect(Carta.arel_query('test_cartas', { rarity: 'rare' })).to be_a(Arel::SelectManager)
    end

    it "responde a load_sql" do
      expect(Carta.load_sql('test_cartas', { rarity: 'rare' })).to include('SELECT "cartas"."name"')
    end

    it "retorna instâncias do modelo com arel_find_by_sql" do
      results = Carta.arel_find_by_sql('test_cartas', { rarity: 'rare' })
      expect(results.first).to be_a(Carta)
      expect(results.first.name).to eq('Black Lotus')
    end

    it "retorna dados brutos com exec_arel_query" do
      results = Carta.exec_arel_query('test_cartas', { rarity: 'rare' })
      expect(results).to be_a(ActiveRecord::Result)
      expect(results.to_a.first['name']).to eq('Black Lotus')
    end
  end

  describe "context shortcuts" do
    let(:context) { ArelQueryLoader::Context.new({}.with_indifferent_access) }

    it "fornece from() para iniciar uma query" do
      query = context.from(:cartas)
      expect(query).to be_a(Arel::SelectManager)
      expect(query.to_sql).to include('FROM "cartas"')
    end

    it "fornece from() com suporte a subqueries e alias padrão" do
      subquery = context.from(:cartas).project(Arel.star)
      query = context.from(subquery).project(Arel.star)
      expect(query.to_sql).to include('FROM (SELECT * FROM "cartas") subquery')
    end

    it "fornece from() respeitando alias manual em subqueries" do
      subquery = context.from(:cartas).project(Arel.star)
      query = context.from(subquery.as('x')).project(Arel.star)
      expect(query.to_sql).to include('FROM (SELECT * FROM "cartas") x')
    end

    it "fornece left_join() no SelectManager" do
      query = context.from(:cartas)
      query.left_join(context.t(:usuarios)).on(context.t(:cartas)[:usuario_id].eq(context.t(:usuarios)[:id]))
      expect(query.to_sql).to include('LEFT OUTER JOIN "usuarios"')
    end

    it "fornece lateral_join() no SelectManager" do
      subquery = context.from(:outra).project(Arel.star)
      query = context.from(:cartas)
      query.lateral_join(subquery)
      expect(query.to_sql).to include('INNER JOIN LATERAL')
    end

    it "fornece kase()" do
      stmt = context.kase
      expect(stmt).to be_a(Arel::Nodes::Case)
    end

    it "fornece union() de múltiplas queries via fixture complexa" do
      sql = ArelQueryLoader.load('test_shortcuts')
      expect(sql).to include('UNION')
      expect(sql).to include('CASE "usuarios"."role" WHEN \'admin\' THEN 1 ELSE 0 END AS is_admin')
    end
  end

  describe "context helper methods" do
    let(:context) { ArelQueryLoader::Context.new({ foo: 'bar' }.with_indifferent_access) }

    it "fornece t() para Arel::Table" do
      expect(context.t(:usuarios)).to be_a(Arel::Table)
      expect(context.t(:usuarios).name).to eq('usuarios')
    end

    it "fornece s() para valores escapados (aspas simples)" do
      quoted = context.s("sol")
      expect(quoted).to be_a(Arel::Nodes::Quoted)
      # No PostgreSQL o Arel gera 'sol'
      expect(Arel::SelectManager.new(Arel::Table.new(:t)).project(quoted).to_sql).to include("'sol'")
    end

    it "fornece sql() para SQL puro (SqlLiteral)" do
      literal = context.sql("COUNT(*)")
      expect(literal).to be_a(Arel::Nodes::SqlLiteral)
      expect(literal.to_s).to eq("COUNT(*)")
    end
  end
end
