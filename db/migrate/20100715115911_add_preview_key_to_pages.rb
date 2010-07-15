class AddPreviewKeyToPages < ActiveRecord::Migration
  def self.up
    add_column :pages, :preview_key, :string, :null => false
    add_index :pages, :preview_key,  :unique => true
  end

  def self.down
    remove_column :pages, :preview_key
    remove_index :pages, :preview_key
  end
end
