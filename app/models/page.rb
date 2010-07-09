class Page < ActiveRecord::Base
  belongs_to :user
  
  validates_presence_of :name
  after_save :renew_cache
  

  def renew_cache
    cache_file = File.join('tmp/cache', "#{self.fb_sig_page_id}.html")
    File.delete(cache_file) if File.exist?(cache_file)
  end
  
  
end
