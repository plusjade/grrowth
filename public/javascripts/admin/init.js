;$(document).ready(function(){
  var loading = '<div class="loading">Loading...</div>';
  function newSlide(index){ return '<li><div class="info"><span>Slide '+ index +' </span><a href="#" class="remove">[x]</a><a href="#" class="edit">edit</a></div><div class="edit"><textarea id="slider_slides_'+ index +' " name="slider_slides['+ index +']">slide number: '+ index +'</textarea></div></li>';};
  function newSlider(s) { return '<option value="/sliders/'+s.id+'/edit">'+s.name+' => <b>[#slider:'+s.id+']</b></option>'};

// update sliders list.
  function updateSliders(add){
    $.getJSON('/pages/'+$('#main').attr('rel')+'/sliders.json', function(rsp){
      var $sliders = $('#sliders-list'),
        links = '<option value="0">Select a Slideshow</option>';
      $.each(rsp, function(){
        links += newSlider(this.slider);
      });
      $sliders.html(links);
      if(add){
        $("option:selected", $sliders).removeAttr("selected");
        $("option:last", $sliders).attr("selected", "selected");
      }
    })  
  }             
  function loadInto(url, div, callback){
    var $div = $(div);
    $div.html(loading);
    $.get(url, function(view){
      $div.html(view);
      if(callback && (typeof callback == 'function')) callback();
      $(document).trigger('ajaxify.forms');
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
    '#pages-list li a.edit' : function(e){
      $.facebox.close();
      loadInto(e.target.href, '#holder', function(){
        $(document).trigger('page.init');
      })
      return false;
    },
  
   // activate tab navigation for page editing panel
    '#page-tabs li a' : function(e){
      $('div.tab-content').hide();
      $('#page-tabs li a').removeClass('active');
      $(e.target).addClass('active');
      var $tab = $('#'+ $(e.target).attr('rel'));
      $tab.show();
      if(e.target.id == 'load'){
        $tab.html(loading);
        $.get(e.target.href, function(view){
          $tab.html(view);
        })      
      }
      // this is so javascript in the preview gets removed.
      $('#tab-view').empty();
      return false;
    },
    
   // activate tab navigation for widget editing panel
    '#widget-tabs li a' : function(e){
      $('div.widget-tabs').hide();
      $('#widget-tabs li a').removeClass('active');
      $(e.target).addClass('active');
      var $tab = $('#'+ $(e.target).attr('rel'));
      $tab.show();
      if(e.target.id == 'loadachu'){
        $tab.html(loading);
        $.get(e.target.href, function(view){
          $tab.html(view);
        })      
      }
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
            $('#widget-wrapper').empty();
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
    '#save-slider' : function(e){
      $.each($('#slides-list li'), function(key, node){
        $('textarea', $(this)).attr('name', 'slider_slides['+ key +']');
      })
    },
    '#new-slide' : function(e){
      var index = $('#slides-list li').length;
      $('#slides-list').append(newSlide(index));
      return false;
    },
    '#slides-list a.edit' :function(e){
      $(e.target).parent().next('div').toggle();
      return false;
    },  
    '#slides-list a.remove' :function(e){
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
              $(document).trigger('page.init');
            })         
          }  
          if(rsp.created.resource == 'sliders'){
            $.facebox.close();
            loadInto('/sliders/'+ rsp.created.id +'/edit', '#widget-wrapper', function(){
               $(document).trigger('widget.init');
            });
            updateSliders(true);
          }  
        }

        $(document).trigger('responding', rsp);
        $('form button').removeAttr('disabled').addClass('positive');
      }
    });
  });

 // initialize the page edit environment
  $(document).bind('page.init', function(){
  
    $('#page-tabs li a:first').click();
    $('select.widget-list').change(function(){
      var url = $('option:selected', $(this)).val();
      if(url == 0) return;
      loadInto(url, '#widget-wrapper', function(){
        $(document).trigger('widget.init');
      })       
      return false;
    });
    
    var pageBody = CodeMirror.fromTextArea('page_body_helper', {
      width: "820px",
      height: "700px",
      parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
      stylesheet: ["/stylesheets/codemirror/xmlcolors.css?232331sdf", "/stylesheets/codemirror/jscolors.css?12312"],
      path: "/javascripts/codemirror/",
      continuousScanning: 500,
      lineNumbers: true,
      textWrapping: false,
      saveFunction: function(){
        $('#page_body').val(pageBody.getCode());
        $('#page_css').val(pageCss.getCode());
        $('form.edit_page').submit();
      },
      initCallback: function(editor){
        editor.setCode($('#page_body').val());    
      }    
    });

    var pageCss = CodeMirror.fromTextArea('page_css_helper', {
      width: "820px",
      height: "700px",
      parserfile: "parsecss.js",
      stylesheet: "/stylesheets/codemirror/csscolors.css?3453",
      path: "/javascripts/codemirror/",
      continuousScanning: 500,
      lineNumbers: true,
      saveFunction: function(){
        $('#page_body').val(pageBody.getCode());
        $('#page_css').val(pageCss.getCode());
        $('form.edit_page').submit();
      },
      initCallback: function(editor){
        editor.setCode($('#page_css').val());
      }
    });

   // overload save button for saving a page
    $('#save-page').click(function(){
      $('#page_body').val(pageBody.getCode());
      $('#page_css').val(pageCss.getCode());
    })  
  });


 // initialize the widget edit environment
  $(document).bind('widget.init', function(){
    $('#widget-tabs li a:first').click();
    $("#slides-list").sortable({axis: 'y' });
    
    var sampleHtml = CodeMirror.fromTextArea('sample-html', {
      readOnly: true,
      width: "820px",
      height: "700px",
      parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
      stylesheet: ["/stylesheets/codemirror/xmlcolors.css?232331sdf", "/stylesheets/codemirror/jscolors.css?12312"],
      path: "/javascripts/codemirror/",
      lineNumbers: true,
      textWrapping: false,

    });

    var sliderCss = CodeMirror.fromTextArea('slider_css', {
      width: "820px",
      height: "700px",
      parserfile: "parsecss.js",
      stylesheet: "/stylesheets/codemirror/csscolors.css?3453",
      path: "/javascripts/codemirror/",
      continuousScanning: 500,
      lineNumbers: true,
      saveFunction: function(){
        $('#slider_css').val(sliderCss.getCode());
        $('form.edit_slider').submit();
      }
    })
    
    $(document).trigger('ajaxify.forms');
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
    $('#submitting').show();
  });

  // show the response (always json)
  $(document).bind('responding', function(e, rsp){
    var status = (undefined == rsp.status) ? 'bad' : rsp.status;
    var msg = (undefined == rsp.msg) ? 'There was a problem!' : rsp.msg;
    $('#submitting').hide();
    $('div.responding').hide();
    $('div.responding.active').remove();
    $('div.responding').clone().addClass('active ' + status).html(msg).show().insertAfter('div.responding');
    setTimeout('$("div.responding.active").fadeOut(4000)', 1900);  
  }); 
});
