require 'sanitize'

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

    # quick and dirty javascript filtering in CSS =(
    render :text => 'Please omit open/close style tags in your CSS' and return unless /(<\/style)/i.match(@page.css).nil?
    render :text => 'Please remove javascript from your CSS.' and return unless /(<script)/i.match(@page.css).nil?

    @page.body = Sanitize.clean(@page.body, Sanitize::Config::CUSTOM)
    @to_facebook  = (request.post?) ? true : false;
    matches = @page.body.match(/\[#slider:(\d+)\]/)
    @page.body.gsub!("[#slider:#{matches[1]}]", widgets('slider', matches[1]) ) unless matches.nil?
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
    Dir.mkdir 'tmp/cache' if !File.directory?('tmp/cache')
    
    f = File.new(@path, "w+")
    f.write(build_page)
    f.rewind    
  end
  
  # build the page in order to cache for facebook
  # no need to sanitize because fb will take care of that.
  def build_page
    @page = Page.first(:conditions => { :fb_sig_page_id => @id })
    return render_to_string(:template => "deploy/generic.erb") if @page.nil?  
    return '<div style="text-align:center">Be Back Shortly!</div>' if !@page.publish 
    
    @to_facebook  = true;
    @page.css.gsub!("\n", '')
    matches = @page.body.match(/\[#slider:(\d+)\]/)
    @page.body.gsub!("[#slider:#{matches[1]}]", widgets('slider', matches[1]) ) unless matches.nil?
    @page.body.gsub!('[:path]', 'http://grrowth.com/system')
    return render_to_string(:template => "deploy/index.erb") 
  end  

  # render widget code.
  def widgets(type, id)
    @slider = Slider.first(:conditions => { :id => id, :page_id => @page.id })
    return '[Invalid Slider ID!]' if @slider.nil?

    # quick and dirty javascript filtering =(
    return 'Please omit open/close style tags in your CSS' unless /(<\/style)/i.match(@slider.css).nil?
    return 'Please remove javascript from your CSS.' unless /(<script)/i.match(@slider.css).nil?
        
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)
    @slider.slides = [] unless @slider.slides.is_a?(Array)
    @standalone = false;
    return render_to_string(:template => "sliders/show")
  end 
   
end
