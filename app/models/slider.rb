class Slider < ActiveRecord::Base
  belongs_to :pages
  validates_presence_of :name
  validates_numericality_of :height, :only_integer => true
  validates_numericality_of :width, :only_integer => true
  
  before_create :add_stock
  
  def add_stock
    self.slides = '
["<h2>Creating a Basic Slideshow</h2>\n\n<h3>Table of Contents</h3>\n\n<ol>\n  <li>Create a new slide show via the \"+ Slideshow\" tab.</li>\n  <li>Add and edit slides via the Slides tab.</li>\n  <li>Use CSS to style your slideshow</li>\n  <li>Add slideshow to your page.</li> \n</ol>","<h2>1. Creating a New Slideshow</h2>\n<p>\nNavigate to the \"+ Slideshow\" tab and click the \"new Slideshow\" link at the top.\n<br/>Here you can name your slideshow and set the width and height.\n<br/>Click save and a working sample slideshow will display.\n  </p>","<h2>2. Adding and Editing Slides</h2>\n<p>\nNavigate to the \"Edit Slides\" tab.\n<br/>New slides can be created by clicking on the \"new slide\" link.\n<br/>You can rearrange slides by dragging slides to new positions.\n<br/>Click on a green slide bar to edit its contents. \n<br/>Valid XHTML can be added to the editor.\n<br/>Delete a slide by clicking the [x] to the right end of the slide bar.\n</p>\n<p>\n<b>Note</b> that all changes are only saved when pressing <b>CTRL + S</b>\nwhile in an editor or pressing the green <b>Save Slideshow</b> button at the top right.\n  <br/>\nThis includes slide positions, new slides, deleted slides, and edited slide content.\n</p>","<h2>3. Styling Your Slideshow With CSS</h2>\n<p> \nNavigate to the CSS tab and enter valid CSS into the editor. \n<br/>You can include background images via absolute url paths.\n</p>","<h2>4. Add Slideshow to Your Page.</h2>\n<p>\nLocate the unique <b>TOKEN</b> located at the top left of the widget tab.\n<br/>Copy the token from the text input box. \n</p>\n<p>\nThe token looks like this: <b>[#slider:15]</b>\n</p>\n<p>\nMake sure all changes to your slide show is saved, then navigate to the\n\"Body\" tab. Paste the slideshow token into your body code wherever you want the slideshow to appear.\nSave your page.\n</p>"]
    '
    self.css = '
/* The main slideshow structure styling. Take care when editing these main containers.
   --------------------------------------------- */
#slideshow-wrapper {margin:auto;} /* center the slideshow */
#gallery-wrapper {border:2px solid #111; }
#gallery {
  background:#111 url("http://aplanofattack.com/system/samples/gradient.png") repeat-x bottom left;
}
#gallery div.each-slide {}

/* IMPORTANT: Always use the span tag to customize the slides especially when adding padding.
   --------------------------------------------- */
#gallery div.each-slide span.slide-container {
  display:block;
  padding:20px;
  color:#fff;
  font-size:14px;
 }
#gallery div.each-slide span.slide-container h2{margin:0; margin-bottom:10px; text-align:center;}
#gallery ol li{ margin-bottom:10px;}
/* back, next and reset links are styled here:
   --------------------------------------------- */
#buttons {position:relative; top:-50px;}
#buttons a {
display:block; padding:5px; line-height:40px; text-decoration:none;  font-weight:bold; font-size:40px; color:#ffff99;}
#buttons a:hover {color:orange;}
#buttons a#back-link {float:left;}
#buttons a#next-link {float:right; text-align:right;}
#reset {text-align:center;}

/* each slide has a unique id based on its position as follows:
   --------------------------------------------- */
#slide-1 {}
#slide-2 {}
#slide-3 {}
    '
  end
end
