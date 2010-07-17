class User < ActiveRecord::Base
  acts_as_authentic
  has_many :pages
  
  after_create :add_samples
  
  def add_samples
    @page = self.pages.build
    @page.name = 'Quickstart Guide (Contains Sample Code)'
    @page.save
    
    @slider         = @page.sliders.build
    @slider.user_id = self.id
    @slider.width   = 650
    @slider.height  = 300
    @slider.name    = 'My First Slideshow'
    @slider.save
    
    sample ='
<div style="clear:both; margin:10px 50px;">
  <h4>Structure and Styling.</h4>
  <p>
    There are some basic CSS helper tags in the "page CSS" for header tags and the &lt;p&gt; tag.
    Try to use header tags, &lt;div&gt; &lt;/div&gt;, and &lt;p&gt; &lt;/p&gt; tags to markup text since Facebook likes properly coded markup.
    CSS3 does not work in Facebook. You can use inline CSS as well. 
    If in doubt, click the green <b>Facebook Preview</b> on the top right to see how your code looks in Facebook.
  </p>
  
  <h4>Images</h4>
  <p>
    Images work just fine, just make sure to use absolute paths.
    <br/>Animated gifs do not work because Facebook caches static versions of them?
    <br/>Most custom Facebook tabs are just a huge (nicely designed) splash image.
    So feel free to set that up easily.
  </p>
  
  <h4>CTRL + S To Save Code.</h4>
  <p>
    <b>CTRL + S</b> works when your cursor is in a code editor. The "Save" action saves
    all of the data associated with the resource you are working on.
    For example saving the "Page CSS" will also save the HTML, name, Fb id, etc.
    
    <br/>So feel free to navigate between tabs, but always remember to save frequently.
  </p>
  
  <p>
    Have a look at the sample code and if you need help just email <em>plusjade@gmail.com</em>
    <br/>-Thanks!
    <br/>-Jade
  </p>
</div>

<div id="happy-face">=)</div>
<div id="footer">The end</div>'

    # need the slider id.
    @page.body = "<h1 id=\"hello\">Aplanofattack Quickstart Guide.</h1>\n[#slider:#{@slider.id}]\n" + sample
    @page.css = '
/* helpers */
h1,h2,h3,h4,h5,h6{margin:0; margin-bottom:10px;}
h1{font-size:36px;}
h2{font-size:30px;}
h3{font-size:24px;}
h4{font-size:18px;}
h5{font-size:16px;}
p {line-height:1.5em; font-size:14px; margin:0; margin-bottom:10px;}

#hello{
  padding:5px;
  margin-bottom:20px;
  color:#ff7676;
  border-bottom:1px dotted #ff7676;
  text-align:center;
}
#happy-face{
  width:100px;
  text-align:center;
  margin:auto;
  margin-top:20px;
  padding:20px;
  color:#ff7676;
  font-size:72px;
  font-weight:bold;
  border:1px dotted #ff7676;
}
#footer{
  margin-top:40px;
  text-align:center;
}    
    '
    @page.save
  end
  
end
