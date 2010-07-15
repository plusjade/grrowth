
  Sanitize::Config::CUSTOM = {
    :elements => [
      'div','span','br','applet','object','iframe','h1','h2','h3','h4','h5','h6','p','blockquote','pre','a','abbr','acronym','address','big','cite','code','del','dfn','em','font','img','ins','kbd','q','s','samp','small','strike','strong','sub','sup','tt','var','b','u','i','center','dl','dt','dd','ol','ul','li','table','caption','tbody','tfoot','thead','tr','th','td'
    ],
    :attributes => {
      :all  => ['id','class', 'title','rel','style'],
      'a'   => ['href'],
      'img' => ['src','alt']
    }
  }
