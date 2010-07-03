class PagesController < ApplicationController
  # we need this because all fb and ajax calls are via POST.
  skip_before_filter :verify_authenticity_token
  
  
  def index
    @jade = {'type'=> 'human'}

  end

end
