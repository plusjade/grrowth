class DeployController < ApplicationController
  # we need this because all fb and ajax calls are via POST.
  skip_before_filter :verify_authenticity_token
  
  # facebook pages call this page which always serves the cache.
  def index
    render :text => 'Facebook credentials not sent.' and return if (params['fb_sig_page_id'].nil? and params[:id].nil?)
    @id = (params[:id]) ? params[:id] : params['fb_sig_page_id']
    @path = File.join('tmp/cache', "#{@id}.html")
    
    render :text => render_cache
    return 
  end

  # always build the page preview for admin mode quick view
  def preview
    render :text => 'Facebook credentials not sent.' and return if params[:id].nil?
    @page = Page.first(:conditions => { :fb_sig_page_id => params[:id] })
    render :text => 'Page not found' and return if @page.nil?
    
    matches = @page.body.match(/\[#slider:(\d+)\]/)
    @page.body.gsub!("[#slider:#{matches[1]}]", widgets('slider', matches[1], true) ) unless matches.nil?
    @page.body.gsub!('[:path]', 'http://grrowth.com/system')
    render :template => "deploy/index.erb"
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
    return render_to_string(:template => "deploy/generic.erb") if @page.nil?  
    
    @page.css.gsub!("\n", '')
    matches = @page.body.match(/\[#slider:(\d+)\]/)
    @page.body.gsub!("[#slider:#{matches[1]}]", widgets('slider', matches[1]), false ) unless matches.nil?
    @page.body.gsub!('[:path]', 'http://grrowth.com/system')
    return render_to_string(:template => "deploy/index.erb") 
  end  

  # render the view for a widget
  def widgets(type, id, preview)
    @slider = Slider.first(:conditions => {
      :id => id,
      :user_id => current_user.id
    })
    return '[Invalid Slider ID!]' if @slider.nil?
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)
    @preview = preview;
    return render_to_string(:template => "sliders/show")
  end 
   
end
