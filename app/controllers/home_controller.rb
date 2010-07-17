class HomeController < ApplicationController
  
  skip_before_filter :verify_authenticity_token
  
  def index
    if request.post?
      render :text => 'Some FBML ehboy!'
      return
    end
  end
  
  
  def about
  
    
  end
  
end
