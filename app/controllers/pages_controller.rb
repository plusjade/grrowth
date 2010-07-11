class PagesController < ApplicationController
  
  before_filter :require_user
    
  def index
    render :text => 'nothing'
  end


  def show
    @page = Page.find(params[:id])
    respond_to do |format|
      format.html {}
      format.json do
        render :json => @page
      end
    end
  end


  # GET
  def new
    @user = current_user
    @page = @user.pages.build
    render :template => 
      'pages/new',
      :layout => false,
      :locals => {:page => @page} if request.xhr?
  end


  #POST
  def create
    @user = current_user
    @page = @user.pages.build(params[:page])    
    if @page.save
      render :json =>
      {
        'status'  => 'good',
        'msg'     => 'Page created!',
        'created' => { 'resource' => 'pages', 'id' => @page.id }
      }
    elsif !@page.valid?
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
    @page = Page.find(
      params[:id], 
      :conditions => { :user_id => current_user.id }
    )
    render :template =>
      'pages/edit',
      :layout => false,
      :locals => {:page => @page} if request.xhr?
  end


  def update
    @page = Page.find(
      params[:id], 
      :conditions => { :user_id => current_user.id }
    )
    if @page.update_attributes(params[:page])
      render :json => 
      {
        'status' => 'good',
        'msg'    => "Page Updated!"
      }
    elsif !@page.valid?
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


  def destroy
    @page = Page.find(
      params[:id], 
      :conditions => { :user_id => current_user.id }
    )
    @page.destroy

    
  end

 
end
