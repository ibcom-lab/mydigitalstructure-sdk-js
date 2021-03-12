/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 */

 "use strict";

$(document).off('click', '.myds-logoff').on('click', '.myds-logoff', function(event)
{
	mydigitalstructure.deauth({uri: '/app/#auth'});
});

$(document).off('click', '#myds-logon')
.on('click', '#myds-logon', function(event)
{
	mydigitalstructure.auth(
	{
		logon: $('#myds-logonname').val(),
		password: $('#myds-logonpassword').val()
	});
});

$(document).off('keypress', '#myds-logonname, #myds-logonpassword')
.on('keypress', '#myds-logonname, #myds-logonpassword', function(e)
{
    if (e.which === 13)
    {
        mydigitalstructure.auth(
		{
			logon: $('#myds-logonname').val(),
			password: $('#myds-logonpassword').val()
		});
    }
});

$(document).off('click', '.myds')
.on('click', '.myds', function (event)
{
	var id = $(this).data('id');
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

$(document).off('click', '.myds-check')
.on('click', '.myds-check', function (event)
{
	var controller = $(this).data('controller');
	var context = $(this).data('context');

	if (controller != undefined && context != undefined)
	{	
 		var checked = $('input.myds-check[data-controller="' + controller + '"][data-context="' + context + '"]:checked')
 		var ids = $.map(checked, function (c) {return $(c).data('id')});

 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = (ids.length==0?'':ids.join(','));

		if (app.controller[controller] != undefined)
		{	
			var param = {dataContext: app.data[controller][context]}
			app.controller[controller](param);
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

	$(document).off('click', '.app-pill a')
	.on('click', '.app-pill a', function (e)
	{
	  	e.preventDefault()
	  	$(this).tab('show');
	});	

	$(document).off('shown.bs.tab', '.app-tab a, .app-pill a').on('shown.bs.tab', '.app-tab a, .app-pill a', function(event)
	{
		var uriContext = $(event.target).attr('href').replace('#', '');

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
				source.html(source.html().replace('Hide', 'Show'));
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id]({status: 'hidden'});
			}
		}	
    });

    $(document).off('shown.bs.collapse')
	.on('shown.bs.collapse', function (event)
	{
		var id = event.target.id;

		if (id != '')
		{	
			var source = $('[data-target="#' + id + '"]');
			if (source != undefined)
			{
				source.html(source.html().replace('Show', 'Hide'));
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id]({status: 'shown'});
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
}    

if (typeof $.fn.carousel == 'function')
{ 
    $(document).off('slide.bs.carousel')
    .on('slide.bs.carousel', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var id = event.relatedTarget.id;
			if (id == '') {id = $(event.relatedTarget).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'shown', context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

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