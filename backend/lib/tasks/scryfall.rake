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

  desc "Importa uma coleção de cartas icônicas para testes e desenvolvimento (gera versões PT fakes)"
  task importar_famosas: :environment do
    cartas_famosas = [
      "Plains", "Island", "Swamp", "Mountain", "Forest",
      "Black Lotus", "Ancestral Recall", "Time Walk", "Mox Pearl", "Mox Sapphire", 
      "Mox Jet", "Mox Ruby", "Mox Emerald", "Counterspell", "Lightning Bolt", 
      "Dark Ritual", "Giant Growth", "Sol Ring", "Command Tower", "Arcane Signet",
      "Atog", "Delver of Secrets", "Brainstorm", "Ponder", "Faithless Looting",
      "Gush", "Daze", "Gitaxian Probe", "Mental Misstep", "Treasure Cruise",
      "Dig Through Time", "Okitra's Monument", "Bonder's Ornament", "Arcum's Astrolabe"
    ]

    importador = Scryfall::Importador.new

    puts "Importando #{cartas_famosas.size} cartas icônicas em EN..."

    cartas_famosas.each do |nome|
      begin
        print "Importando '#{nome}' (en)... "
        importador.importar_carta_por_nome(nome, lang: "en")
        puts "OK"

        # Cria a cópia em PT para testes
        carta_en = Carta.find_by(name: nome, lang: "en")
        if carta_en && !Carta.exists?(oracle_id: carta_en.oracle_id, lang: "pt")
          print "  -> Gerando versão PT fake... "
          carta_pt = carta_en.dup
          carta_pt.lang = "pt"
          carta_pt.scryfall_id = "#{carta_en.scryfall_id}-pt"
          # Simula um nome traduzido básico
          carta_pt.printed_name = "[PT] #{carta_en.name}"
          carta_pt.save!
          puts "OK"
        end

        # Delay amigável para a API do Scryfall
        sleep 0.1
      rescue StandardError => e
        puts "AVISO: #{e.message}"
      end
    end

    puts "Importação de cartas famosas e geração de versões PT concluída."
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

  desc "Importação dos simbolos"
  task importar_simbolos: :environment do
    puts "Iniciando importação dos símbolos..."
    inicio = Time.current

    begin
      Scryfall::Importador.importar_simbolos

      duracao = Time.current - inicio
      puts "Importação dos símbolos concluída com sucesso em #{duracao.round(2)} segundos."
    rescue StandardError => e
      puts "Erro durante a importação dos símbolos: #{e.message}"
      puts e.backtrace.first(5)
      exit 1
    end
  end
end
