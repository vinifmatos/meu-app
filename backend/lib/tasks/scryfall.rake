namespace :scryfall do
  desc "Importa símbolos e cartas dos arquivos locais do Scryfall"
  task importar: :environment do
    puts "Iniciando importação do Scryfall..."
    inicio = Time.current

    begin
      Scryfall.importar_simbolos
      Scryfall.importar_cartas

      duracao = Time.current - inicio
      puts "Importação concluída com sucesso em #{duracao.round(2)} segundos."
    rescue StandardError => e
      puts "Erro durante a importação: #{e.message}"
      puts e.backtrace.first(5)
      exit 1
    end
  end

  namespace :test do
    desc "Importa simbolos e cartas para teste"
    task importar: :environment do
      Rake::Task["scryfall:test:importar_simbolos"].invoke
      Rake::Task["scryfall:test:importar_cartas"].invoke
    end


    desc "Importa uma coleção de cartas a partir de fixture local"
    task importar_cartas: :environment do
      fixture_path = Rails.root.join("spec", "fixtures", "cartas.json")

      unless File.exist?(fixture_path)
        puts "AVISO: Fixture #{fixture_path} não encontrada."
        next
      end

      puts "Carregando cartas da fixture..."
      cartas_data = JSON.parse(File.read(fixture_path))

      # Sobrescrever URLs de imagem para usar assets locais nos testes
      placeholder_url = "card.png"

      cartas_data.each do |carta|
        if carta["image_uris"]
          carta["image_uris"] = {
            "small" => placeholder_url,
            "normal" => placeholder_url,
            "large" => placeholder_url,
            "png" => placeholder_url,
            "art_crop" => placeholder_url,
            "border_crop" => placeholder_url
          }
        end

        if carta["card_faces"]
          carta["card_faces"].each do |face|
            if face["image_uris"]
              face["image_uris"] = {
                "small" => placeholder_url,
                "normal" => placeholder_url,
                "large" => placeholder_url,
                "png" => placeholder_url,
                "art_crop" => placeholder_url,
                "border_crop" => placeholder_url
              }
            end
          end
        end
      end

      puts "Importando #{cartas_data.size} cartas da fixture para o banco de dados..."
      Carta.import_from_scryfall(cartas_data)

      # Gerar versões PT fakes para as cartas importadas (necessário para testes de idioma)
      cartas_importadas = Carta.where(scryfall_id: cartas_data.map { |c| c["id"] })

      cartas_importadas.each do |carta_en|
        unless Carta.exists?(oracle_id: carta_en.oracle_id, lang: "pt")
          carta_pt = carta_en.dup
          carta_pt.lang = "pt"
          carta_pt.scryfall_id = "#{carta_en.scryfall_id}-pt"
          carta_pt.printed_name = "[PT] #{carta_en.name}"
          carta_pt.save!
        end
      end

      puts "Importação da fixture concluída. Cartas no banco: #{Carta.count}"
    end

    desc "Importa os simbolos a partir de fixture local"
    task importar_simbolos: :environment do
      fixture_path = Rails.root.join("spec", "fixtures", "simbolos.json")

      unless File.exist?(fixture_path)
        puts "AVISO: Fixture #{fixture_path} não encontrada."
        next
      end

      puts "Carregando simbolos da fixture..."
      data = JSON.parse(File.read(fixture_path))

      puts "Importando #{data.size} simbolos da fixture para o banco de dados..."

      Simbolo.import_from_scryfall(data)

      puts "Importação da fixture concluída. Símbolos no banco: #{Simbolo.count}"
    end
  end
end
