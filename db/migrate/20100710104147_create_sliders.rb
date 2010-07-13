class CreateSliders < ActiveRecord::Migration
  def self.up
    create_table :sliders do |t|
      t.references :user
      t.references :page
      t.string :name
      t.integer :slide_count, :default => 0, :null => false
      t.integer :height, :default => 400, :null => false
      t.integer :width,  :default => 650, :null => false      
      t.text :slides, :null => false
      t.text :css, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :sliders
  end
end
