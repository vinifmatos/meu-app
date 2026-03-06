class ArelQueryLoader
  class Error < StandardError; end
  class NotFoundError < Error; end

  def self.load(query_name, params = {})
    new(query_name, params).to_sql
  end

  def self.arel(query_name, params = {})
    new(query_name, params).to_arel
  end

  def initialize(query_name, params = {})
    @query_name = query_name
    @params = params.with_indifferent_access
  end

  def to_sql
    to_arel.to_sql
  end

  def to_arel
    context = Context.new(@params)

    begin
      content = File.read(query_path)
      result = context.instance_eval(content, query_path.to_s)

      unless result.respond_to?(:to_sql)
        raise Error, "A query '#{@query_name}' não retornou um objeto Arel (SelectManager/Nodes)."
      end

      result
    rescue Errno::ENOENT
      raise NotFoundError, "Arquivo de query não encontrado: #{query_path}"
    rescue StandardError => e
      raise Error, "Erro ao processar query '#{@query_name}': #{e.message}"
    end
  end

  private

  def query_path
    Rails.root.join("app", "sql_queries", "#{@query_name}.sql.rb")
  end

  # Extensão para o SelectManager para adicionar métodos de conveniência
  module SelectManagerExtensions
    def left_join(table)
      outer_join(table)
    end

    def lateral_join(node, on = nil)
      join_node = Arel::Nodes::Lateral.new(node)
      on_node = on || Arel::Nodes::True.new
      join(join_node).on(on_node)
    end
  end

  # Contexto de execução para o arquivo .sql.rb
  class Context
    attr_reader :params

    def initialize(params)
      @params = params
    end

    # Atalho para definir tabelas
    def t(name)
      Arel::Table.new(name)
    end

    # Atalho para definir múltiplas tabelas
    def tables(*args)
      args.each do |arg|
        if arg.is_a?(Hash)
          arg.each do |alias_name, table_name|
            instance_variable_set("@#{alias_name}", Arel::Table.new(table_name))
          end
        else
          instance_variable_set("@#{arg}", Arel::Table.new(arg))
        end
      end
    end

    # Atalho para o módulo Arel
    def arel
      Arel
    end

    # Inicia uma query a partir de uma tabela ou subquery
    def from(source)
      case source
      when Symbol, String
        source = t(source)
      when Arel::SelectManager
        # Subqueries no FROM precisam de um alias
        source = source.as("subquery")
      end

      manager = Arel::SelectManager.new(source)
      manager.extend(SelectManagerExtensions)
      manager
    end

    # Atalho para CASE WHEN
    def kase(expression = nil)
      Arel::Nodes::Case.new(expression)
    end

    # Atalho para LATERAL
    def lateral(node)
      Arel::Nodes::Lateral.new(node)
    end

    # Atalho para UNION de múltiplas queries
    def union(*queries)
      queries.flatten.inject(:union)
    end

    # Atalho para valores literais escapados (strings com aspas simples no SQL)
    def s(value)
      Arel::Nodes.build_quoted(value)
    end

    # Atalho para SQL puro (SqlLiteral)
    def sql(raw)
      Arel.sql(raw.to_s)
    end
  end
end
