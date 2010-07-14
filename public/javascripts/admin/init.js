;$(document).ready(function(){
  loading = '<div class="loading">Loading...</div>';
  function addNew(index){ return '<li><div class="info"><span>Slide '+ index +' </span><a href="#" class="remove">[x]</a><a href="#" class="edit">edit</a></div><div class="edit"><textarea id="slider_slides_'+ index +' " name="slider_slides['+ index +']">slide number: '+ index +'</textarea></div></li>';};
  function newSlider(s) { return '<option value="/sliders/'+s.id+'/edit">'+s.name+' => <b>[#slider:'+s.id+']</b></option>'};

// update sliders list.
  function updateSliders(add){
    $.getJSON('/pages/'+$('#main').attr('rel')+'/sliders.json', function(rsp){
      var links = '<option value="0">Select a Slideshow</option>';
      $.each(rsp, function(){
        links += newSlider(this.slider);
      });
      $('select.widget-list').html(links);
      if(add){
        $("select.widget-list option:selected").removeAttr("selected");
        $("select.widget-list option:last").attr("selected", "selected");
      }
    })  
  }             
  function loadInto(url, div, callback){
    $(div).html(loading);
    $.get(url, function(view){
      $(div).html(view);
      $(document).trigger('ajaxify.forms');
      if(callback && (typeof callback == 'function')) callback();
    })    
  }
  
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
    // load pages into the editing environment
    'ul#pages-list li a.edit' : function(e){
      $.facebox.close();
      loadInto(e.target.href, '#holder', function(){
        $('ul#page-tabs li a:first').click();
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
    'ul.widget-list li a.edit' : function(e){
      loadInto(e.target.href, 'div#widget-wrapper', function(){
         $('ul#widget-tabs li a:first').click();
      });
      return false;
    },
        
    // delete a resource using REST.
    'a.delete' : function(e){
      $.ajax({
        type: 'DELETE',
        dataType:'json',
        url: e.target.href,
        beforeSend: function(){
          if(!confirm('Sure you want to delete?')) return false;
          $(document).trigger('submitting');
        },
        success: function(rsp){
          $(document).trigger('responding', rsp);
          if($(e.target).attr('rel') == 'pages'){
            $(e.target).parent('li').remove();
            $('#holder').empty();
          }
          if($(e.target).attr('rel') == 'sliders'){
            $('div#widget-wrapper').empty();
            updateSliders();
          }
        }
      })
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
    'ul#slides-list a.remove' :function(e){
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
        if(undefined != rsp.created){
          if(rsp.created.resource == 'pages'){
            $.facebox.close();
            loadInto('/pages/'+ rsp.created.id +'/edit', '#holder', function(){
              $('ul#page-tabs li a:first').click();
            })         
          }  
          if(rsp.created.resource == 'sliders'){
            $.facebox.close();
            loadInto('/sliders/'+ rsp.created.id +'/edit', 'div#widget-wrapper', function(){
               $('ul#widget-tabs li a:first').click();
            });
            updateSliders(true);
          }  
        }

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
