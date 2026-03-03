namespace :scryfall do
  desc "Importa símbolos e cartas da API do Scryfall"
  task importar: :environment do
    puts "Iniciando importação do Scryfall..."
    inicio = Time.current

    begin
      Scryfall::Importador.importar!
      
      duracao = Time.current - inicio
      puts "Importação concluída com sucesso em #{duracao.round(2)} segundos."
    rescue StandardError => e
      puts "Erro durante a importação: #{e.message}"
      puts e.backtrace.first(5)
      exit 1
    end
  end

  desc "Limpa o cache de arquivos baixados do Scryfall"
  task limpar_cache: :environment do
    caminho = Rails.root.join("tmp", "scryfall")
    if Dir.exist?(caminho)
      FileUtils.rm_rf(caminho)
      puts "Cache do Scryfall limpo em #{caminho}."
    else
      puts "Nenhum cache encontrado."
    end
  end
end
