class Slider < ActiveRecord::Base
  belongs_to :pages
  validates_presence_of :name
  validates_numericality_of :height, :only_integer => true
  validates_numericality_of :width, :only_integer => true
  
  before_create :add_stock
  
  def add_stock
    self.slides = "['Sample Slide 1', 'Sample Slide 2', 'Sample Slide 3']"
    self.css = '
      #gallery-wrapper {
      margin:auto;
      }
      #gallery {

      }
      #gallery div.each-slide {
      text-align:center;
      }
      #gallery div span {
      display:block;
      margin:auto;
      margin-top:140px;
      font-size:72px;
      color:#fff;
      }

      #buttons {width:670px; margin:auto; position:relative; top:-60px;}
      #buttons a {display:block; padding:5px; line-height:40px; text-decoration:none;  font-weight:bold; font-size:40px;}
      #buttons a:hover {color:green;}
      #buttons #back {float:left;}
      #buttons #next {float:right; text-align:right;}

      #slide-1{background:orange}
      #slide-2{background:brown}
      #slide-3{background:green}
      #slide-4{background:lightblue}
      #slide-5{background:purple}
      #slide-6{background:black}
    '
  end
end
