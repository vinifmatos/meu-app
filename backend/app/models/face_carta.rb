class FaceCarta < ApplicationRecord
  belongs_to :carta

  enum :face, front: 1, back: 2
end
