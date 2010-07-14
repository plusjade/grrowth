class User < ActiveRecord::Base
  acts_as_authentic
  has_many :pages
  
  after_create :add_samples
  
  def add_samples
    @page = self.pages.build
    @page.name = 'My First Page!'
    @page.fb_sig_page_id = ActiveSupport::SecureRandom.hex(8)
    @page.css = '
#hello{
  padding:5px;
  color:teal;
  border-bottom:1px solid #222;
  text-align:center;
}
#happy-face{
  width:100px;
  margin:auto;
  margin-top:20px;
  padding:50px;
  background:#63d55a;
  color:#fff;
  font-size:72px;
  font-weight:bold;
}
#footer{
  margin-top:40px;
  text-align:center;
}    
    '
    @page.save
    
    @slider         = @page.sliders.build
    @slider.user_id = self.id
    @slider.width   = 650
    @slider.height  = 300
    @slider.name    = 'My First Slideshow'
    @slider.save
    
    # need the slider id.
    @page.body = "
<h1 id=\"hello\">My First Page Is Actually Not That Bad At All!</h1>
[#slider:#{@slider.id}]
<div id=\"happy-face\">=)</div>
<div id=\"footer\">The end</div>    
    "
    @page.save
  end
  
end
