class HomeController < ApplicationController
  
  skip_before_filter :verify_authenticity_token
  
  def index
    render :text => 'Some FBML ehboy!'
    return
  end
  
end
