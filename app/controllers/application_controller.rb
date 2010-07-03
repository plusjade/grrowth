# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time

  filter_parameter_logging :password, :password_confirmation
  helper_method :current_user_session, :current_user
    
  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => '1e2074d45c182ed5f3743d8d17ccd9c7'
  
  # See ActionController::Base for details 
  # Uncomment this to filter the contents of submitted sensitive data parameters
  # from your application log (in this case, all fields with names like "password"). 
  # filter_parameter_logging :password
  

  def configure_layout
    ( ['index','show'].include? action_name ) ? 'shop' : 'admin' 
  end
  

  # helper for attaching assets to a profile.
  def attach_helper(profile)
    tally = 0
    params[:asset].each do |asset|
      @asset = Asset.find(asset)
      next if @asset.nil?
      tally += 1 if profile.assets.attach(@asset)
    end

    render :json =>
    {
      'status' => 'good',
      'msg'    => "attached #{tally} images"
    }  
  end


  # helper for detaching assets to a profile.
  def detach_helper(profile)
    tally = 0
    params[:asset].each do |asset|
      @asset = Asset.find(asset)
      next if @asset.nil?
      tally += 1 if profile.assets.detach_quick(@asset)
    end
    
    render :json =>
    {
      'status' => 'good',
      'msg'    => "detached #{tally} images"
    }  
  end
  
  
  private
    def current_user_session
      return @current_user_session if defined?(@current_user_session)
      @current_user_session = UserSession.find
    end
    
    def current_user
      return @current_user if defined?(@current_user)
      @current_user = current_user_session && current_user_session.record
    end
    
    def require_user
      unless current_user
        store_location
        flash[:notice] = "You must be logged in to access this page"
        redirect_to new_user_session_url
        return false
      end
    end

    def require_no_user
      if current_user
        store_location
        flash[:notice] = "You must be logged out to access this page"
        redirect_to account_url
        return false
      end
    end
    
    def store_location
      session[:return_to] = request.request_uri
    end
    
    def redirect_back_or_default(default)
      redirect_to(session[:return_to] || default)
      session[:return_to] = nil
    end
    
    
end
