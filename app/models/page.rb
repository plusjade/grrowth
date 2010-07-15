class Page < ActiveRecord::Base
  belongs_to :user
  has_many :sliders
  validates_presence_of :name
  validates_length_of :fb_sig_page_id, :minimum => 10
  validates_format_of :fb_sig_page_id, :with => /\A[a-zA-Z0-9]+\z/
  validates_uniqueness_of :fb_sig_page_id
  after_save :renew_cache
  

  def renew_cache
    cache_file = File.join('tmp/cache', "#{self.fb_sig_page_id}.html")
    File.delete(cache_file) if File.exist?(cache_file)
  end
    
end
