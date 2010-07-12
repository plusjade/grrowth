;$(document).ready(function(){
  var loading = '<div class="loading">Loading...</div>';
  function addNew(index){ return '<li><div class="info"><span>Slide '+ index +' </span><a href="#" class="delete">[x]</a><a href="#" class="edit">edit</a></div><div class="edit"><textarea id="slider_slides_'+ index +' " name="slider_slides['+ index +']">slide number: '+ index +'</textarea></div></li>';};
  
  function loadInto(url, div, callback){
    $(div).html(loading);
    $.get(url, function(view){
      $(div).html(view);
      $(document).trigger('ajaxify.forms');
      if(callback && (typeof callback == 'function')) callback();
    })    
  }
  
  $('ul#pages-list li a.edit').click(function(){
    loadInto(this.href, '#holder', function(){
      $('ul#page-tabs li a:first').click();
    })
    return false;
  })
  
/* delegations
------------------------------- 
------------------------------- */    
  $('body').click($.delegate({
   'a[rel*=facebox]' :function(e){
      $.facebox(function(){ 
        $.get(e.target.href, function(data) { $.facebox(data) })
      })
      return false;
   },
   // activate tab navigation for page editing panel
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
      // this is so javascript in the preview gets removed.
      $('div#tab-view').empty();
      return false;
    },
    
   // activate tab navigation for widget editing panel
    'ul#widget-tabs li a' : function(e){
      $('div.widget-tabs').hide();
      $('ul#widget-tabs li a').removeClass('active');
      $(e.target).addClass('active');
      var $tab = $('div#'+ $(e.target).attr('rel'));
      $tab.show();
      if(e.target.id == 'loadachu'){
        $tab.html(loading);
        $.get(e.target.href, function(view){
          $tab.html(view);
        })      
      }
      return false;
    },
    
   // load widgets editable environment
    'ul.widget-list li a' : function(e){
      loadInto(e.target.href, 'div#widget-wrapper', function(){
         $('ul#widget-tabs li a:first').click();
      });
      return false;
    },  
/*
  edit sliders environment
*/ 
   // overload save button to change textarea insertion order.
    'button#save-slider' : function(e){
      $.each($('ul#slides-list li'), function(key, node){
        $('textarea', $(this)).attr('name', 'slider_slides['+ key +']');
      })
    },
    'a#new-slide' : function(e){
      var index = $('ul#slides-list li').length;
      $('ul#slides-list').append(addNew(index));
      return false;
    },
    'ul#slides-list a.edit' :function(e){
      $(e.target).parent().next('div').toggle();
      return false;
    },  
    'ul#slides-list a.delete' :function(e){
      $(e.target).parent().parent('li').remove();
      return false;
    }   
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
