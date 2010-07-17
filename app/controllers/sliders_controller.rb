class SlidersController < ApplicationController
  layout false
  before_filter :require_user
  
  
  def index
    @sliders = Slider.all(
      :select => "id, name",
      :conditions => { :user_id => current_user.id, :page_id => params[:page_id] }
    )
    render :json => @sliders
  end
  
  def show
    @slider = Slider.find(
      params[:id],
      :conditions => { :user_id => current_user.id }
    )
    # quick and dirty javascript filtering =(
    render :text => 'Please omit open/close style tags in your CSS' and return unless /(<\/style)/i.match(@slider.css).nil?
    render :text => 'Please remove javascript from your CSS.' and return unless /(<script)/i.match(@slider.css).nil?
       
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)
    @slider.slides = [] unless @slider.slides.is_a?(Array)  
    @to_facebook = false;
    @standalone = true;
  end
  
  
  def edit
    @slider = Slider.find(
      params[:id],
      :conditions => { :user_id => current_user.id }
    )
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)
    @slider.slides = [] unless @slider.slides.is_a?(Array)
    
    @to_facebook = true;
    @html = render_to_string(:template => "sliders/show")
  end
   
    
  def new
    @page = Page.find(params[:page_id])
    @slider = @page.sliders.build
    @slider.height = 400
    @slider.width = 650
  end
  
  
  def create
    @page = Page.find(params[:page_id])
    @slider = @page.sliders.build(params[:slider]) 
    @slider.user_id = current_user.id
        
    if @slider.save
      render :json =>
      {
        'status'  => 'good',
        'msg'     => 'Slideshow created!',
        'created' => { 'resource' => 'sliders', 'id' => @slider.id }
      }
    elsif !@slider.valid?
      render :json => 
      {
        'status' => 'bad',
        'msg'    => "Oops! Please make sure all fields are valid!"
      }
    else
      render :json => 
      {
        'status' => 'bad',
        'msg'    => "Oops! Please try again!"
      }
    end  
  end
  

  def update
    @slider = Slider.find(
      params[:id],
      :conditions => { :user_id => current_user.id }
    ) 
    return if is_quickstart_guide(@slider) 
    
    slides = Array.new
    params[:slider_slides].each { |key, value| slides[key.to_i] = (value) } if ( !params[:slider_slides].nil? && params[:slider_slides].is_a?(Object) )
    params[:slider][:slides] = slides.compact.to_json
    
    if @slider.update_attributes(params[:slider])
      render :json => 
      {
        'status' => 'good',
        'msg'    => "Slider Updated!"
      }
    else
      render :json =>
      {
        'status' => 'bad',
        'msg'    => "Oops! Please try again!"
      }
    end  
  end
  
  
  def destroy
    return if is_sample_account
    
    @slider = Slider.find(
      params[:id], 
      :conditions => { :user_id => current_user.id }
    )
    @slider.destroy
    
    render :json =>
    {
      'status' => 'warn',
      'msg'    => "Slideshow deleted!"
    }
  end
    
end
