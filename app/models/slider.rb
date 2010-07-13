class Slider < ActiveRecord::Base
  belongs_to :pages
  validates_presence_of :name
  validates_numericality_of :height, :only_integer => true
  validates_numericality_of :width, :only_integer => true
end
