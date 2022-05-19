/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 */

 "use strict";

mydigitalstructure.compatible = (typeof document.addEventListener == 'function');
mydigitalstructure.ie = (navigator.appVersion.indexOf('MSIE') != -1)

$(document).off('click', '.myds-logoff').on('click', '.myds-logoff', function(event)
{
	mydigitalstructure.deauth({uri: '/app/#auth'});
});

$(document).off('click', '#myds-logon')
.on('click', '#myds-logon', function(event)
{
	var password = $('#myds-logonpassword').val();

	if ($('#myds-logonpassword').attr('data-password') != undefined)
	{
		password = $('#myds-logonpassword').attr('data-password');
	}

	mydigitalstructure.auth(
	{
		logon: $('#myds-logonname').val(),
		password: password
	});
});

$(document).off('keypress', '#myds-logonname, #myds-logonpassword')
.on('keypress', '#myds-logonname, #myds-logonpassword', function(e)
{
    if (e.which === 13)
    {
    	var password = $('#myds-logonpassword').val();

		if ($('#myds-logonpassword').attr('data-password') != undefined)
		{
			password = $('#myds-logonpassword').attr('data-password');
		}

        mydigitalstructure.auth(
		{
			logon: $('#myds-logonname').val(),
			password: password
		});
    }
});

$(document).off('click', '.myds')
.on('click', '.myds', function (event)
{
	var id = $(this).attr('id');
	var controller = $(this).data('controller');

	if (controller != undefined)
	{
		var param = {context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}
		param.dataContext = $(this).data();
		app.data[controller] = $(this).data();
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.controller[controller](param);
	}
	else
	{
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{	
				var param = {context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}
				param.dataContext = $(this).data();
				app.data[controller] = $(this).data();
				if (app.data[controller] == undefined) {app.data[controller] = {}}
				app.controller[id](param);
			}
		}
	}	
});

$(document).off('click', '.myds-dropdown')
.on('click', '.myds-dropdown', function (event)
{
	var id = $(this).attr('id');
	var controller = $(this).data('controller');
	var context = $(this).data('context');
	var html = $(this).html()
	var button = $(this).parents(".btn-group").find('.btn');

	button.html(html + ' <span class="caret"></span>');

	if (controller != undefined)
	{
		var param = {}
		param.dataContext = $(this).data();
		
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.data[controller].dataContext = $(this).data();

		if (context != undefined)
		{
			app.data[controller][context] = $(this).data('id');
			app.data[controller]['_' + context] = [$(this).data('id')];
		}	

		if (app.controller[controller] != undefined)
		{	
			app.controller[controller](param);
		}	
	}
	else
	{
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{	
				var param = {}
				param.dataContext = $(this).data();
				if (app.data[controller] == undefined) {app.data[controller] = {}}
				app.controller[id](param);
			}
		}
	}	
});

$(document).off('click', '.myds-list')
.on('click', '.myds-list', function (event)
{
	var element = $(this);
	var id = element.attr('id');
	var controller = element.data('controller');
	var context = element.data('context');
	
	element.closest('li').siblings().removeClass('active');
	element.closest('li').addClass('active');

	if (controller != undefined)
	{
		var param = {}
		param.dataContext = element.data();
		
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.data[controller].dataContext = element.data();

		if (context != undefined)
		{
			app.data[controller][context] = element.data('id');
			app.data[controller]['_' + context] = [element.data('id')];
		}	

		app.controller[controller](param);
	}
	else
	{
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{	
				var param = {}
				param.dataContext = element.data();
				if (app.data[controller] == undefined) {app.data[controller] = {}}
				app.controller[id](param);
			}
		}
	}	
});

$(document).off('click', '.myds-check')
.on('click', '.myds-check', function (event)
{
	var controller = $(this).data('controller');
	var controllerBefore = $(this).data('controller-before');
	var context = $(this).data('context');	

	if (controller != undefined && context != undefined)
	{	
		if (app.data[controller] == undefined) {app.data[controller] = {}}

		var dataID = $(this).data('id');
		var selected = $(this).prop('checked');
		var dataUnselectedID = $(this).data('unselectedId');
		
		if (!selected || dataUnselectedID != undefined)
		{
			dataID = dataUnselectedID;
		}
			
		var param =
		{
			selected: selected,
			dataID: dataID,
			dataContext: $(this).data(),
			controller: controller
		}

		if (controllerBefore != undefined)
		{
			app.controller[controllerBefore](param);
		}

		var inputs = $('input.myds-check[data-controller="' + controller + '"][data-context="' + context + '"]:visible');
		var ids = [dataID];
		
		if (inputs.length != 1)
		{
 			var checked = $('input.myds-check[data-controller="' + controller + '"][data-context="' + context + '"]:checked:visible');
 			ids = $.map(checked, function (c) {return $(c).data('id')});
		}
		
 		app.data[controller][context] = (ids.length==0?'':ids.join(','));
 		app.data[controller]['_' + context] = ids;

		if (app.controller[controller] != undefined)
		{	
			app.controller[controller](param);
		}
	}		
});

$(document).off('keyup', '.myds-text')
.on('keyup', '.myds-text', function (event)
{
	var controller = $(this).data('controller');
	var context = $(this).data('context');
	var enter = $(this).data('enter');
	var returnValue;

	if (event.which == '13' && enter == 'stop')
	{
        event.preventDefault();
		returnValue = false;
    }
	
	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = $(this).val();
 		app.data[controller]['_' + context] = $(this).data();

		if (app.controller[controller] != undefined)
		{	
			if (app.data[controller].timerText != 0) {clearTimeout(app.data[controller].timerText)};
			
			var param = JSON.stringify({dataContext: app.data[controller][context]});

			app.data[controller].timerText = setTimeout('app.controller["' + controller + '"](' + param + ')', 500);
		}
	}
	
	return returnValue
});

$(document).off('keypress', '.myds-text')
.on('keypress', '.myds-text', function (event)
{
	var enter = $(this).data('enter');

	if (event.which == '13' && enter == 'stop')
	{
        event.preventDefault();
		return false
    }
});

$(document).off('change', '.myds-text-select')
.on('change', '.myds-text-select', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');
	
	if (scope != undefined && context != undefined)
	{
		if (app.data[scope] == undefined) {app.data[scope] = {}}
		
		if (typeof $.fn.typeahead == 'function')
		{
			app.data[scope][context] = $(this).typeahead("getActive")
			$(this).attr('data-id', app.data[scope][context].id);
		}
		else
		{
 			app.data[controller][context] = $(this).val();
 			app.data[controller]['_' + context] = $(this).data();
 		}	
	}

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

		if (typeof $.fn.typeahead == 'function')
		{
			app.data[controller][context] = $(this).typeahead("getActive")
			$(this).attr('data-id', app.data[controller][context].id);
		}
		else
		{
 			app.data[controller][context] = $(this).val();
 			app.data[controller]['_' + context] = $(this).data();
 		}	

		if (app.controller[controller] != undefined)
		{	
			if (app.data[controller].timerText != 0) {clearTimeout(app.data[controller].timerText)};
			
			var param = JSON.stringify({dataContext: app.data[controller][context]});

			app.data[controller].timerText = setTimeout('app.controller["' + controller + '"](' + param + ')', 500);
		}
	}		
});

$(document).off('change', '.myds-change')
.on('change', '.myds-change', function (event)
{
	var controller = $(this).data('controller');
	var context = $(this).data('context');

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = $(this).val();
 		app.data[controller]['_' + context] = $(this).data();

		if (app.controller[controller] != undefined)
		{	
			var param = {dataContext: app.data[controller][context]}
			app.controller[controller](param);
		}
	}		
});

$(document).off('dp.change').on('dp.change', function(event)
{
	var element = $(event.target).children('input');

	var controller = element.data('controller');
	var context = element.data('context');

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = element.val();
 		app.data[controller]['_' + context] = element.data();

		if (app.controller[controller] != undefined)
		{	
			var param = {dataContext: app.data[controller][context]}
			app.controller[controller](param);
		}
	}
});

$(document).off('change.bs.fileinput').on('change.bs.fileinput', function(event)
{
	var element = $(event.target);
	var elementInput = element.find('input[type="file"]');

	if (elementInput.attr('type') == 'file')
	{
		var controller = element.data('controller');
		var context = element.data('context');

		if (context == undefined) {context = 'file'}

		if (controller != undefined)
		{	
			if (app.data[controller] == undefined) {app.data[controller] = {}}

			if (elementInput.length > 0)
			{
				app.data[controller][context] = {id: elementInput.attr('id')};
				app.data[controller]['_' + context] = elementInput;
			}

			if (app.controller[controller] != undefined)
			{	
				var param = {dataContext: app.data[controller][context]}
				app.controller[controller](param);
			}
		}
	}
});

if (typeof $.fn.tab == 'function')
{ 
	$(document).off('click', '.app-tab a')
	.on('click', '.app-tab a', function (e)
	{
		e.preventDefault()
		$(this).tab('show');
		$('.nav-tabs a :visible').parent().parent().removeClass('active');
		$('.nav-tabs a[href="' + $(this).attr("href") + '"] :visible').parent().parent().addClass('active');
	});

	$(document).off('click', '.myds-tab')
	.on('click', '.myds-tab', function (e)
	{
		e.preventDefault()
		$('a[href="' + $(this).attr('href') + '"]').tab('show');
	});

	$(document).off('click', '.app-pill a')
	.on('click', '.app-pill a', function (e)
	{
	  	e.preventDefault()
	  	$(this).tab('show');
	});	

	$(document).off('shown.bs.tab', '.app-tab a, .app-pill a').on('shown.bs.tab', '.app-tab a, .app-pill a', function(event)
	{
		var uriContext = $(event.target).attr('href').replace('#', '');
		var controller = $(event.target).attr('data-controller');

		mydigitalstructure._util.view.track(
		{
			view: mydigitalstructure._scope.app.view.data,
			uri: mydigitalstructure._scope.app.uri,
			uriContext: uriContext
		});

		if (controller != undefined)
		{
			if (app.controller[controller] != undefined)
			{
				app.controller[controller](
				{
					uriContext: uriContext,
					status: 'shown',
					dataContext: $(event.target).data()
				});
			}
		}
		else
		{
			if (app.controller[uriContext] != undefined)
			{
				if (app.data[uriContext] == undefined) {app.data[uriContext] = {}};
				app.controller[uriContext]();
			}
			else
			{
				var uriContext = uriContext.split('_');

				if (app.controller[uriContext[0]] != undefined)
				{
					if (app.data[uriContext[0]] == undefined) {app.data[uriContext[0]] = {}};
					app.controller[uriContext[0]]({context: uriContext[1]})
				}
			}
		}
	});
}

if (typeof $.fn.modal == 'function')
{ 
	$(document).off('shown.bs.modal')
	.on('shown.bs.modal', function (event)
	{
		var id = event.target.id;
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{	
				var param = {context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

				if (event.relatedTarget != undefined)
				{
					param.dataContext = $(event.relatedTarget).data();
					$(event.target.id).data('context', param.dataContext);
				}
				else if (mydigitalstructure._scope.app.dataContext != undefined)
				{
					param = $.extend(true, param, {dataContext: mydigitalstructure._scope.app.dataContext})
				}

				if (app.data[id] == undefined) {app.data[id] = {}};
				app.data[id] = _.extend(app.data[id], param);
				app.controller[id](param);
			}
		}	
    });

    $(document).off('show.bs.modal')
    .on('show.bs.modal', function (event)
	{
		if (typeof $.fn.popover == 'function')
		{ 
			$('.popover').popover('hide');
		}	
	});
}

if (typeof $.fn.collapse == 'function')
{
	$(document).off('hidden.bs.collapse')
	.on('hidden.bs.collapse', function (event)
	{
		var id = event.target.id;
		if (id != '')
		{	
			var source = $('[data-target="#' + id + '"]');
			if (source != undefined)
			{	
				if (source.html() != undefined && source.attr('data-auto') != 'false')
				{	
					if ((source.html()).indexOf('Hide') == 0)
					{
						source.html(source.html().replace('Hide', 'Show'));
					}
				}	
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.data[id] = _.extend(app.data[id], {status: 'hidden'});
				app.controller[id]({status: 'hidden'});
			}
		}	
    });

    $(document).off('shown.bs.collapse')
	.on('shown.bs.collapse', function (event)
	{
		var id = event.target.id;
		if ($(event.target).attr('data-controller') != undefined)
		{
			id = $(event.target).attr('data-controller')
		}
		
		if (id != '')
		{	
			var source = $('[data-target="#' + id + '"]');
			if (source != undefined)
			{
				if (source.html() != undefined && source.attr('data-auto') != 'false')
				{
					if ((source.html()).indexOf('Show') == 0)
					{
						source.html(source.html().replace('Show', 'Hide'));
					}
				}	
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.data[id].viewStatus = 'shown';
				app.data[id].dataContext = $(event.target).data();
				app.controller[id](
				{
					status: 'shown',
					dataContext: $(event.target).data()
				});
			}
		}	
    });
	
	$(document).off('show.bs.collapse')
	.on('show.bs.collapse', function (event)
	{
		var id = event.target.id;
		if ($(event.target).attr('data-controller') != undefined)
		{
			id = $(event.target).attr('data-controller')
		}
		
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.data[id].viewStatus = 'show';
				app.data[id].dataContext = $(event.target).data();
				app.controller[id](
				{
					status: 'show',
					dataContext: $(event.target).data()
				});
			}
		}	
    });
}    

if (typeof $.fn.popover == 'function')
{ 
    $(document).off('shown.bs.popover').on('shown.bs.popover', function (event)
	{
		if (event.target != undefined)
		{
			var id = event.target.id;
			if (id == '') {id = $(event.target).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'shown', context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

				param.dataContext = 
				{
					id: $(event.target).attr('data-id'),
					reference: $(event.target).attr('data-reference'),
				}
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
    });

	$(document).off('show.bs.popover').on('show.bs.popover', function (event)
	{
		$('.popover:visible').popover("hide")	
    });
}    

if (typeof $.fn.carousel == 'function')
{ 
    $(document).off('slide.bs.carousel', 'myds-slide')
    .on('slide.bs.carousel', 'myds-slide', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var id = event.relatedTarget.id;
			if (id == '') {id = $(event.relatedTarget).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'slide', context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

				param.dataContext = 
				{
					id: $(event.relatedTarget).attr('data-id'),
					reference: $(event.relatedTarget).attr('data-reference'),
				}
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
	});
}

if (typeof $.fn.carousel == 'function')
{ 
    $(document).off('slid.bs.carousel')
    .on('slid.bs.carousel', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var id = event.relatedTarget.id;
			if (id == '') {id = $(event.relatedTarget).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'slid', context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

				param.dataContext = 
				{
					id: $(event.relatedTarget).attr('data-id'),
					reference: $(event.relatedTarget).attr('data-reference'),
				}
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
	});
}

if (typeof $.fn.dropdown == 'function')
{ 
    $(document).off('show.bs.dropdownl')
    .on('show.bs.dropdown', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var id = event.relatedTarget.id;
			if (id == '') {id = $(event.relatedTarget).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'show', context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

				param.dataContext = $(event.relatedTarget).data();
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
	});
}

String.prototype.formatXHTML = function(bDirection)
{
	var sValue = this;
	
	var aFind = [
		String.fromCharCode(8220), //â€œ
		String.fromCharCode(8221), //â€
		String.fromCharCode(8216), //â€˜
		String.fromCharCode(8217), //â€˜
		String.fromCharCode(8211), //â€“
		String.fromCharCode(8212), //â€”
		String.fromCharCode(189), //Â½
		String.fromCharCode(188), //Â¼
		String.fromCharCode(190), //Â¾
		String.fromCharCode(169), //Â©
		String.fromCharCode(174), //Â®
		String.fromCharCode(8230) //â€¦
	];	

	var aReplace = [
		'"',
		'"',
		"'",
		"'",
		"-",
		"--",
		"1/2",
		"1/4",
		"3/4",
		"(C)",
		"(R)",
		"..."
	];

	if (bDirection)
	{
		sValue = sValue.replace(/\&/g,'&amp;');
		sValue = sValue.replace(/</g,'&lt;');
		sValue = sValue.replace(/>/g,'&gt;');
		sValue = sValue.replace(/-/g, '&#45;');
		sValue = sValue.replace(/@/g, '&#64;');
		sValue = sValue.replace(/\//g, '&#47;');
		sValue = sValue.replace(/"/g, '&quot;');
		sValue = sValue.replace(/\\/g, '&#39;');
	}
	else
	{
		sValue = sValue.replace(/\&amp;/g,'&');
		sValue = sValue.replace(/\&lt;/g,'<');
		sValue = sValue.replace(/\&gt;/g,'>');
		sValue = sValue.replace(/\&#45;/g, '-');
		sValue = sValue.replace(/\&#64;/g, '@');
		sValue = sValue.replace(/\&#47;/g, '/');
		sValue = sValue.replace(/\&quot;/g, '"');
		sValue = sValue.replace(/\&#39;/g, '\'');
		sValue = sValue.replace(/\&#60;/g,'<');
		sValue = sValue.replace(/\&#62;/g,'>');
		sValue = sValue.replace(/\&#244;/g,'\'');
		
		for ( var i = 0; i < aFind.length; i++ ) 
		{
			var regex = new RegExp(aFind[i], "gi");
			sValue = sValue.replace(regex, aReplace[i]);
		}
	}
	
	return sValue;
};