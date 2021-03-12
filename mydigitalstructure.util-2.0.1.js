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
	var id = event.target.id;

	if (id != '')
	{	
		if (app.controller[id] != undefined)
		{	
			var param = {context: (mydigitalstructure._scope.app.uriContext).replace('#', '')}

			param.dataContext = 
			{
				id: $(event.target).data('id'),
				reference: $(event.target).data('reference'),
			}	
			
			app.controller[id](param);
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
			app.controller[uriContext]()
		}
		else
		{
			var uriContext = uriContext.split('_');

			if (app.controller[uriContext[0]] != undefined)
			{
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
					param.dataContext = 
					{
						id: $(event.relatedTarget).attr('data-id'),
						reference: $(event.relatedTarget).attr('data-reference'),
					}	
				}
				else if (mydigitalstructure._scope.app.dataContext != undefined)
				{
					param = $.extend(true, param, {dataContext: mydigitalstructure._scope.app.dataContext})
				}

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
			if (app.controller[id] != undefined)
			{
				app.controller[id]({status: 'hidden'});
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
				app.controller[id](param);
			}
		}	
	});
}	