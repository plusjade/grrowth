class CreateSliders < ActiveRecord::Migration
  def self.up
    create_table :sliders do |t|
      t.references :user
      t.references :page
      t.string :name
      t.integer :slide_count
      t.integer :height
      t.integer :width      
      t.text :slides
      t.text :css
      t.timestamps
    end
  end

  def self.down
    drop_table :sliders
  end
end
