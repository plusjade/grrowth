class PagesController < ApplicationController
  
  before_filter :require_user
    
  def index
    @user = current_user
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
  end


  #POST
  def create
    @user = current_user
    @page = @user.pages.build(params[:page])
    @page.fb_sig_page_id = ActiveSupport::SecureRandom.hex(8)    
    @page.body = "<h1 id=\"sample\">#{@page.name}</h1><div id=\"omit\">Created new page!<br/>(feel free to delete this)</div>"
    @page.css = 'h1#sample {text-align:center; color:green;} #omit{text-align:center;}'
    
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
    render :json => 
    {
      'status' => 'warn',
      'msg'    => "Page deleted! =("
    }
  end

 
end
