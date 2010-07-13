class SlidersController < ApplicationController
  layout false
  before_filter :require_user
  
  
  def index
    @sliders = Slider.all(
      :conditions => { :user_id => current_user.id, :page_id => 1 }
    )
  end
  
  def show
    @slider = Slider.find(
      params[:id],
      :conditions => { :user_id => current_user.id }
    )
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)
    @preview = true;  
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
        'msg'     => 'Slider created!',
        'created' => { 'resource' => 'pages', 'id' => @slider.id }
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
  
  def edit
    @slider = Slider.find(
      params[:id],
      :conditions => { :user_id => current_user.id, :page_id => 1 }
    )
    @slider.slides = ActiveSupport::JSON.decode(@slider.slides)  
  end
  

  def update
    @slider = Slider.find(
      params[:id],
      :conditions => { :user_id => current_user.id, :page_id => 1 }
    ) 
    
    slides = Array.new
    params[:slider_slides].each { |key, value| slides[key.to_i] = (value) }
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
    @slider = Slider.find(
      params[:id], 
      :conditions => { :user_id => current_user.id }
    )
    @slider.destroy
    
    render :json =>
    {
      'status' => 'warn',
      'msg'    => "Slider Destroyed!"
    }
  end
    
end