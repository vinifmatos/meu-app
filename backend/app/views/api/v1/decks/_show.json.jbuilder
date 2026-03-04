json.call(deck, :id, :nome, :formato, :usuario_id, :created_at, :updated_at)

# Categorização das cartas
cartas_no_deck = deck.deck_cartas.includes(:carta)

# Helper para renderizar um grupo de cartas
render_grupo = lambda do |grupo|
  json.array!(grupo) do |dc|
    json.quantidade dc.quantidade
    json.eh_comandante dc.eh_comandante
    json.carta do
      json.partial! "api/v1/cartas/show", carta: dc.carta
    end
  end
end

json.cartas do
  json.comandantes do
    render_grupo.call(cartas_no_deck.where(eh_comandante: true))
  end

  json.terrenos do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Land%'"))
  end

  json.criaturas do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Creature%' AND cartas.type_line NOT ILIKE '%Land%'"))
  end

  json.instantes do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Instant%'"))
  end

  json.feiticos do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Sorcery%'"))
  end

  json.artefatos do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Artifact%' AND cartas.type_line NOT ILIKE '%Creature%'"))
  end

  json.encantamentos do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Enchantment%' AND cartas.type_line NOT ILIKE '%Creature%'"))
  end

  json.planeswalkers do
    render_grupo.call(cartas_no_deck.where(eh_comandante: false).joins(:carta).where("cartas.type_line ILIKE '%Planeswalker%'"))
  end

  json.outros do
    # Pegar o que sobrou
    tipos_conhecidos = ['Land', 'Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Planeswalker']
    ids_categorizados = deck.deck_cartas.joins(:carta).where(
      tipos_conhecidos.map { |t| "cartas.type_line ILIKE '%#{t}%'" }.join(" OR ")
    ).pluck(:id)
    
    render_grupo.call(cartas_no_deck.where.not(id: ids_categorizados).where(eh_comandante: false))
  end
end

# Totais
json.estatisticas do
  json.total_cartas deck.deck_cartas.sum(:quantidade)
  json.valido ::Decks::Validador.new(deck).validar!.empty?
end
