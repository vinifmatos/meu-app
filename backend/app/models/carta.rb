class Carta < ApplicationRecord
  has_many :faces, class_name: :FaceCarta, dependent: :destroy, inverse_of: :carta

  def self.import_from_scryfall(data)
    data.each do |card_data|
      carta = find_or_initialize_by(scryfall_id: card_data["id"])
      carta.assign_attributes(
        oracle_id: card_data["oracle_id"],
        uri: card_data["uri"],
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
        image_uris: card_data["image_uris"]
      )

      faces_data = card_data["card_faces"].to_a

      if faces_data.any?
        faces_data.each_with_index do |face_data, index|
          face_name = index.zero? ? :front : :back
          face = carta.face_cartas.find_or_initialize_by(face: face_name)
          face.assign_attributes(
            power: face_data["power"],
            toughness: face_data["toughness"],
            mana_cost: face_data["mana_cost"],
            colors: face_data["colors"],
            name: face_data["name"],
            type_line: face_data["type_line"],
            oracle_text: face_data["oracle_text"],
            image_uris: face_data["image_uris"]
          )
          face.save!
        end
      end

      carta.save!
    end
  end
end
