class DeployController < ApplicationController
  # we need this because all fb and ajax calls are via POST.
  skip_before_filter :verify_authenticity_token
  
   
  def index
    render :text => 'Facebook credentials not sent.' and return if params['fb_sig_page_id'].nil?
    #@id = '131864086829765'
    @id = params['fb_sig_page_id']
    
    
    @path = File.join('tmp/cache', "#{@id}.html")
    render :text => render_cache
    return 
  end

  
  private
  def render_cache
    update_cache if !File.exist?(@path)
    
    f = File.open(@path) 
    return f.read
  end
  
  
  def update_cache
    f = File.new(@path, "w+")
    f.write(build_page)
    f.rewind    
  end
  

  def build_page
    @page = Page.first(:conditions => { :fb_sig_page_id => @id })
    
    if @page.nil?
      return render_to_string(:template => "deploy/generic.erb")  
    else
      return render_to_string(:template => "deploy/index.erb") 
    end
  end  

  
   
end
