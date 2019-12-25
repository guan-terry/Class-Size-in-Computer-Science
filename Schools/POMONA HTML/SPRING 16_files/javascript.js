/*
JICS THEME SCRIPT - ReLiant
*/
/* List of tabs to move to top nav. */
$rolenav = ["Student","Alumni","Instructors","Acad Staff","Staff","Parents","My Pages"];

// Execute on DOM Ready
$(function(){
  $("#errorMessage:empty").remove();
  Tabs();
  hidePipes();
  csPortletHeaders();
  sideBarDropDowns();
  poResizeIFrame();
  poCustomTopNav();
  ShowGECourseSearchLinkInSidebar();
  ShowFinanceLinksInSidebar();
}); 

// Execute on Window Resize
$(window).resize(function(){
  Tabs();
});


/*-------------------Function Definitions----------------------*/

function csPortletHeaders() {
  $('.pHead div').hide();
  // Show Portlet Head icons on mouseover
  $(".pHead").mouseover(function(){$("div",this).show();}).mouseout(function(){$("div",this).hide();});
  // Move edit icon to Portlet Head
  $("div[id*=divEditOrAdd]").each(function(){$(this).appendTo($(this).closest('.portlet').find('.pHead div'));$(this).css({'display':'block','margin':'0 32px 0 0','width':'100px'})});
}

/* This will remove those annoying pipes hard-coded inbetween the footer links */
function hidePipes() {
 var f = $("#policies"); 
 f.html( f.html().replace(/\|/g,"") ); 	
}
function Tabs() {
  csTabOverflow();
  $('#more').mouseenter(function(){showMore();});
  $('#more').mouseleave(function(){hideMore();});
}

function showMore(){
  $('#moreList').css('display','block');
}

function hideMore(){
  $('#moreList').css('display','none');
}

function deleteEmptyTab(){
	var DIV = document.getElementById('headerTabs');
    var LI = DIV.getElementsByTagName('li');
    LI[0].parentNode.removeChild(LI[0]);
}

function csTabOverflow()
{
  try
  {
    //Move all tabs to tab container
    $('#moreList li').each(function(){
      $('#headerTabs ul').append($(this));
    });
    
  	$('#moreList').empty();
	$('#more').remove();
    //Check width and move as needed
    tabTotalWidth = 0;
	var moreList= $('<ul id="moreList" />');
    var flag=0;
	$('#headerTabs ul li').each(function(){
      tabTotalWidth += $(this).width();
	  tabTotalWidth += 30;
      if (tabTotalWidth+100>($('#headerTabs').width()))
      {
		//$(this).removeClass('selected'); //Un-Comment this if you don't want to highlight a drop-down if it's selected.
		moreList.append($(this));
		flag++;
      }
    });
	//Now that we have a UL object that is all full of our overlow tabs, and we've left room for a "MORE" Option, lets append another <li> to the headerTabs UL and then append our newly built submenu to this
	if (flag > 0){
		$('#more').css('display','block');
		$('#headerTabs ul').append("<li id='more'><a>more</a></li>");
 		$('#more').append(moreList);
		$('#moreList').css('display','none');
	}
  } catch(e){}
}
function sideBarDropDowns() {
  if ($('li.currentPage ul').length>0){ 
    $('li.currentPage').prepend('<a id="xpndPrtlts" href="javascript:void(0);" title="View Portlets">view</a>');
    $('#xpndPrtlts').click(function(){
      $('li.currentPage ul').toggle();
      if($('li.currentPage ul').is(':visible')){
        $(this).addClass('expanded');
      }else{
       $(this).removeClass('expanded');      
    }
    });  
    //If portlet is clicked, expand portlet list
    $('li.currentPage ul li a').each(function(){
      if (location.href.indexOf($(this).attr('href'),0)>-1){
        $('li.currentPage ul').show();
        $(this).addClass('selected');
      }else{
     	 $('li.currentPage ul').hide().removeClass('expanded');
      }
    });

  }
}

/* BEGIN POMONA Customs */
function poResizeIFrame()
{
    //nks edits - Provides for autosizing of iframe for look books
    iframe_id = $('iframe[src*="ViewLookbooks.aspx"]').attr('id');
    $('#'+iframe_id).load(function() {
    //window.scrollTo(0,0);
    if($(document).scrollTop() > ($(this).offset()).top) { //if the top of the iframe isn't viewable, scroll to the top of the iframe
        window.scrollTo(0,($(this).offset()).top);	
    }
    setTimeout(function(){iResize()}, 50);
    $( window ).resize(function() {
        iResize();
        });
    });

    function iResize() {
        document.getElementById(iframe_id).style.height = (document.getElementById(iframe_id).contentWindow.document.body.offsetHeight + 50) + 'px';
       //console.log((document.getElementById(iframe_id).contentWindow.document.body.offsetHeight + 50) + 'px')
    }
}

function poCustomTopNav() {
	$('#headerTabs ul li').each(function(el) {
		txt = $.trim($(this).children('a').text());
		if($.inArray(txt, $rolenav) > -1) {$(this).appendTo($('#role-nav ul'));}
		// Get rid of the home tab...
		//if(txt == "Home"){$(this).remove();}
	});
	
	$('#role-nav ul li').each(function(el) {
		txt = $.trim($(this).children('a').text());
		// Get rid of the home tab...
		//if(txt == "Home"){$(this).remove();}
		// Redirect alumni nav link to the alumni page on the public site
		if(txt == "Alumni"){$(this).children('a').attr("href","https://www.pomona.edu/alumni");}
	});	
	
$('<span class="fa fa-compass fa-lg" aria-hidden="true"></span>').prependTo('#youAreHere');	
$('<div id="navWrapper" class="nav-wrapper" style="height:98px"></div>').insertBefore('#header');
$('#header').append("<div id='stickyalias'></div>");
$("#welcomeBackBar").insertBefore("#logo");
$("#top-box").insertBefore("#logo");
$("#headerTabs").insertBefore("#stickyalias");
$("#intro").insertBefore("#headerTabs");
$('#TargetedMessage').insertBefore('#portlets');
$('#mainCrumbs').insertBefore('#errorMessage');
        // Check the initial Poistion of the Sticky Header
        var stickyHeaderTop = $('#header').offset().top;
$('#header').width($('#header').width());
$('#header').prependTo('#navWrapper');

        $(window).scroll(function(){
                if( $(window).scrollTop() > stickyHeaderTop ) {
                        $('#header').css({position: 'fixed', top: '0px' });
                        $('#stickyalias').css('display', 'block');
                } else {
                        $('#header').css({position: 'static', top: '0px'});
                        $('#stickyalias').css('display', 'none');
                }
        });	
}

// This function appends a link to the GE Course Search in the sidebar of specific tabs
function ShowGECourseSearchLinkInSidebar() {
  if (window.location.href.indexOf('/ICS/Student/My_Registration/') > -1 || window.location.href.indexOf('/ICS/Advisors/') > -1 || window.location.href.indexOf('/ICS/Instructors/') > -1) { 
    $('#contextPages').append('<li><a href="/ICS/StaticPages/GeneralEdCourseSearch.aspx" target="_blank">General Education Requirements Course Search</a></li>'); 
  }
}

// This function appends links to Tidemark, Workday and the Finance Office public site in the sidebar of the Finances page
function ShowFinanceLinksInSidebar() {
  if (window.location.href.indexOf('/ICS/Finances/') > -1) { 
    $('#contextPages').append('<li><a href="https://cuc.tidemark.net/" target="_blank">Tidemark</a></li><li><a href="/ICS/Staff/Workday.jnz" target="_blank">Workday</a></li><li><a href="https://www.myworkday.com/theclaremontcolleges/login.flex" target="_blank">Log In to Workday (HCM & Financials)</a></li><li><a href="https://www.pomona.edu/administration/finance-office">Finance Office Web Page</a></li>'); 
  }
}

/* END POMONA Customs */
