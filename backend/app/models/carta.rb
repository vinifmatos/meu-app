class Carta < ApplicationRecord
  has_many :deck_cartas, dependent: :destroy
  has_many :decks, through: :deck_cartas
  has_many :faces, class_name: :FaceCarta, dependent: :destroy, inverse_of: :carta

  def self.import_from_scryfall(data)
    transaction do
      cartas_attributes = data.map do |card_data|
        {
          scryfall_id: card_data["id"],
          oracle_id: card_data["oracle_id"],
          power: card_data["power"],
          toughness: card_data["toughness"],
          mana_cost: card_data["mana_cost"],
          set: card_data["set"],
          collector_number: card_data["collector_number"],
          lang: card_data["lang"],
          colors: card_data["colors"],
          color_identity: card_data["color_identity"],
          color_indicator: card_data["color_indicator"],
          name: card_data["name"],
          type_line: card_data["type_line"],
          oracle_text: card_data["oracle_text"],
          image_uris: card_data["image_uris"],
          released_at: card_data["released_at"],
          rarity: card_data["rarity"],
          legalities: card_data["legalities"],
          printed_name: card_data["printed_name"],
          printed_type_line: card_data["printed_type_line"],
          printed_text: card_data["printed_text"]
        }
      end

      return if cartas_attributes.empty?

      Carta.upsert_all(cartas_attributes, unique_by: :scryfall_id)

      scryfall_ids = data.pluck("id")
      cartas_map = Carta.where(scryfall_id: scryfall_ids).pluck(:scryfall_id, :id).to_h

      faces_attributes = data.flat_map do |card_data|
        faces_data = card_data["card_faces"].to_a
        next unless faces_data.any?

        carta_id = cartas_map[card_data["id"]]
        next unless carta_id

        faces_data.map.with_index do |face_data, index|
          next unless face_data["illustration_id"].present?

          face_name = index.zero? ? :front : :back
          {
            carta_id: carta_id,
            face: face_name,
            power: face_data["power"],
            toughness: face_data["toughness"],
            mana_cost: face_data["mana_cost"],
            colors: face_data["colors"],
            name: face_data["name"],
            type_line: face_data["type_line"],
            oracle_text: face_data["oracle_text"],
            image_uris: face_data["image_uris"],
            illustration_id: face_data["illustration_id"],
            printed_name: face_data["printed_name"],
            printed_type_line: face_data["printed_type_line"],
            printed_text: face_data["printed_text"]
          }
        end
      end.compact

      FaceCarta.upsert_all(faces_attributes, unique_by: [ :carta_id, :face, :illustration_id ]) if faces_attributes.any?
    end
  end

  def nome_exibicao
    printed_name || name
  end

  def tipo_exibicao
    printed_type_line || type_line
  end

  def texto_exibicao
    printed_text || oracle_text
  end
end
