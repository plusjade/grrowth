class AddFbsigToPages < ActiveRecord::Migration
  def self.up
    add_column :pages, :fb_sig_page_id, :string
    add_index :pages, :fb_sig_page_id
  end

  def self.down
    remove_column :pages, :fb_sig_page_id
    remove_index :pages, :fb_sig_page_id
  end
end
