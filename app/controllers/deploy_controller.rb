class DeployController < ApplicationController
  # we need this because all fb and ajax calls are via POST.
  skip_before_filter :verify_authenticity_token
  
   
  def index
    render :text => 'Facebook credentials not sent.' and return if (params['fb_sig_page_id'].nil? and params[:id].nil?)
    
    #@id = '131864086829765'
    @id = (params[:id]) ? params[:id] : params['fb_sig_page_id']
    
    
    @path = File.join('tmp/cache', "#{@id}.html")
    render :text => render_cache
    return 
  end


  def sample_widget
    render :nothing => true and return if params[:id].nil?
    
    @output = widgets('slider', params[:id])
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
      @page.css.gsub!("\n", '')
      matches = @page.body.match(/\[#slider:(\d+)\]/)
      @page.body.gsub!("[#slider:#{matches[1]}]", widgets('slider', matches[1]) ) unless matches.nil?
      @page.body.gsub!('[:path]', 'http://grrowth.com/system')
      return render_to_string(:template => "deploy/index.erb") 
    end
  end  

  # render the view for a widget
  def widgets(type, id)
    @slider = Slider.first(:conditions => {
      :id => id,
      :user_id => current_user.id
    })
    return '[Invalid Slider ID!]' if @slider.nil?
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)
    return render_to_string(:template => "widgets/#{type}.erb")
    
  end 
   
end
