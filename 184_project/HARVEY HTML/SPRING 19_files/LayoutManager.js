/// <reference path="Framework.js" />
/// <reference path="Framework.js" />

/**
* Class Page Manager allows us to manipulate the layout of portlets
*/
 (function( LayoutManager, $) {

   LayoutManager.draggableSelector;
   LayoutManager.listContainerSelector;

   LayoutManager.PageLayout;
   LayoutManager.Globalization;
     
            
   LayoutManager.HTML = {};
   LayoutManager.HTML.ColumnWrapper             = "<div class=\"pColumn pColumn{0} container\"></div>";
   LayoutManager.HTML.DraggableBar              = "<div class='{0}'><p>{1}</p></div>";
   LayoutManager.HTML.DraggableListWrapper      = "<ul class='{0}'></ul>";
   LayoutManager.HTML.DraggableListItemWrapper  = "<li  portletID='{0}' class='{1}'></li>";
   LayoutManager.HTML.DraggableEmptyListWrapper = "<ul class='{0} {1}'></ul>";
   LayoutManager.HTML.ErrorWrapper              = "<span class=\"rearrange error\"> {0}</span>";
   LayoutManager.HTML.DraggableTitleWrapper     = "<label id='{0}' class='{1}'>{2} Or <a href=\"javascript:__doPostBack('{3}','')\"> use this window</a> to rearrange without dragging.</label>";
   LayoutManager.HTML.DraggableTitleWrapper     = "<span id='drag-title' class='drag-title'>{0}</span>";
   LayoutManager.HTML.DraggableLinkWrapper = "<a id='{0}'>{1}</a>";
   LayoutManager.HTML.DraggableButtonWrapper = "<input id='{0}' type=\"submit\" value=\"{1}\"></input>";
   
   LayoutManager.AccesibilityPopup = (function ($) {
       // private variables
       var pageLayout,
           show,
           config,
           buildHtml,
           globalizer,
           moveAllToSelect,
           getPortletPositions,
           selectedOptionsOtherThen;


       moveUpItem = function(optionsList) {
           $(optionsList).find(":selected").each(function() {
               $(this).insertBefore($(this).prev());
           });
       };

       moveDownItem = function(optionsList) {
           $(optionsList).find(":selected").each(function() {
               $(this).insertAfter($(this).next());
           });
       };

       selectedOptionsOtherThen = function (exludingList) {
           //TODO: to restrict the selection withing the AccessibilityPopup
           return $("#AccessiblityPopup select").filter(function(list) {
               return $("#AccessiblityPopup select")[list] != exludingList;
           }).find(":selected");
       };

       moveAllToSelect = function (optionsList) {
           var itemstToMove = selectedOptionsOtherThen(optionsList);
           // move the options to the new list. 
           $(itemstToMove).remove().appendTo(optionsList);
           // clear selections
           $(optionsList).val('');
       };

       getPortletPositions = function () {
           var newPostions = [];
           try {

               $("#AccessiblityPopup select").each(function (columnIndex, value) {
                   $(value).find("option").each(function (rowIndex, value) {
                       newPostions.push(
                           {
                               "PageID": PageInfo.PageID,
                               "PortletID": $(value).attr("value"),
                               "ColumnNumber": columnIndex + 1,
                               "Order": rowIndex + 1
                           });
                   });
               });
           } catch (error) {
               LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_GET_POSITIONS, error);
           }
           return newPostions;
       };
       
       buildHtml = function () {
           
           var columnHtmlItem, 
               popupContainer,
               columnshtmlList,
               portletPositionHTMLOption;

           //private functions
           popupContainer =
               "<div ID=\"AccessiblityPopup\">"
                + "<div id=\"closePopup\" class=\"modalHeadingImg\"></div>"
                + "<span class=\"title\">" + globalizer.txT_ADMIN_PAGE_REARRANGE + "</span>"
                + "<span class=\"title-description column" + pageLayout.columnsInfo.length+ "\">" + globalizer.txT_PAGE_CHANGE_LAYOUT_REARANGE_TITLE + "</span>"
                + "<div class=\"Content\">"
                + "<ul class=\"layoutColumn\">{0}</ul>"
                + "</div>"
                + "<div style=\"clear:both\"></div>"
                + "<div id=\"CP_V_modalbuttons\" class=\"modalButtons\">"
                + "<div class=\"saveButtonContainer\">"
                + "<input type=\"submit\"  value=\"" + globalizer.txT_SAVE_CHANGES + "\">"
                + "</div>"
                + "<div class=\"cancelButtonContainer\">"
                + "<input type=\"submit\" value=\"" + globalizer.txT_PAGE_CHANGE_LAYOUT_CANCEL + "\">"
                + "</div>"
                + "</div>"
                + "<a id=\"closePopupLink\" class=\"closeLInk\">" + globalizer.txT_PAGE_OPTIONS_CLOSE_POPUP_BUTTON + "</a>"
              + "</div>";
           
           portletPositionHTMLOption = "<option value=\"{0}\">{1}</option>";

           columnHtmlItem = "<li>"
               +"<div>"
               + "<div class=\"optionContainer\">"
               + "<span class=\"{0}\">"
               + "<span class=\"icon\"></span>"
               + "</span>"
               + "</div>"
               + "<label id=\"accesibilitySelectLayout{2}\" style=\"display: none;\" for=\"layoutselect{2}\">Select Layout</label>"
               + "<select id=\"layoutselect{2}\" size=\"5\" multiple=\"multiple\">"
               +"{1}"
               + "</select>"
               + "<div class=\"orderSelector\">"
               + "<a class=\"upButton\"><span class=\"icon\"></span></a>"
               + "<a class=\"downButton\"><span class=\"icon\"></span></a>"
               + "</div>"
               + "</div>"
               + "</li>";
           
           columnshtmlList = [];
           $(pageLayout.columnsInfo).each(function (i, columnInfo) {
               //TODO: for each portlet in the column
               // add the option in the selection container. 
               var listOption = [];
               $(pageLayout.positions.filter(function(position) { return position.columnNumber === (i+1); }))
                   .each(function (i, e) {
                       listOption.push(window.stringUtil.format(portletPositionHTMLOption, e.portletID, e.displayName));
                   });
               columnshtmlList.push(window.stringUtil.format(columnHtmlItem, columnInfo.editCssClass,$("<p>").append(listOption).html(),i+1));
           });
           
           return window.stringUtil.format(popupContainer, $("<p>").append(columnshtmlList.join('')).html());
           
       };
       var bindHandlers = function () {
           $(".saveButtonContainer").find("input").click(function () {
               var url = urlUtil.getAppRoot() + 'api/Layout';
               try {
                   $.ajax({
                       type: "post",
                       url: url,
                       data: { "Positions": getPortletPositions() },
                       success: function (data) {
                           //TODO: get the positions from the response from the server, rather then making a totally new request. 
                           LayoutManager.GetLayout(function () {
                               $(this).parents().find('#AccessiblityPopup').dialog("close");
                               window.location.href = window.PageInfo.PageURL;
                           });
                       },
                       error: function (xhr, status, error) {
                           LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_FAILED_TO_SET_POSITIONS, xhr.responseText);
                       }
                   });
               } catch (error) {
                   LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_FAILED_TO_SET_POSITIONS, error);
               }
           });
           
           $("[class*=accessibility]").click(function () {
               var optionsList = $(this).parent().parent().find("select").get(0);
               moveAllToSelect(optionsList);
           });
           
           $(".orderSelector").find(".upButton").click(function() {
               moveUpItem($(this).parent().parent().find("select").get(0));
           });
           
           $(".orderSelector").find(".downButton").click(function() {
               moveDownItem($(this).parent().parent().find("select").get(0));
           });
       };
       config = function(layoutInfo,glob) {
           pageLayout = layoutInfo;
           globalizer = glob;
       };
       
       show = function () {
         
           $(buildHtml()).dialog(
            {
             autoOpen: true,
             resizable: false,
             height: "auto",
             width: "auto",
             position: { my: 'center', at: 'center', of: window },
             modal: true,
             dialogClass: 'PageOptionsPopup',
             close: function () {
                 $(this).dialog('destroy');
               //  if ($('#accessibilityLink')) {
               //      $('#accessibilityLink').unbind();
               //  }
             },
             open: function (data) {
                 bindHandlers();
                 $(".cancelButtonContainer").find("input").click(function () {
                     $(this).parents().find('#AccessiblityPopup').dialog("close");
                 });
                 $(data.target).find("#closePopup").click(function () {
                     $(this).parents().find('#AccessiblityPopup').dialog("close");
                 });

                 $(data.target).find('.closeLInk').click(function () {
                     $(this).parents().find('#AccessiblityPopup').dialog("close");
                 });
             }
         });
       };

       // public public functions
       return {
           Show: show,
           Config: config
       };
   }($));
   
           
   LayoutManager.Error = {};
   LayoutManager.Error.Publish = function (message,data) {
       $(window.stringUtil.format(LayoutManager.HTML.ErrorWrapper, message)).insertBefore("#pageTitle");
       // will get reported on the error console of the browser. 
       throw new Error(message + $(data));
   };
     
    // These are internal names to the Layout Manager, used to manage the Drag/Drop. 
    var listItemClassName = "rePositionItem";
    var listClassName     = "dragList";
    var dragBarClassName  = "dragBar";

    /***********************************************************************/
    /* start private methods                                               */
    /***********************************************************************/
     
    /**
    * Disable all the child controls of the selector.
    *@param {string} the selector which child controls need to be disabled.
    */
    var disableAllControls = function (selector) {

        try {
            $(".pShortcut").hide();
            $(selector + ">.pHead>div").hide();
            $(selector).addClass("drag-Content");
            $(selector).find('*').attr('disabled', true);
            $(selector + ">.pHead").addClass("drag-header");
            $(selector).find('a').click(function (e) { e.preventDefault(); });
            $(selector).children().filter(function () { return !$(this).hasClass("pHead"); }).addClass("drag-disable");
        } catch(error) {
            LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_DISABLE_CONTROLS, error);
        }
    };

    var updateGlobalization = function () {
        var url = urlUtil.getAppRoot() + 'api/Globalization/rearrange';
         $.ajax({
             type: "get",
             async:false,
             url: url,
             dataType: "json",
             success: function (globalizationObject) {
                 LayoutManager.Globalization = globalizationObject;
             },
             error: function (xhr, status, error) {
                 LayoutManager.Error.Publish("Failed to get the Globalization values from Server.", xhr.responseText);
             }
         });
     };
     /**
    * Enable all the child controls of the selector.
    *@param {string} the selector which child controls need to be disabled.
    */
    var enableAllControls = function (selector) {
        try {
            $(".pShortcut").show();
            $(selector + ">.pHead>div").show();
            $(selector).find('a').unbind('click');
            $(selector).removeClass("drag-disable");
            $(selector).find('*').attr('disabled', false);
            $(selector + ">.pHead").removeClass("drag-header");
            $(selector).children().filter(function () { return !$(this).hasClass("pHead"); }).removeClass("drag-disable");
        } catch (error) {
            LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_ENABLE_CONTROLS, error);
        }
     };

    var normalizeColumns = function () {
        try {

            $("#PORTLETGRID").attr("class", LayoutManager.PageLayout.cssClass);
            //TODO: get the index of the empty column that is not rendered by the server. 
            if (LayoutManager.PageLayout.emptyColumnIndexs != undefined && LayoutManager.PageLayout.emptyColumnIndexs.length > 0) {
                $(LayoutManager.PageLayout.emptyColumnIndexs).each(function (rowIndex, value) {
                    LayoutManager.createColumnAt(value);
                });
            }
        } catch (error) {
            LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_EMPTY_COLUMN, error);
        }
    };
     
     /***********************************************************************/
     /* start public methods                                                */
     /***********************************************************************/
     
     /**
     * Get the positions for the portlets. 
     */
    LayoutManager.getPortletPositions = function () {
        var newPostions = [];
        try {
            
            var portletIDAttribute = "portletid";

            $(LayoutManager.listContainerSelector).each(function (columnIndex, value) {
                $(value).find(".dragList").children("li").each(function (rowIndex, value) {
                    newPostions.push(
                        {
                            "PageID": PageInfo.PageID,
                            "PortletID": $(value).attr(portletIDAttribute),
                            "ColumnNumber": columnIndex + 1,
                            "Order": rowIndex + 1
                        });
                });
            });
        } catch (error) {
            LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_GET_POSITIONS, error);
        }
        return newPostions;
     };
     
    /**
    * Makes the given selectors draggable, by wrapping the container around. 
    * the controls of interests. 
    */
     LayoutManager.CreateList = function() {
         try {
             var listSelector = "." + listClassName;
             var emptyClassName = "empty-List";
             
             //we have to set the scope of the variable in this function so that we can use them in the event handlers. 
             var draggableSelector = this.draggableSelector;
             var portletPositions = LayoutManager.PageLayout.positions;
             //order of call matters here, because the framework, will just change the layout 
             // if it sees empty columns. 
             // we need to normalize the layout based on the specs so that user can edit at will.
             normalizeColumns();
             disableAllControls(this.draggableSelector);
             
             //TODO: Refactor this code to a simpler method. 
             // wrap all the portlets with a list based on the available columns we have. 
             $(this.listContainerSelector).each(function (columnindex, value) {
                 
                 //We are wrpping all portlets in a column with a list which we use to manage drag and drop
                 //we also need to handle the case when the column is empty. 
                 if ($(this).children().length > 0)
                     $(this).children().wrapAll(window.stringUtil.format(LayoutManager.HTML.DraggableListWrapper, listClassName));
                 else
                     $(this).append(window.stringUtil.format(LayoutManager.HTML.DraggableEmptyListWrapper, listClassName, emptyClassName));

                 $(this).find(draggableSelector).each(function (rowIndex, value) {

                     // we are finding the meta data so that we can tell later the server the portlets that need to be updated. 
                     var portletPosition = $.grep(portletPositions, function(data, key) {
                          return data.columnNumber == columnindex + 1 && data.order == rowIndex + 1;
                     });
                     var portletID = portletPosition.length > 0 ? portletPosition[0].portletID : "";

                     // we are wrapping the portlets with List Item element which will be draggable. 
                     var repositioningDiv = window.stringUtil.format(LayoutManager.HTML.DraggableListItemWrapper, portletID, listItemClassName);
                     var dragMessage = window.stringUtil.format(LayoutManager.HTML.DraggableBar, dragBarClassName, LayoutManager.Globalization.msG_DRAG_DROP);

                     $(this).wrap(repositioningDiv);
                     $(dragMessage).insertAfter($(this).find(".pHead"));
                 });
             });

             LayoutManager.WrapDraggableList(listSelector);
         } catch (error) {
             LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_CREATE_LIST, error);
         }
     };
     
     /**
     *Add an empty column in the document based on the current positions. 
     *@param {int} The index to insert the empty column.
     */
     LayoutManager.createColumnAt = function (index) {
         
         //TODO: find out the column number that is empty
         // insert it before the column with the same index. If the column number is larger then the 
         // length of the selection then add it to the document. 
         var columnSelector = LayoutManager.listContainerSelector;
         var columns = $(columnSelector);
         var column = window.stringUtil.format(LayoutManager.HTML.ColumnWrapper, index);
         
         
         if (index > columns.length) {
             $(column).insertAfter(columns.last());
         } else {
             $(column).insertBefore(columns.get(index-1));

             //shift the rest of the items 
             $(columnSelector + ":gt(" + (index - 1) + ")").each(function (rowIndex, value) {
                 
                 var currentIndex = rowIndex + index;
                 var incrementedIndex = rowIndex + index + 1;

                 var currentAttributeName = "pColumn" + currentIndex;
                 var newAttributeName = "pColumn" + incrementedIndex;
                 
                 var incrementedColumnName = value.getAttribute("class").replace(currentAttributeName, newAttributeName);
                 $(value).attr("class", incrementedColumnName);
             });
         }

     };

     //TODO: update this method to use a commen deff of ajax. 
     LayoutManager.GetLayout = function (successCallback) {
         try {
             if (LayoutManager.Globalization == undefined) {
                 updateGlobalization();
             }
             var url = urlUtil.getAppRoot() + 'api/Layout';
             //only post for the list which is receiving the item. 
             $.ajax({
                 type: "get",
                 url: url,
                 dataType: "json",
                 data: { "pageID": PageInfo.PageID },
                 success: function (data) {
                     LayoutManager.PageLayout = data;
                     if (successCallback != undefined) successCallback();
                 },
                 error: function (xhr, status, error) {
                     LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_FAILED_TO_GET_POSITIONS, xhr.responseText);
                 }
             });
         } catch (error) {
             LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_GET_LAYOUT, error);
         }
     };
     
     //TODO:use a common ajax method. 
     LayoutManager.UpdatePositions = function () {
         try {
             var url = urlUtil.getAppRoot() + 'api/Layout';
             $.ajax({
                 type: "post",
                 url: url,
                 data: { "Positions": LayoutManager.getPortletPositions() },
                 success: function (data) {
                     //TODO: get the positions from the response from the server, rather then making a totally new request. 
                     LayoutManager.GetLayout(function () {
                         window.location.href = window.PageInfo.PageURL;
                         //document.location.reload(false);
                     });
                 },
                 error: function (xhr, status, error) {
                     LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_FAILED_TO_SET_POSITIONS, xhr.responseText);
                 }
             });
         } catch (error) {
             LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_FAILED_TO_SET_POSITIONS, error);
         }
     };
     
     LayoutManager.WrapDraggableList = function (listSelector) {
         try {
             
             var listItemSelector = "." + listItemClassName;
             var emptyListClassName = "empty-List";
             
             //setup the drag and drop lists 
             $(listSelector).sortable({
                 revert: true,
                 connectWith: listSelector,
                 placeholder: "ui-state-highlight",
                 //when done dragging see if we are on an empty list. 
                 stop: function (event, ui) {
                     if ($(event.target).children(listItemSelector).length == 0)
                         $(event.target).addClass(emptyListClassName);
                     else
                         $(event.target).removeClass(emptyListClassName);
                 },
                 //when we are dropped an item we are not empty list anymore. 
                 receive: function (event, ui) {
                     $(event.target).removeClass(emptyListClassName);
                 },
                 // when an item starts to be dragged out, check if we need are gone become empty list or not. 
                 activate: function (event, ui) {
                     if ($(ui.sender).children(listItemSelector).length == 1 || $(ui.sender).children(listItemSelector).length == 0) $(ui.sender).addClass("empty-List");
                 }
             }).disableSelection();
         } catch (error) {
             LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_WRAP_PORTLETS, error);
         }
     };
     
     /**
     * Remove the draggable item list 
     */
     LayoutManager.RemoveList = function () {
         try {
             var listSelector = "." + listClassName;
             var listItemSelector = "." + listItemClassName;
             var dragBarSelector = "." + dragBarClassName;

             $(listItemSelector).unwrap();
             $(this.draggableSelector).unwrap();
             $(listSelector).children().filter(listSelector).children().filter(dragBarSelector).remove();
             enableAllControls(this.draggableSelector);
         } catch (error) {
             LayoutManager.Error.Publish(LayoutManager.Globalization.msG_ERROR_REMOVE_LIST, error);
         }
    };
 } ( window.LayoutManager = window.LayoutManager || {}, jQuery ));
 

 
     
//TODO: refactor this to something more encapsulated. 
 $(function() {
     
     var ShowRearrange = function () {
         LayoutManager.draggableSelector = ".portlet";
         LayoutManager.listContainerSelector = ".pColumn";
         $("#adminBar_pageLayoutLink").hide();
         $('#adminBar_pageOpenMoxieManager').hide();
         $("#adminBar_pageSettingLink").hide();
         $("#adminBar_pageOptionsLink").hide();
         $("#adminBar_pageAccessLink").hide();
         $("#adminBar_pageRearangeLink").hide();
         $('#adminBar_pageOpenMoxieManager').hide();

         LayoutManager.GetLayout(function () {
             LayoutManager.CreateList();
         });
         
         //TODO: how to use glottalization service 
         $("#adminBar_pageRearangeLink").parent().addClass("drag-menu");
         $(".adminMenu>.settingsMenu").addClass("drag-menu");
         
         var dragTitle = window.stringUtil.format(LayoutManager.HTML.DraggableTitleWrapper,
                         LayoutManager.Globalization.msG_MENU_DRAG_DROP
                         + window.stringUtil.format(LayoutManager.Globalization.msG_DRAG_TITLE,
                         "<a id=\"accessibilityLink\" >", "</a>"));

         var dragCancelLink = window.stringUtil.format(LayoutManager.HTML.DraggableLinkWrapper, "cancelRearange", LayoutManager.Globalization.msG_DRAG_DROP_LINK_CANEL);
         var dragSaveLink = window.stringUtil.format(LayoutManager.HTML.DraggableButtonWrapper, "saveRearange", LayoutManager.Globalization.msG_DRAG_DROP_LINK);
         
         $(dragCancelLink).insertAfter($("#adminBar_pageRearangeLink"));
         $(dragSaveLink).insertAfter($("#adminBar_pageRearangeLink"));
         $(dragTitle).insertAfter($("#adminBar_pageRearangeLink"));
         
         $("#saveRearange").click(function () {
             CloseRearrange($("#adminBar_pageRearangeLink"));
         });
         
         $("#accessibilityLink").click(function () {
             window.LayoutManager.AccesibilityPopup.Config(window.LayoutManager.PageLayout, LayoutManager.Globalization);
             window.LayoutManager.AccesibilityPopup.Show();
         });
         $("#cancelRearange").click(function () {
             window.location.href = window.PageInfo.PageURL;
         });
         clicked = true;
     };
     var CloseRearrange = function (object) {

         LayoutManager.UpdatePositions();
         LayoutManager.RemoveList();
         $("#adminBar_pageLayoutLink").show();
         $('#adminBar_pageOpenMoxieManager').show();
         $("#adminBar_pageOptionsLink").show();
         $("#adminBar_pageSettingLink").show();
         $("#adminBar_pageAccessLink").show();
         $('#adminBar_pageOpenMoxieManager').show();
         $("#cancelRearange").remove();
         $("#saveRearange").remove();
         $("#drag-title").remove();
         
         object.parent().removeClass("drag-menu");
         object.text(LayoutManager.Globalization.msG_DRAG_DROP_LINK_NORMAL);
         clicked = false;
     };
     var getParameterByName = function(name) {
                                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                                results = regex.exec(location.search);
                                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
     };
     
    //TODO: check the page info object for the status
    // then if it is customizing then add a link 
     if (typeof window.PageInfo !== 'undefined' && (typeof window.PageInfo !== 'undefined' && (getParameterByName("Rearrange") == "" || window.PageInfo.IsCustomizing == "True" || window.PageInfo.IsShowingPortlet == "True"))) {
         
         $("#adminBar_pageRearangeLink").unbind();
         $("#adminBar_pageRearangeLink").attr("href", window.PageInfo.PageURL + "?Rearrange=true");
         $(".rearrangePages").attr("href", window.PageInfo.PageURL + "?Rearrange=true");
      } else {
          var clicked = false;
          if (getParameterByName("Rearrange") == "true") {
               ShowRearrange();
          }
          $("#adminBar_pageRearangeLink").click(function () {
              var rearrange = $(this);
              if (clicked) { CloseRearrange($(this)); }
               else {ShowRearrange();}
            });
        }
 });