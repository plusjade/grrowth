;$(document).ready(function(){
  var loading = '<div class="loading">Loading...</div>';
  $hProfile = $('#the-workspace div.working-profile');
  $hAssets  = $('#the-workspace div.working-assets');
  $wAssets  = $('#facebox div.working-assets'); // define first.
  $wProfile = $('#facebox div.working-profile'); // define first.
  
  // activate tab navigation
  $('ul#main-tabs li a').click(function(){
    $('div.tab-content').hide();
    $('ul#main-tabs li a').removeClass('active');
    $(this).addClass('active');
    $('div#'+ $(this).attr('rel')).show();
    return false;
  });

/* refresh resources
----------------------------------- */

  // refresh artist resources container
  $('a#refresh-artists').click(function(){
    $('div#artists-wrapper').html(loading);
    $.getJSON(this.href, function(rsp){
      $('div#artists-wrapper').empty();
      $('ul#artists-list').empty();
      if(0 == rsp.length){
        $('div#artists-wrapper').html('No artists found.');
        return false;
      }
      var artistHtml = '';
      var artistList = '';
      $.each(rsp, function(){
        this.artist.src = getFirstImage(this.artist.assets);
        artistHtml += artistsTemplate(this.artist);
        artistList += '<li><a href="/artists/' + this.artist.id + '/tattoos">' + this.artist.name + '</a></li>';
      });
      $('div#artists-wrapper').html(artistHtml);
      $('ul#artists-list').html(artistList);
            
      $(document).trigger('draggableProfiles');
    });
    return false;
  });
 
  // refresh asset resources container
  $('a#refresh-assets').click(function(){
    $('ul#assets-wrapper').html(loading);
    $.getJSON(this.href + '.json', function(rsp){
      $('ul#assets-wrapper').empty();
      var assetsHtml = '';
      $.each(rsp, function(){
        assetsHtml += assetsReTemplate(this.asset);
      });
      $('ul#assets-wrapper').html(assetsHtml);
      $(document).trigger('draggableAssets');
    });
    return false;
  });

   
/* click delegations
----------------------------------- */
  $('body').click($.delegate({

   // refresh and load tattoo resources.  
    'a#refresh-tattoos, ul#artists-list li a' : function(e){
      $('ul#artists-list li a').removeClass('active');
      $(e.target).addClass('active');
      $('ul#tattoos-wrapper').html(loading);
      $.get(e.target.href + '.json',function(rsp){
        $('ul#tattoos-wrapper').empty();
        if(0 == rsp.length){
          $('ul#tattoos-wrapper').html('No tattoos found.');
          return false;
        }
        var tattoosHtml = '';
        $.each(rsp, function(){
          this.tattoo.src = getFirstImage(this.tattoo.assets);
          tattoosHtml += tattoosTemplate(this.tattoo);
        });
        $('ul#tattoos-wrapper').html(tattoosHtml);
        $(document).trigger('draggableProfiles');
      });
      return false;
    },

   // new profiles via facebox
    'a.new-profile' : function(e){
	    $hAssets.empty();
	    $hProfile.empty();
	    $('a.show-details').hide();
	    
      $.facebox(function() {
        $('.working-details').html(loading); 
        $.get(e.target.href, function(view){
          $('.working-details').html(view);
          $(document).trigger('ajaxify.form');
        });      
         $.facebox({ div: '#the-workspace' }, 'workspace-wrapper');
      });         
      return false;
    },
    
   // edit profiles via facebox
    '.drag-profile img, .shop-each img' : function(e){
      var profile = $(e.target).attr('id');
	    if(undefined == profile){alert('profile id was not found'); return false};
	    profile = profile.split('_');
	    $hAssets.empty();
	    $hProfile.empty();
	    $('a.show-details').show();
	    $(e.target).clone().appendTo($hProfile);
      $.facebox(function() { 
        $.getJSON('/' + profile[0] + '/' + profile[1] + '.json', function(rsp) {
          var assetsWHtml = '';
          $.each(rsp[profile[0].slice(0, -1)].assets, function(){
            assetsWHtml += assetsWorkTemplate(this);
          });
          $hAssets.html(assetsWHtml);
          $.facebox({ div: '#the-workspace' }, 'workspace-wrapper');
        })       
      });
      return false;
    },
       
   // "save" profile resource.
    'a.save-profile' : function(e){
      // save the data
      if( 0 < $('div.working-details form').length ){
        $('div.working-details form').submit();
      }
      var profile = getProfile()
      if(profile) saveAssets(profile);
      return false;
    },
   
   // "show details" of the working profile resource.
    'a.show-details' : function(e){
      var profile = getProfile(); if(!profile) return false;
      $('#facebox div.working-details').html(loading);
      $.get('/' + profile[0] + '/' + profile[1] + '/edit',
        function(view){
          $('#facebox div.working-details').html(view);
          $(document).trigger('ajaxify.form');
        });
      return false;
    },
  
    // hide the asset panel
    "div.asset-panel a.toggle": function(e){
      toggleImagePane();
      return false;
    },
    
    'div.asset-panel .actions a.show' : function(e){
      toggleImagePane('open');
      $('div.asset-content').hide();
      $(e.target.hash + '-tab').show();
      return false;
    },    
    
   // disable clicking on tattoo profiles.
    'ul#tattoos-wrapper a' : function(e){
      return false;
    }
           
  }));


/* bindings 
------------------------------- 
------------------------------- */

  // make working assets sortable 
  // * droppable is handled by connectToSortable
  $(document).bind('wAssetsSortable', function(){
    $wAssets.sortable({
      items: 'img',
      forceHelperSize: true,
      forcePlaceholderSize: true,
      placeholder: 'sortable-placeholder',
      receive: function(event, ui) {
        $('img', $wAssets).addClass('is-working');
      }
    })
  });  

  // make super-trashcan droppable
  $(document).bind('superTrash', function(){
    $('td.super-trash').droppable({
      accept: '.drag-profile, .drag-asset',
      activeClass: 'ui-state-highlight',
      hoverClass: 'drophover',
      tolerance: 'touch',
      drop: function(e, ui){
        // if working images
        if( $(ui.draggable).hasClass('drag-asset') && $(ui.draggable).hasClass('is-working') ){
          if($(ui.draggable).hasClass('is-new')){
            $(ui.draggable).remove();
            return;
          }
          var profile = getProfile();
          var asset = $(ui.draggable).attr('id').split('_');
          $.getJSON('/' + profile[0] + '/' + profile[1] + '/detach',
            {asset: asset[1]},
            function(rsp){
              $(document).trigger('responding', rsp);
              $(ui.draggable).remove();
          });
          return;
        } 
            
        // if DELETE profiles or assets
        if($(ui.draggable).hasClass('drag-profile')){
          var profile = $('img:first',$(ui.draggable)).attr('id');
        }else if($(ui.draggable).hasClass('drag-asset')){
          var profile = $(ui.draggable).attr('id');
          $(ui.draggable).parent().remove();
        }
        profile = profile.split('_');
        $.ajax({
          type: 'DELETE',
          dataType:'json',
          url: '/' + profile[0] + '/' + profile[1],
          beforeSend: function(){
            if(!confirm('Sure you want to delete?')) return false;
            $(document).trigger('submitting');
          },
          success: function(rsp){
            $(document).trigger('responding', rsp);
            $(ui.draggable).remove();
            $(ui.helper).remove();
          }
        }) 
        return;
      }
    })
  });  

  // make asset resources draggable
  $(document).bind('draggableAssets', function(){
    $("ul#assets-wrapper li img").draggable({
      appendTo: 'body',
      cursorAt: {top:30, left:30},
      stack: "ul#assets-wrapper li img",
      zIndex: 999999999,
      addClasses: false,
      helper: 'clone',
      connectToSortable: '#facebox div.working-assets',
      start: function(e, ui){$wAssets.addClass('ui-state-highlight')},
      stop: function(e, ui){$wAssets.removeClass('ui-state-highlight')}
    });
  });

  // make artist/tattoo resources draggable.  
  $(document).bind('draggableProfiles', function(){
    $(".drag-profile").draggable({
      appendTo: 'body',
      handle: 'img',
      stack: ".drag-profile",
      zIndex: 2700,
      revert: true
    });  
  }); 
      
  // ajaxify the forms
  $(document).bind('ajaxify.form', function(){
    $('form').ajaxForm({
      dataType : 'json',     
      beforeSubmit: function(fields, form){
        if(! $("input", form[0]).jade_validate() ) return false;
        $('button', form[0]).attr('disabled','disabled').removeClass('positive');
        $(document).trigger('submitting');
      },
      success: function(rsp) {
        if(undefined != rsp.created){      
          $('#facebox form').clearForm();
          saveAssets([rsp.created.resource, rsp.created.id]);
          $('a#refresh-' + rsp.created.resource).click();
          $wAssets.empty();
        }
        $(document).trigger('responding', rsp);
        $('form button').removeAttr('disabled').addClass('positive');
      }
    });
  });

  // facebox reveal callback  
  $(document).bind('reveal.facebox', function(){
    $wAssets  = $('#facebox div.working-assets');
    $wProfile = $('#facebox div.working-profile');
    $(document).trigger('wAssetsSortable');
    $(document).trigger('ajaxify.form');
  });

  // facebox close callback
  $(document).bind('close.facebox', function() {
  	$hAssets.empty();
	  $hProfile.empty();
	  $('.working-details').empty();
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


/* resizing functions */
  $(window).resize(function() {
    var height = $('div.asset-panel').hasClass('open') ? 300 : 32;
    $('div.asset-panel').css('top', $.getPageHeight()- height);
  });
  /*
  $(window).scroll(function(){
    var height = $('div.asset-panel').hasClass('open') ? 300 : 32;
    $('div.asset-panel').css('top', $.getPageHeight()- height);  
  });  
  */
  
}); //end

/* helper functions 
------------------------------- */

/* toggleImagePane
 * @param force: String - force open or close
 */ 
function toggleImagePane(force){
  if('open' == force || $('div.asset-panel').hasClass('closed')){
    $('div.asset-panel').css('top', $.getPageHeight()- 300).removeClass('closed').addClass('open');
    $('div.asset-panel a.toggle').show();
    return;
  }
  if('close' == force || $('div.asset-panel').hasClass('open')){
    $('div.asset-panel').css('top', $.getPageHeight()- 32).removeClass('open').addClass('closed');
    $('div.asset-panel a.toggle').hide();
    return;
  }
};

/* return the resource type and id or false
 * @return Array or false 
 */    
function getProfile(){
  var profile = $('img', $wProfile).attr('id');
  if(undefined == profile) return false;
  return profile.split('_');
};

/* return the correct first image of a profile's album
 */ 
function getFirstImage(assets){
  return (assets.length <= 0)
    ? '/images/no-image.gif'
    : '/system/datas/' + assets[0].id +'/thumb/'+ assets[0].data_file_name;    
}; 
  
/* collect and save any new working assets
 * @param profile = Array [type, id]
 * TODO: add positioning.
 */
function saveAssets(profile){
  var ids = [];
  $("img.is-new", $wAssets).each(function(){
    ids.push(this.id.split('_')[1]);
  });
  if(ids.length <= 0){
    //$(document).trigger('responding', {msg:'No new images in the workspace', status:'warn'});
    return false;
  }    
  $(document).trigger('submitting');
  $.getJSON('/' + profile[0] + '/' + profile[1] + '/attach',
    $.param({asset: ids}),
    function(rsp){
      $(document).trigger('responding', rsp);
      if('good' == rsp.status)
        $("img.is-new", $wAssets).removeClass('is-new');
  })
};

