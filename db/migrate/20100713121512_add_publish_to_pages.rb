class AddPublishToPages < ActiveRecord::Migration
  def self.up
    add_column :pages, :publish, :boolean, :default => 0
  end

  def self.down
    remove_column :pages, :publish
  end
end
