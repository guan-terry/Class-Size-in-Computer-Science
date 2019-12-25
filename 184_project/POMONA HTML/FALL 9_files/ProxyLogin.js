// jQuery document ready event will kick off the JavaScript for the view.
// If there are more than one jQuery ready functions on the page, all will fire.
jQuery(document).ready(function () {
    bcProxyLoginPortlet.init();
});

// Below "objects" utilize namespacing and isolated use of jQuery $.

(function (bcpl, $) {

    bcpl.init = function () {
        if ($('#bcPLUserName').length > 0 || $('#bcPLSidebarUsername').length > 0 || $('#bcPLShowLSRValues').length > 0)
            bcProxyLoginService.getGlobalizedText(fullinit);
    };

    bcpl.GlobalizedText = {};
    function fullinit(globalized) {
        bcpl.GlobalizedText = globalized.d;
        if ($('#bcPLUserName').length > 0) {
            bcProxyLoginService.isAdmin(function(data) {
                if (data.d == true) { 

                    bcProxyLoginLogsView.init();
                    bcProxyLoginConfigureView.init();
                    bcProxyLoginPermissionsView.init();

                    $('#bcPLTabBar ul li').on('click', function() {
                        if ($(this).hasClass('tabSelected'))
                            return;
                        bcpl.displayView($(this).data('view'));
                    });
                    window.onbeforeunload = function() {
                        if ($('#bcPLSave').length > 0 && $('#bcPLSave').attr('disabled') != 'disabled') {
                            return bcProxyLoginPortlet.GlobalizedText.unsavedSettings;
                        }

                        if ($('#bcPLSave').length > 0 && $('#bcPLSavePermissions').attr('disabled') != 'disabled') {
                            return bcProxyLoginPortlet.GlobalizedText.unsavedPermissions;
                        }
                        return undefined;
                    };

                    //$('#bcPLTabBar').show("slide", { direction: 'up', easing: 'easeOutQuad' }, 1000);
                    $('#bcPLTabBar').show();
                }
            });
            bcpl.displayView("Default");
        }
        if ($('#bcPLSidebarLoginBtn').length > 0)
            bcProxyLoginSidebar.init();
        if ($('#bcPLShowLSRValues').length > 0)
            $('#bcPLShowLSRValues').on('click', function () {
                $(this).attr('disabled', true);
                bcProxyLoginService.getLSRValues(showLsrValues);
            });
        

    };

    bcpl.displayView = function (viewname) {
        $('#bcPLTabBar ul').children().removeClass('tabSelected');
        $('#bcPLTabBar ul li[data-view="' + viewname + '"]').addClass('tabSelected');
        $('#divViewContainer').children().hide();
        $('#bcPL' + viewname + "View").show();

        switch (viewname) {
            case "Default":
                bcProxyLoginDefaultView.init();
                break;
            case "Configure":
                bcProxyLoginConfigureView.init();
                break;
            case "Permissions":
                bcProxyLoginPermissionsView.init();
                break;
            case "Logs":
                bcProxyLoginLogsView.init();
                $('#logList').dataTable().fnAdjustColumnSizing();
                break;
        }
    };

    bcpl.showLoginFailure = function(event) {
        $('body').append($('<div></div>').attr('id', 'bcPLFailedLoginDiv')
            .append($('<table><thead></thead><tbody></tbody></table>').attr('id', 'bcPLFailedLoginTable'))
            .append($('<br />'))
            .append($('<span></span>').html(bcProxyLoginPortlet.GlobalizedText.permissiveExplanation)));

        $('#bcPLFailedLoginTable thead, #bcPLFailedLoginTable tbody').empty();
        $('#bcPLFailedLoginTable thead').append($('<tr></tr>').append($('<th></th>')).append($('<th></th>').html(bcProxyLoginPortlet.GlobalizedText.theirRoles).attr('colspan', 3)));
        $('#bcPLFailedLoginTable thead').append($('<tr></tr>'));

        var firstSet = true;
        $.each(event.data.table, function(i, row) {
            var tr = $('<tr></tr>');
            $.each(row, function(i2, column) {
                if (firstSet) {
                    if (i2 == 'CurrentUserRole')
                        $('#bcPLFailedLoginTable thead tr:nth-child(2)').append($('<th></th>').html(bcProxyLoginPortlet.GlobalizedText.yourRoles));
                    else
                        $('#bcPLFailedLoginTable thead tr:nth-child(2)').append($('<th></th>').html(i2));

                }
                var td = $('<td></td>');
                if (i2 == 'CurrentUserRole') {
                    td.html(column);
                    td.addClass('plrightborder');
                }

                switch (column) {
                case null:
                    td.addClass('plPermGrey');
                    break;
                case true:
                    td.addClass('plPermGreen');
                    break;
                case false:
                    td.addClass('plPermRed');
                    break;
                }
                tr.append(td);
            });
            $('#bcPLFailedLoginTable tbody').append(tr);
            firstSet = false;
        });

        $('#bcPLFailedLoginDiv').dialog({
            modal: true,
            title: bcProxyLoginPortlet.GlobalizedText.permissionsDialogTitle,
            buttons: {
                Close: function() {
                    $(this).dialog("close");
                }
            },
            close: function() {
                $(this).dialog("destroy").remove();
            }
        }).dialog("option", { "width": $('#bcPLFailedLoginTable').width() + 50, "height": ($('#bcPLFailedLoginTable').height() + 200), "position": "center" });
        
    };
    
    function showLsrValues(data) {
        $('#bcPLShowLSRValues').attr('disabled', false);
        $('<div></div>').html(data.d.Output).dialog({
            modal: true,
            width: 500,
            title: 'Literal Replacement Values',
            close: function () {
                $(this).dialog("destroy").remove();
            }
        });
    }

}(window.bcProxyLoginPortlet = window.bcProxyLoginPortlet || {}, jQuery));

///////////////////////////////////////////////////////////////////////////////
// bcProxyLoginDefaultView
///////////////////////////////////////////////////////////////////////////////
(function (bcpldv, $) {

    //var canAdmin;
    var isInitialized = false;

    // Public methods.
    bcpldv.init = function () {
        initWidgets();
    };


    function processLogin(data) {
        if (data.d.Success) {
            window.location = data.d.Url;
        } else {
            $('#bcPLErrorContainer').show().html(data.d.Message + ' ');
            if (undefined != data.d.PermissionsTable && data.d.PermissionsTable.length > 0) {
                $('#bcPLErrorContainer').append($('<a></a>').html(bcProxyLoginPortlet.GlobalizedText.showMe).on('click', { table: data.d.PermissionsTable }, bcProxyLoginPortlet.showLoginFailure));
            }
            $('#bcPLProxy').attr('disabled', false);
            $('#bcPLProxy').val(bcProxyLoginPortlet.GlobalizedText.login);
        }
    }

    function initWidgets() {
        if (isInitialized)
            return;

        $('#bcPLUserName').autocomplete({
            minLength: 2,
            delay: 100,
            source: function (request, response) {
                bcProxyLoginService.findUser(request.term, function (data) { response(data.d); });
            },
            focus: function (event, ui) {
                $('#bcPLUserName').val(ui.item.label);
                return false;
            },
            select: function (event, ui) {
                $('#bcPLUserName').val(ui.item.UserName);
                return false;
            }
        })
            .data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.Text + " - " + item.UserName + "</a>")
                    .appendTo(ul);
            };

        $('#bcPLProxy').on('click', function () {
            $(this).attr('disabled', true);
            $(this).val(bcProxyLoginPortlet.GlobalizedText.attemptingLogin);
            bcProxyLoginService.login($('#bcPLUserName').val(), $('#bcPLReason').val(), $('#bcPLPassword').val(), "", processLogin);
        });

        $('#bcPLReason, #bcPLUserName, #bcPLPassword').on('keypress', function (e) {
            if ((e.keyCode || e.which) == 13) {
                $('#bcPLProxy').click();
                return false;
            }
            return true;
        });

        isInitialized = true;
    }
}(window.bcProxyLoginDefaultView = window.bcProxyLoginDefaultView || {}, jQuery));


///////////////////////////////////////////////////////////////////////////////
// bcProxyLoginConfigureView
///////////////////////////////////////////////////////////////////////////////
(function (bcplcv, $) {

    var isInitialized = false;
    var permissive;

    // Public methods.
    bcplcv.init = function () {
        initWidgets();
    };

    function initWidgets() {
        if (isInitialized)
            return;
        $('[name=rdEnableReports]').on('change', toggleReports);
        $('#bcPLTestReport').on('click', testReport);
        $('#bcPLSave').attr('disabled', true);
        $('#bcPLTestReport').attr('disabled', false);
        
        bcProxyLoginService.getSettings(function (data) {
            setSettings(data);
            $('#bcPLConfigureView input').on('change', function () {
                $('#bcPLSave').attr('disabled', false);
                $('#bcPLTestReport').attr('disabled', true);
            });
            toggleReports();
        });

        $('#bcPLSave').on('click', saveSettings);
        isInitialized = true;
    }

    function setSettings(data) {
        setRadio('rdEnablePW', data.d.EnablePw);
        setRadio('rdLogIP', data.d.LogIp);
        setRadio('rdLogFailures', data.d.LogFailures);
        setRadio('rdLogPages', data.d.LogPages);
        setRadio('rdEnableReports', data.d.EnableReports);
        setRadio('rdEnableSidebar', data.d.EnableSidebar);
        setRadio('rdLessPermissive', data.d.LessPermissive);
        setRadio('rdReportLogPages', data.d.ReportLogPages);
        setRadio('rdEnableResume', data.d.EnableResume);
        permissive = data.d.LessPermissive == 'True' ? true : false;

        switch (data.d.ReportFrequency) {
            case "D":
                $('#chkReportDaily').attr('checked', true);
                break;
            case "W":
                $('#chkReportWeekly').attr('checked', true);
                break;
            case "B":
                $('#chkReportDaily, #chkReportWeekly').attr('checked', true);
                break;
            default: break;
        }

        $('#tbReportEmail').val(data.d.ReportEmail);
        $('#tbReportBody').val(data.d.ReportBody);
        $('#tbReportSubject').val(data.d.ReportSubject);
    }

    function setRadio(radioName, value) {
        if (value == 'True') {
            $('[name=' + radioName + '][value=Y]').attr('checked', true);
        }
        else {
            $('[name=' + radioName + '][value=N]').attr('checked', true);
        }
    }

    function getBooleanRadio(radioName) {
        return $('[name=' + radioName + ']:checked').val() == 'Y' ? true : false;
    }

    function saveSettings() {
        if (permissive == true && getBooleanRadio('rdLessPermissive') == false) {
            if (!confirm(bcProxyLoginPortlet.GlobalizedText.permissiveWarning))
                return;
        }
        var freq = '';
        if ($('#chkReportDaily').attr('checked') == 'checked' && $('#chkReportWeekly').attr('checked') == 'checked') {
            freq = 'B';
        } else if ($('#chkReportDaily').attr('checked') == 'checked') {
            freq = 'D';
        } else if ($('#chkReportWeekly').attr('checked') == 'checked') {
            freq = 'W';
        }

        var dto = {
            EnablePW: getBooleanRadio('rdEnablePW'),
            LogIP: getBooleanRadio('rdLogIP'),
            LogFailures: getBooleanRadio('rdLogFailures'),
            LogPages: getBooleanRadio('rdLogPages'),
            EnableReports: getBooleanRadio('rdEnableReports'),
            EnableSidebar: getBooleanRadio('rdEnableSidebar'),
            LessPermissive: getBooleanRadio('rdLessPermissive'),
            ReportFrequency: freq,
            ReportEmail: $('#tbReportEmail').val(),
            ReportBody: $('#tbReportBody').val(),
            ReportSubject: $('#tbReportSubject').val(),
            ReportLogPages: getBooleanRadio('rdReportLogPages'),
            EnableResume: getBooleanRadio('rdEnableResume')
        };

        bcProxyLoginService.saveSettings({ settings: dto }, function () {
            if (getBooleanRadio('rdEnablePW')) {
                $('#bcPLRequirePassword').show();
            } else {
                $('#bcPLRequirePassword').hide();
            }
            $('#bcPLSave').attr('disabled', true);
            $('#bcPLTestReport').attr('disabled', false);
            $('#spanSaveMessage').show().delay(2000).fadeOut(500);
        });
    }

    function toggleReports() {
        if ($('[name=rdEnableReports]:checked').val() == 'N') {
            $('#rdEnableReportsYes').parent().parent().nextAll().hide();
            $('.reports').css('min-height', 0);
        } else {
            $('#rdEnableReportsYes').parent().parent().nextAll().show();
            $('.reports').css('min-height', 300);
        }
    }
    
    function testReport() {
        bcProxyLoginService.testReport();
        alert(bcProxyLoginPortlet.GlobalizedText.testReportInitiated);
    }
}(window.bcProxyLoginConfigureView = window.bcProxyLoginConfigureView || {}, jQuery));

///////////////////////////////////////////////////////////////////////////////
// bcProxyLoginPermissionsView
///////////////////////////////////////////////////////////////////////////////
(function (bcpldv, $) {

    //var canAdmin;
    var isInitialized = false;


    // Public methods.
    bcpldv.init = function () {
        initWidgets();
    };

    function initWidgets() {
        if (isInitialized)
            return;
        $('#bcPLRoles').on('change', getPermissions);
        $('#bcPLSavePermissions').attr('disabled', true);
        $('#spanSavePermissions').hide();
        $('#tblBCPLPermissions').on('change', 'input', setNeedToSave);
        $('#bcPLSavePermissions').on('click', save);
        bcProxyLoginService.getRoles(populateRolesDropdown);


    }

    function populateRolesDropdown(data) {
        $('#bcPLRoles').empty();
        $('#bcPLRoles').append($('<option></option>').val('').html(bcProxyLoginPortlet.GlobalizedText.selectRole));
        $.each(data.d, function (val, text) {
            $('#bcPLRoles').append($('<option></option>').val(val).html(text));
        });

        isInitialized = true;
    }

    function getPermissions(event) {
        $('#tblBCPLPermissions tbody').empty();
        if ($(event.target).val() != '') {
            bcProxyLoginService.getPermissionsByRole({ roleId: $(event.target).val() }, populateGrid);
        }
    }

    function populateGrid(data) {
        $.each(data.d.Permissions, function (i, e) {
            $('#tblBCPLPermissions')
                .append($('<tr></tr>')
                    .append($('<td></td>').html(e.RoleName))
                    .append($('<td></td>').append($('<input />').attr({ type: 'radio', id: 'bc_pl_role_a_' + i, name: 'bc_pl_role_' + i, value: 'A' })).on('click', setRadio))
                    .append($('<td></td>').append($('<input />').attr({ type: 'radio', id: 'bc_pl_role_d_' + i, name: 'bc_pl_role_' + i, value: 'D' })).on('click', setRadio))
                    .append($('<td></td>').append($('<input />').attr({ type: 'radio', id: 'bc_pl_role_i_' + i, name: 'bc_pl_role_' + i, value: 'I' })).on('click', setRadio))
                );
            if (e.CanProxy == null) {
                $('#bc_pl_role_i_' + i).attr('checked', true);
            } else if (e.CanProxy) {
                $('#bc_pl_role_a_' + i).attr('checked', true);
            } else if (!e.CanProxy) {
                $('#bc_pl_role_d_' + i).attr('checked', true);
            }
        });

        if (!data.d.LessPermissive) {
            $('#tblBCPLPermissions td:nth-child(3)').hide();
            $('#tblBCPLPermissions th:nth-child(3)').hide();
        } else {
            $('#tblBCPLPermissions td:nth-child(3)').show();
            $('#tblBCPLPermissions th:nth-child(3)').show();
        }
    }

    function save() {
        var permsArray = $.each($('#tblBCPLPermissions input').serializeArray(), function (i, e) { e.name = e.name.replace('bc_pl_role_', ''); });
        var perms = {};
        $.each(permsArray, function (i, e) {
            perms[e.name] = e.value;
        });
        var dto = { permissions: perms, roleId: $('#bcPLRoles').val() };
        bcProxyLoginService.savePermissions(dto, saveSuccessful);
    }

    function saveSuccessful(data) {
        $('#tblBCPLPermissions tbody').empty();
        $('#spanSavePermissions').show().delay(2000).fadeOut(500);
        populateGrid(data);
        $('#bcPLSavePermissions').attr('disabled', true);
    }

    function setRadio(event) {
        $(event.target).children().first().attr('checked', true);
        setNeedToSave();
    }

    function setNeedToSave() {
        $('#bcPLSavePermissions').attr('disabled', false);
    }
}(window.bcProxyLoginPermissionsView = window.bcProxyLoginPermissionsView || {}, jQuery));


///////////////////////////////////////////////////////////////////////////////
// bcProxyLoginLogsView
///////////////////////////////////////////////////////////////////////////////
(function (bcpllv, $) {

    var isInitialized = false;
    var oTable;
    var loading = false;
    
    // Public methods.
    bcpllv.init = function () {
        initWidgets();
    };

    function initWidgets() {
        if (isInitialized)
            return;

        $('#logList').on('click', 'tr', getPages);

        if ($.fn.dataTableExt == undefined) {
            $.getScript('//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js', function () {
                $('<link rel="stylesheet" type="text/css" href="//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css" >').appendTo("head");
                loadTable();
            });
        } else {
            loadTable();
        }

    }

    function loadTable() {
        oTable = $('#logList').dataTable({
            "bJQueryUI": true,
            "bProcessing": true,
            "sPaginationType": "full_numbers",
            "aaSorting": [[4, 'desc']],
            "aoColumnDefs": [
                { "bVisible": false, "aTargets": [0] },
                { "sType": "date", "aTargets": [4] },
                { "sWidth": "100px", "aTargets": [1, 2] },
                { "sWidth": "150px", "aTargets": [4] }
            ],
            "sDom": '<"H"lf<"#bcPLUserSearch">r>t<"F"ip>'
        });

        $("div#bcPLUserSearch")
            .append($('<span><strong>'+ bcProxyLoginPortlet.GlobalizedText.logsUserSearch+'</strong></span>'))
            .append($('<input />').attr('id', 'bcPLLogsUsername').on('keypress', function (e) {
                if ((e.keyCode || e.which) == 13) {
                    bcProxyLoginService.getLogs($(this).val(), populateTable);
                    return false;
                }
                return true;
            }));
        isInitialized = true;

        bcProxyLoginService.getLogs("", populateTable);
    }
    
    function getPages(event) {
        if (loading)
            return;
        loading = true;
        bcProxyLoginService.getPages({ id: oTable.fnGetData($(event.target).parents('tr')[0])[0] }, showPages);
    }
    
    function showPages(data) {
        loading = false;
        if (data.d.length > 0) {
            $('body').append($('<div></div>').attr('id', 'bcPLLogPages')
                .append($('<table><thead></thead><tbody></tbody></table>').attr('id', 'bcPLLogPagesTable').width(550)));

            $('#bcPLLogPagesTable thead, #bcPLLogPagesTable tbody').empty();
            $('#bcPLLogPagesTable thead')
                .append($('<tr></tr>')
                    .append($('<th></th>').html(bcProxyLoginPortlet.GlobalizedText.logPages))
                    .append($('<th></th>').html(bcProxyLoginPortlet.GlobalizedText.logPagesDate))
                );

            var pTable = $('#bcPLLogPagesTable').dataTable({
                "bJQueryUI": true,
                "bProcessing": true,
                "sPaginationType": "full_numbers",
                "aaSorting": [[1, 'desc']],
                "aoColumnDefs": [
                    { "sWidth": "200px", "aTargets": [0] },
                    { "sWidth": "150px", "aTargets": [1] }
                ]
            });
            pTable.fnAddData(data.d);

            $('#bcPLLogPages').dialog({
                modal: true,
                title: bcProxyLoginPortlet.GlobalizedText.logPagesTitle,
                buttons: {
                    Close: function() {
                        $(this).dialog("close");
                    }
                },
                close: function() {
                    pTable.fnDestroy();
                    $(this).dialog("destroy").remove();
                }
            }).dialog("option", { "width": $('#bcPLLogPagesTable').width() + 50, "height": ($('#bcPLLogPagesTable').height() + 200), "position": "center" });
        } else {
            alert(bcProxyLoginPortlet.GlobalizedText.logPagesNone);
        }
    }

    function populateTable(data) {
        oTable.fnClearTable();
        if (data.d != null)
            oTable.fnAddData(data.d);
    }
}(window.bcProxyLoginLogsView = window.bcProxyLoginLogsView || {}, jQuery));

///////////////////////////////////////////////////////////////////////////////
// bcProxyLoginSidebar
///////////////////////////////////////////////////////////////////////////////
(function (bcplsb, $) {

    //var canAdmin;
    var isInitialized = false;

    // Public methods.
    bcplsb.init = function () {
        initWidgets();
    };


    function processLogin(data) {
        if (data.d.Success) {
            window.location = data.d.Url;
        } else {
            $('#bcPLSidebarError').show().html(data.d.Message + ' ');
            if (undefined != data.d.PermissionsTable && data.d.PermissionsTable.length > 0) {
                $('#bcPLSidebarError').append($('<a></a>').html(bcProxyLoginPortlet.GlobalizedText.showMe).on('click', { table: data.d.PermissionsTable }, bcProxyLoginPortlet.showLoginFailure));
            }
            $('#bcPLSidebarLoginBtn').attr('disabled', false);
            $('#bcPLSidebarLoginBtn').val(bcProxyLoginPortlet.GlobalizedText.login);
        }
    }

    function initWidgets() {
        if (isInitialized)
            return;

        $('#bcPLSidebarUsername').autocomplete({
            minLength: 2,
            delay: 100,
            source: function (request, response) {
                bcProxyLoginService.findUser(request.term, function (data) { response(data.d); });
            },
            focus: function (event, ui) {
                $('#bcPLSidebarUsername').val(ui.item.label);
                return false;
            },
            select: function (event, ui) {
                $('#bcPLSidebarUsername').val(ui.item.UserName);
                return false;
            }
        })
            .data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.Text + " - " + item.UserName + "</a>")
                    .appendTo(ul);
            };

        $('#bcPLSidebarLoginBtn').on('click', function () {
            $(this).attr('disabled', true);
            $(this).val(bcProxyLoginPortlet.GlobalizedText.attemptingLogin);
            bcProxyLoginService.login($('#bcPLSidebarUsername').val(), $('#bcPLSidebarReason').val(), $('#bcPLSidebarPassword').val(), window.location.toString(), processLogin);
        });

        $('#bcPLSidebarReason, #bcPLSidebarUsername, #bcPLSidebarPassword').on('keypress', function (e) {
            if ((e.keyCode || e.which) == 13) {
                $('#bcPLSidebarLoginBtn').click();
                return false;
            }
            return true;
        });
        
        if ($('#bcPLSidebarResume').length > 0) {
            $('#bcPLSidebarResume').on('click', function () {
                $(this).attr('disabled', true);
                $(this).val(bcProxyLoginPortlet.GlobalizedText.attemptingLogin);
                bcProxyLoginService.resume(window.location.toString(), processLogin);
            });
        }

        isInitialized = true;
    }
}(window.bcProxyLoginSidebar = window.bcProxyLoginSidebar || {}, jQuery));

///////////////////////////////////////////////////////////////////////////////
// bcProxyLoginService
///////////////////////////////////////////////////////////////////////////////
(function (bcpls) {
    // Public members.
    // Can be overriden in document ready function to use different web service location.
    bcpls.webServiceRoot = 'Portlets/CUS/ICS/BCProxyLogin/services/';

    // Fill vary jsonObject with data to submit. 
    // dto = data transfer object
    // Public methods.
    bcpls.getGlobalizedText = function (callback) {
        plajaxUtil.callWebService(bcpls.webServiceRoot + 'Globalizer.asmx/GetGlobalizedText', undefined, callback);
    };

    bcpls.findUser = function (username, callback) {
        var dto = {};
        dto.term = username;
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'UserSearch.asmx/FindUser', dto, callback);
    };

    bcpls.login = function (username, reason, password, url, callback) {
        var dto = {};
        dto.username = username;
        dto.password = password || "";
        dto.reason = reason;
        dto.redirectUrl = url;
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Login.asmx/AttemptLogin', dto, callback);
    };
    
    bcpls.resume = function (url, callback) {
        var dto = {};
        dto.redirectUrl = url;
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Login.asmx/ResumeLogin', dto, callback);
    };

    bcpls.isAdmin = function (callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Globalizer.asmx/IsAdmin', undefined, callback);
    };

    bcpls.getLogs = function (username, callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Logs.asmx/GetLogs', { username: username == undefined ? "" : username }, callback);
    };
    
    bcpls.getPages = function (dto, callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Logs.asmx/GetPages', dto, callback);
    };

    bcpls.getSettings = function (callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Settings.asmx/GetSettings', undefined, callback);
    };

    bcpls.saveSettings = function (dto, callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Settings.asmx/SaveSettings', dto, callback);
    };

    bcpls.getRoles = function (callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Permissions.asmx/GetRoles', undefined, callback);
    };

    bcpls.getPermissionsByRole = function (dto, callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Permissions.asmx/GetPermissionsByRole', dto, callback);
    };

    bcpls.savePermissions = function (dto, callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'Permissions.asmx/SavePermissions', dto, callback);
    };
    
    bcpls.testReport = function () {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'TestReport.asmx/Go', undefined, undefined);
    };

    bcpls.getLSRValues = function(callback) {
        return plajaxUtil.callWebService(bcpls.webServiceRoot + 'LiteralStringReplacer.asmx/GetValues', undefined, callback);
    };

}(window.bcProxyLoginService = window.bcProxyLoginService || {}, jQuery));

///////////////////////////////////////////////////////////////////////////////
// plajaxUtil
///////////////////////////////////////////////////////////////////////////////
(function (au, $) {
    au.callWebService = function (webService, data, callback) {
        $.ajax({
            type: 'POST',
            url: webService,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            success: callback
        });
    };
}(window.plajaxUtil = window.plajaxUtil || {}, jQuery));