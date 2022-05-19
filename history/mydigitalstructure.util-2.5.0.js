/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 */

 "use strict";

mydigitalstructure.compatible = (typeof document.addEventListener == 'function');
mydigitalstructure.ie = (navigator.appVersion.indexOf('MSIE') != -1)

try
{
    mydigitalstructure.saveAs = !!new Blob;
} catch (e) {mydigitalstructure.saveAs = false}

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

$(document).off('click', '.myds-click')
.on('click', '.myds-click', function (event)
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

	if (controller == undefined)
	{
		controller = $(this).closest('ul.dropdown-menu').data('controller');
	}

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
		
		if (!selected && dataUnselectedID != undefined)
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

$(document).off('changeDate clearDate', '.date')
.on('changeDate clearDate', '.date', function (event)
{
	var controller = $(this).data('controller');
	var context = $(this).data('context');
	var enter = $(this).data('enter');
	var returnValue;

	if (controller == undefined)
	{
		controller = $(this).children('input').data('controller');
	}

	if (context == undefined)
	{
		context = $(this).children('input').data('context');
	}

	if (event.which == '13' && enter == 'stop')
	{
		event.preventDefault();
		returnValue = false;
   }
	
	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		//app.data[controller].dataContext = $(this).children('input').data();
 		app.data[controller][context] = event.format();
 		app.data[controller]['_' + context] = event;

		if (app.controller[controller] != undefined)
		{	
			if (app.data[controller].timerText != 0) {clearTimeout(app.data[controller].timerText)};
			
			var param = {dataContext: $(this).children('input').data()};

			if (context != undefined)
			{
				param[context] = app.data[controller][context];
			}

			app.data[controller].timerText = setTimeout('app.controller["' + controller + '"](' + JSON.stringify(param) + ')', 500);
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

$(document).off('focusout', '.myds-text-select')
.on('focusout', '.myds-text-select', function (event)
{
	if ($(this).val() == '')
	{
		var scope = $(this).data('scope');
		if (_.isUndefined(scope)) {scope = $(this).data('controller')}
		var context = $(this).data('context');
		
		if (scope != undefined && context != undefined)
		{
			if (!_.isUndefined(app.data[scope])) {app.data[scope][context] = ''}
			$(this).attr('data-id', '');
		}
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
			var set = $(this).attr('data-context-set');

			if (set == 'id')
			{
				app.data[controller]['_' + context] = $(this).typeahead("getActive");
				app.data[controller][context] = app.data[controller]['_' + context].id;
			}
			else
			{
				app.data[controller][context] = $(this).typeahead("getActive");
				app.data[controller][context + '-id'] = app.data[controller][context].id;
			}
				
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

$(document).off('change', '.myds-select')
.on('change', '.myds-select', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');
	
	if (scope != undefined && context != undefined)
	{
		if (app.data[scope] == undefined) {app.data[scope] = {}}
		{
 			app.data[controller][context] = $(this).val();
 			app.data[controller]['_' + context] = $(this).data();
 		}	
	}

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

		app.data[controller][context] = $(this).val();
 		app.data[controller]['_' + context] = $(this).data();
 	
		if (app.controller[controller] != undefined)
		{	
			app.controller[controller]({dataContext: app.data[controller]['_' + context]});
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

$(document).off('click', '.myds-sort')
.on('click', '.myds-sort', function (event)
{
	var sort = $(this).attr('data-sort');
	var sortDirection = $(this).attr('data-sort-direction');
	var controller = $(this).attr('data-controller');
	var context = $(this).attr('data-context');

	if (_.isUndefined(controller))
	{
		controller = $(this).parent().attr('data-controller');
	}

	if (_.isUndefined(context))
	{
		context = $(this).parent().attr('data-context');
	}

	if (_.isUndefined(context))
	{
		context = 'sort';
	}

	if (_.isUndefined(sortDirection))
	{
		sortDirection = 'desc';
	}

	sortDirection = (sortDirection=='desc'?'asc':'desc')

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = {name: sort, direction: sortDirection};
 		app.data[controller]['_' + context] = $(this).data();

		if (app.controller[controller] != undefined)
		{	
			var param = {sort: app.data[controller][context]}
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

if (typeof $.fn.metisMenu == 'function')
{ 
	$(document).off('click', '.myds-menu a')
	.on('click', '.myds-menu a', function (e)
	{
		$(this).parent().parent().children().removeClass('active');
		$(this).parent().addClass('active');
	});
}	

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

	$(document).off('shown.bs.tab', '.app-tab a, .app-pill a, .myds-tab a').on('shown.bs.tab', '.app-tab a, .app-pill a, .myds-tab a', function(event)
	{
		var uriContext = $(event.target).attr('href').replace('#', '');
		var controller = $(event.target).attr('data-controller');

		if (controller == undefined)
		{
			controller = $(event.target).parent().parent().attr('data-controller');
		}

		mydigitalstructure._util.view.track(
		{
			view: mydigitalstructure._scope.app.view.data,
			uri: mydigitalstructure._scope.app.uri,
			uriContext: uriContext
		});

		if (controller != undefined)
		{
			var param =
			{
				uriContext: uriContext,
				status: 'shown',
				dataContext: $(event.target).data()
			}

			app.data[controller] = param;

			if (app.controller[controller] != undefined)
			{
				app.controller[controller](param);
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
			var param = {context: (mydigitalstructure._scope.app.uriContext).replace('#', ''), viewStatus: 'shown'}

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

			mydigitalstructure._util.view.track(
			{
				view: mydigitalstructure._scope.app.view.data,
				uri: mydigitalstructure._scope.app.options.startURI,
				uriContext: id,
				dataContext: param.dataContext
			});

			if (app.controller[id] != undefined)
			{	
				app.controller[id](param);
			}
		}	
    });

    $(document).off('show.bs.modal')
    .on('show.bs.modal', function (event)
	{
		var id = event.target.id;

		mydigitalstructure._util.reset({controller: id});

		var controller;

		if ($(event.target).attr('data-controller-show') != undefined)
		{
			controller = $(event.target).attr('data-controller-show')
		}

		var param = {context: (mydigitalstructure._scope.app.uriContext).replace('#', ''), viewStatus: 'show'}

		if (id != '')
		{
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
		}	

		if (app.controller[controller] != undefined)
		{	
			app.controller[controller](param);
		}

		if (typeof $.fn.popover == 'function')
		{ 
			$('.popover').popover('hide');
		}	
	});
}

if (typeof $.fn.collapse == 'function')
{
	$(document).off('hidden.bs.collapse', '.myds-collapse')
	.on('hidden.bs.collapse', '.myds-collapse', function (event)
	{
		var id = event.target.id;
		if (id != '')
		{	
			var source = $('[data-target="#' + id + '"]');
			if (source != undefined)
			{	
				if (source.html() != undefined && source.attr('data-auto') != 'false')
				{	
					if ((source.html()).indexOf('Hide') != -1)
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

    $(document).off('shown.bs.collapse', '.myds-collapse')
	.on('shown.bs.collapse', '.myds-collapse', function (event)
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
					if ((source.html()).indexOf('Show') != -1)
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
	
	$(document).off('show.bs.collapse', '.myds-collapse')
	.on('show.bs.collapse', '.myds-collapse', function (event)
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
		String.fromCharCode(8220), //Ã¢â‚¬Å“
		String.fromCharCode(8221), //Ã¢â‚¬Â
		String.fromCharCode(8216), //Ã¢â‚¬Ëœ
		String.fromCharCode(8217), //Ã¢â‚¬Ëœ
		String.fromCharCode(8211), //Ã¢â‚¬â€œ
		String.fromCharCode(8212), //Ã¢â‚¬â€
		String.fromCharCode(189), //Ã‚Â½
		String.fromCharCode(188), //Ã‚Â¼
		String.fromCharCode(190), //Ã‚Â¾
		String.fromCharCode(169), //Ã‚Â©
		String.fromCharCode(174), //Ã‚Â®
		String.fromCharCode(8230) //Ã¢â‚¬Â¦
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

mydigitalstructure._util.view.more = function (response, param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var queue = mydigitalstructure._util.param.get(param, 'queue').value;
	var button = $('button[data-id="' + response.moreid + '"]');
	var styles = mydigitalstructure._scope.app.options.styles;
	var buttonClass = 'btn btn-default btn-sm';

	if (_.isObject(styles))
	{
		if (!_.isUndefined(styles.button))
		{
			buttonClass = styles.button;
		}
	}

	if (_.isUndefined(controller)) {controller = queue}

	if (response.morerows == 'true' && !_.isUndefined(controller))
	{
		if (_.eq(button.length, 0) || _.eq(_.toNumber(response.startrow), 0))
		{
			app.vq.add('<div class="text-center m-b">' +
      					'<button class="' + buttonClass + ' myds-more" data-id="' + response.moreid + '"' +
      					' data-start="' + (_.toNumber(response.startrow) + _.toNumber(response.rows)) + '"' +
      					' data-rows="' + response.rows + '"' +
      					' data-controller="' + controller + '">' +
        					'Show More</button></div>', param);

			if (_.isObject(app.data[controller]))
			{
				if (!_.isUndefined(app.data[controller].count))
				{
					app.vq.add('<div class="text-center m-b small text-muted"><span class="myds-info" data-id="' + response.moreid + '">' +
										response.rows + ' of ' + app.data[controller].count + '</span></div>', param);
				};
			}

			if (_.isUndefined(mydigitalstructure._scope.data[controller]))
			{
				mydigitalstructure._scope.data[controller] = {}
			}

			mydigitalstructure._scope.data[controller]._retrieve = _.clone(response);

		}
		else
		{
			button.attr('data-start', (_.toNumber(response.startrow) + _.toNumber(response.rows)));
			$('span.myds-info[data-id="' + response.moreid + '"]').html((_.toNumber(response.startrow) + _.toNumber(response.rows)) +
					 ' of ' + app.data[controller].count);
		}

		button.removeClass('disabled');
		button.blur();
	}
	else
	{
		if (_.isEmpty(button))
		{
			app.vq.add('<div class="text-center m-b small text-muted">' +
								'All shown (' + app.data[controller].count + ')</div>', param);
		}
		else
		{	
			button.remove();
			$('span.myds-info[data-id="' + response.moreid + '"]').html('All shown (' + app.data[controller].count + ')');
		}	
	}
}

$(document).off('click', '.myds-more')
.on('click', '.myds-more', function (event)
{
	$(this).addClass('disabled');

	var id = $(this).attr('data-id');
	var start = $(this).attr('data-start');
	var rows = $(this).attr('data-rows');
	var controller = $(this).attr('data-controller');

	mydigitalstructure._util.view.moreSearch(
	{
		id: id,
		startrow: start,
		rows: rows,
		controller: controller
	});
});

mydigitalstructure._util.view.moreSearch = function (param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var queue = mydigitalstructure._util.param.get(param, 'queue').value;

	if (!_.isUndefined(controller))
	{
		if (_.isFunction(app.controller[controller]))
		{	
			mydigitalstructure._util.send(
			{
				data: param,
				callback: app.controller[controller],
				type: 'POST',
				url: '/rpc/core/?method=CORE_SEARCH_MORE',
			});
		}	
	}	
}

mydigitalstructure._util.factory = function (param)
{
	var namespace = mydigitalstructure._scope.app.options.namespace;
	if (_.isUndefined(namespace)) {namespace = 'app'}

	app.controller[namespace + '-util-attachment-check'] = function (param)
	{
		var fileSize;
		var fileSizeMax = 10e6;
		
		var id = param.dataContext.id;
		
		if (app.data[namespace + '-util-attachment-check']._file.length > 0)
		{
			if (app.data[namespace + '-util-attachment-check']._file[0].files != undefined)
			{
				fileSize = app.data[namespace + '-util-attachment-check']._file[0].files[0].size
			}
		}
		
		var status = s.replaceAll(id, '-file0', '-status');
		
		if (app.controller[status] != undefined)
		{
			param.fileOverSize = (fileSize > fileSizeMax);
			param.fileSize = fileSize;
			param.fileSizeMax = fileSizeMax;
			app.controller[status](param);	
		}
		else
		{
			app.vq.show('#' + s.replaceAll(id, '-file0', '-status'), '');

			if (fileSize > fileSizeMax)
			{
				app.vq.clear({queue: namespace + '-util-attachment-check'});
				app.vq.add('<div class="alert alert-danger m-b" role="alert">The file you are about to upload is large, so it may take some time to upload.  Please do not close the web-browser until the upload is completed.  Thank you.</div>', {queue: 'app-util-attachment-check'})
				app.vq.render('#' + s.replaceAll(id, '-file0', '-status'), {queue: namespace + '-util-attachment-check'});
			}
		}
	}
}



