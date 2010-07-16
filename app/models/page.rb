class Page < ActiveRecord::Base
  belongs_to :user
  has_many :sliders
  validates_presence_of :name
  validates_length_of :fb_sig_page_id, :minimum => 10
  validates_format_of :fb_sig_page_id, :with => /\A[a-zA-Z0-9]+\z/
  validates_uniqueness_of :fb_sig_page_id
  
  before_validation_on_create :generate_defaults
  after_save   :renew_cache
  

  def generate_defaults
    self.preview_key    = ActiveSupport::SecureRandom.hex(8) 
    self.fb_sig_page_id = ActiveSupport::SecureRandom.hex(8)    
    self.body           = "<h1 id=\"sample\">#{self.name}</h1><div id=\"omit\">Created new page!<br/>(feel free to delete this)</div>"
    self.css            = '
h1,h2,h3,h4,h5,h6{margin:0; margin-bottom:10px;}
h1{font-size:36px;}
h2{font-size:30px;}
h3{font-size:24px;}
h4{font-size:16px;}
p {line-height:1.5em; font-size:14px; margin:0; margin-bottom:10px;}

h1#sample {text-align:center; color:green;} #omit{text-align:center;}
'
  end
  
  
  def renew_cache
    cache_file = File.join('tmp/cache', "#{self.fb_sig_page_id}.html")
    File.delete(cache_file) if File.exist?(cache_file)
  end
    
end
