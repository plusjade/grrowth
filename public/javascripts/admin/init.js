;$(document).ready(function(){
  var loading = '<div class="loading">Loading...</div>';


    
  //$('a[rel*=facebox]').facebox();
  $('ul#pages-list li a.edit').click(function(){
    $('#content').html(loading);
    $.get(this.href, function(view){
      $('#content').html(view);
      $(document).trigger('ajaxify.forms');
      $('ul#page-tabs li a:first').click();
    })
    return false;
  })
  
  $('body').click($.delegate({
   'a[rel*=facebox]' :function(e){
      $.facebox(function(){ 
        $.get(e.target.href, function(data) { $.facebox(data) })
      })
      return false;
   },
   
   
   // activate tab navigation
    'ul#page-tabs li a' : function(e){
      $('div.tab-content').hide();
      $('ul#page-tabs li a').removeClass('active');
      $(e.target).addClass('active');
      var $tab = $('div#'+ $(e.target).attr('rel'));
      $tab.show();
      if(e.target.id == 'load'){
        $tab.html(loading);
        $.get(e.target.href, function(view){
          $tab.html(view);
        })      
      }
      
      return false;
    },
    
     
   // activate tab navigation
    'div#tab-widget ul li a' : function(e){
      $('div#widget-wrapper').html(loading);
      $.get(e.target.href, function(view){
        $('div#widget-wrapper').html(view);
        $(document).trigger('ajaxify.forms');
      });
            
      return false;
    },  
  
  
  }));  

/* bindings 
------------------------------- 
------------------------------- */  
  // ajaxify the forms
  $(document).bind('ajaxify.forms', function(){
    $('form').ajaxForm({
      dataType : 'json',     
      beforeSubmit: function(fields, form){
        if(! $("input", form[0]).jade_validate() ) return false;
        $('button', form[0]).attr('disabled','disabled').removeClass('positive');
        $(document).trigger('submitting');
      },
      success: function(rsp) {
        $(document).trigger('responding', rsp);
        $('form button').removeAttr('disabled').addClass('positive');
      }
    });
  });

  
  // facebox reveal callback  
  $(document).bind('reveal.facebox', function(){
    $(document).trigger('ajaxify.forms');
  });

  // facebox close callback
  $(document).bind('close.facebox', function() {
    //$('body').removeClass('disable_body').removeAttr('scroll');
  });

  // show the submit ajax loading graphic.
  $(document).bind('submitting', function(){
    $('div.responding.active').remove();
    $('div.submitting').show();
  });

  // show the response (always json)
  $(document).bind('responding', function(e, rsp){
    var status = (undefined == rsp.status) ? 'bad' : rsp.status;
    var msg = (undefined == rsp.msg) ? 'There was a problem!' : rsp.msg;
    $('div.submitting').hide();
    $('div.responding.active').remove();
    $('div.responding').clone().addClass('active ' + status).html(msg).show().insertAfter('.responding');
    setTimeout('$(".responding.active").fadeOut(4000)', 1900);  
  }); 
});
