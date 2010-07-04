class DeployController < ApplicationController
  # we need this because all fb and ajax calls are via POST.
  skip_before_filter :verify_authenticity_token
  
   
  def index
    #render :text => 'Facebook credentials not sent.' and return if params['fb_sig_page_id'].nil?
    @id = '131864086829765'
    
    # TODO: look for a cached page before hitting the db.
    
    @page = Page.first(:conditions => { :fb_sig_page_id => @id })
    render :template => 'deploy/generic.erb' and return if @page.nil? 
    
    
    @jade = {'type'=> 'human'}

  end


end
