/*
	{
    	title: "Util; Search",
  	}
*/

mydigitalstructure._util.factory.search = function (param)
{
	app.add(
	{
		name: 'util-view-search-initialise',
		code: function (param)
		{
			var parentSelector = app._util.param.get(param, 'selector').value;
			var searches = app._util.param.get(param, 'searches').value;
			var context = app._util.param.get(param, 'context').value;
			var cssClass = app._util.param.get(param, 'class', {default: 'col-lg-4'}).value;
			var template = app._util.param.get(param, 'template').value;
			var buttonCaption = app._util.param.get(param, 'buttonCaption', {default: '<i class="fa fa-play"></i>'}).value;
			var autoShow = app._util.param.get(param, 'autoShow', {default: false}).value;
			var sort = app._util.param.get(param, 'autoShow', {default: true}).value;

			if (sort)
			{
				searches = _.sortBy(searches, 'caption');
			}

			app.set(
			{
				scope: 'util-view-search-initialise',
				context: 'dataContext',
				value: param
			});

			app.vq.init(parentSelector,
			{
				queue: 'util-view-search-initialise'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var nameUserFilterValues = app.get(
			{
				scope: 'util-view-search-show',
				context: 'nameUserFilterValues',
				valueDefault: 'default'
			});

			if (template == undefined)
			{
				//	'<button class="btn btn-default btn-outline btn-sm myds-navigate mt-2 d-none" data-name="{{name}}" data-context="{{context}}" data-controller="{{controller}}" id="{{id}}">{{buttonCaption}}</button>',

				template =
				[
		 			'<div class="{{class}} myds-click" data-name="{{name}}" data-controller="{{controller}}">',
						'<div class="ibox">',
							'<div class="ibox-title">',
								'<div class="ibox-tools">',
		                      '{{icon}}',
	                  	'</div>',
								'<h3 class="ml-1">{{caption}}</h3>',
							'</div>',
							'<div class="ibox-content">',
								'<div class="text-muted">{{notes}}</div>',
							'</div>',
						'</div>',
					'</div>'
				]
			}

			app.vq.add(template,
			{
				queue: 'util-view-search-initialise',
				type: 'template'
			});

			app.vq.add(
			[
				'<div class="container-fluid">',
	    			'<div class="row">'
			],
			{
				queue: 'util-view-search-initialise'
			});
			
			_.each(searches, function (search, s)
			{
				if (search.controller == undefined)
				{
					search.controller = 'util-view-search-show'
				}

				if (search.name == undefined)
				{
					search.name = _.kebabCase(search.caption);

					if (context != undefined)
					{
						search.name = context + '-' + search.name
					}
				}
			
				if (search.id == undefined)
				{
					search.id = search.name;
				}

				if (search.notes == undefined) {search.notes = ''}
				if (search.icon == undefined) {search.icon = ''}

				if (search.class == undefined) {search.class = cssClass}
				if (search.context == undefined) {search.context = context}
				if (search.buttonCaption == undefined) {search.buttonCaption = buttonCaption}
				if (search.parentSelector == undefined) {search.parentSelector = parentSelector}

				if (search.userFilterValues == undefined) {search.userFilterValues = {}}

				search._userFilterValues = search.userFilterValues[nameUserFilterValues];

				app.vq.add(
				{
					queue: 'util-view-search-initialise',
					useTemplate: true
				},
				search);
			});

			app.vq.add(
			[
					'</div>',
	    		'</div>'
			],
			{
				queue: 'util-view-search-initialise'
			});

			app.set(
			{
				scope: 'util-view-search-initialise',
				context: 'searches',
				value: searches
			});

			if (name != undefined && autoShow)
			{
				app.invoke('util-view-search-show')
			}
			else
			{
				app.vq.render(parentSelector,
				{
					queue: 'util-view-search-initialise'
				});
			}
		}
	});

	app.add(
	{
		name: 'util-view-search-show',
		code: function (param)
		{
			var selector = app._util.param.get(param, 'selector').value;
			var template = app._util.param.get(param, 'template').value;
			var context = app._util.param.get(param, 'context').value;

			var searches = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'searches'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var userFilters = app.get(
			{
				scope: 'util-view-search-user-filter',
				valueDefault: {}
			});

			var search = _.find(searches, function (search) {return search.name == name});

			if (search == undefined)
			{
				app._util.data.clear(
				{
					scope: 'util-view-search-show',
					context: 'name'
				});

				app.notify({message: 'Report can not be found (' + name + ')!', type: 'danger'});
			}
			else
			{		
				if (search.parentSelector != undefined) {selector = search.parentSelector}

				var whoami = app.invoke('util-whoami');

				if (search.footerTemplate == undefined)
				{
					search.footerTemplate = '<div class="text-muted ml-1"><small>A search of {{appname}} by {{logonname}} @ {{datetime}}</small></div>'
				}

				search.footerTemplate = app.vq.apply(
				{
					template: search.footerTemplate,
					data:
					{
						appname: whoami.buildingMe.about.name,
						datetime: moment().format('DD MMM YYYY h:mm a'),
						logonname: whoami.thisInstanceOfMe.user.userlogonname,
						userfirstname: whoami.thisInstanceOfMe.user.firstname,
						userlastname: whoami.thisInstanceOfMe.user.surname
					}
				});

				app.vq.init(selector,
				{
					queue: 'util-view-search-show',
					working: true
				});

				if (_.isArray(search.userFilters))
				{
					app.vq.init(
					{
						queue: 'util-view-search-show-user-filters'
					});

					_.each(search.userFilters, function (userFilter)
					{
						if (userFilter.type == undefined) {userFilter.type = 'text'}

						if (userFilters[userFilter.name] != undefined)
						{
							userFilter.value = userFilters[userFilter.name]
						}

						app.vq.add(
						[
							'<div class="col-sm-4">',
								'<div>',
	          					'<label class="text-muted mb-1 mt-2 ml-1" for="util-view-search-user-filter-', userFilter.name, '">',
	          						userFilter.caption,
	          					'</label>'
		          		],
		          		{queue: 'util-view-search-show-user-filters'});

						var userFilterValue = _.find(search._userFilterValues, function (userFilterValue) {return userFilterValue.name == userFilter.name});

		              	if (userFilter.type == 'select')
		              	{
		              		if (userFilter.value == undefined && userFilter.data != undefined)
		              		{
		              			var defaultFilter = _.find(userFilter.data, function (data) {return data.default});

		              			if (defaultFilter != undefined) {userFilter.value = {id: defaultFilter.id, text: defaultFilter.text}}
		              		}

		              		if (userFilter.value == undefined && userFilterValue != undefined)
		              		{
		              			userFilter.value = {id: userFilterValue.id, text: userFilterValue.text};
		              		}

					    	app.vq.add(
							[
								'<button type="button" class="btn btn-white btn-sm dropdown-toggle form-control text-left" data-toggle="dropdown" ',
									' style="font-size:0.8rem;"',
									' data-name="', userFilter.name, '"',
									' data-search-name="', search.name, '"',
									' id="util-view-search-user-filter-', userFilter.name, '"',
									' data-id="', userFilter.value.id, '"',
									' aria-expanded="false">',
									'<span class="dropdown-text">', userFilter.value.text, '</span>',
		              			'</button>',
		              			'<ul class="dropdown-menu mt-1"',
		              				' data-context="', userFilter.name, '"',
		              				' data-scope="util-view-search-user-filter"',
											(search.searchOnChange?' data-controller="util-view-search-process"':''),
		              			'>'
		              		],
		              		{queue: 'util-view-search-show-user-filters'});

					    	_.each(userFilter.data, function (data)
					    	{
					    		app.vq.add(
								[
					               '<li>',
					                  '<a href="#" class="myds-dropdown" data-id="', data.id + '">',
					                  data.text,
					                  '</a>',
					               '</li>'
					            ],
		              			{queue: 'util-view-search-show-user-filters'});
					         });

					    	app.vq.add(
							[
				              '</ul>'
							],
							{queue: 'util-view-search-show-user-filters'});
						}

						if (userFilter.type == 'text-select')
		              	{
		              		app.vq.add(
							[
				              	'<select class="form-control myds-text-select disabled"',
				              		' id="util-view-search-user-filter-', userFilter.name, '"',
				              		' data-scope="util-view-search-user-filter"',
				              			(search.searchOnChange?' data-controller="util-view-search-process"':''),
				              		' data-placeholder="Select..."',
						    			' data-context="', userFilter.name, '">',
				              		' ></select>'
				            ],
							{
								queue: 'util-view-search-show-user-filters'
							});
						} 

		              	if (userFilter.type == 'text')
		              	{
		              		if (userFilter.value == undefined && userFilterValue != undefined)
		              		{
		              			userFilter.value = userFilterValue.text;
		              		}

		              		if (userFilter.value == undefined)
		              		{
		              			userFilter.value = ''
		              		}

					    	app.vq.add(
							[
								'<input id="util-view-search-user-filter-', userFilter.name, '" type="text"',
												' class="form-control myds-text input-sm"',
												' style="font-size:0.8rem;"',
					    						' data-name="', userFilter.name, '"',
					    						' data-search-name="', search.name, '"',
					    						' data-scope="util-view-search-user-filter"',
					    							(search.searchOnChange?' data-controller="util-view-search-process"':''),
					    						' data-value="' + userFilter.value + '"',
					    						' value="' + userFilter.value + '"',
					    						' data-context="', userFilter.name, '">'
							],
							{
								queue: 'util-view-search-show-user-filters'
							});
						}

		              	if (userFilter.type == 'date')
		              	{
		              		//if (userFilters[userFilter] != undefined)
		              		//{
		              		//	userFilter.value = userFilters[userFilter]
		              		//}

		              		if (userFilter.value == undefined && userFilterValue != undefined)
		              		{
		              			userFilter.value = userFilterValue.date;
		              		}

		              		if (userFilter.value == undefined)
		              		{
		              			userFilter.value = ''
		              		}

					    	app.vq.add(
							[
							  '<div class="input-group date myds-date" data-target-input="nearest" id="util-view-search-user-filter-', userFilter.name, '">',
			                  '<input type="text" class="form-control input-sm datetimepicker-input" data-target="#util-view-search-user-filter-', userFilter.name, '"',
			                    	' id="util-view-search-user-filter-input-', userFilter.name, '"',
			                    	' data-scope="util-view-search-user-filter"',
			                    	(search.searchOnChange?' data-controller="util-view-search-process"':''),
			                    	' data-value="' + userFilter.value + '"',
			                    	' value="' + userFilter.value + '"',
			                    	' data-context="', userFilter.name, '"/>',
									'<div class="input-group-append" data-target="#util-view-search-user-filter-', userFilter.name, '" data-toggle="datetimepicker">',
										'<div class="input-group-text"><i class="far fa-calendar-alt"></i></div>',
									'</div>',
								'</div>'
							],
							{
								queue: 'util-view-search-show-user-filters'
							});
						}
							
						app.vq.add(
						[
				    			'</div>',
				    		'</div>'
						],
						{
							queue: 'util-view-search-show-user-filters'
						});
					});
				}

				app.vq.init(
				{
					queue: 'util-view-search-show-user-filters-container'
				});

				app.vq.add(
				[
					'<form autocomplete="off"><div class="card-body bg-light pt-2 pb-3">',
						'<div class="container-fluid px-1">',
		    				'<div class="row">'
				],
				{queue: 'util-view-search-show-user-filters-container'});

				if (search.searchOnChange)
				{
					app.vq.add(app.vq.get({queue: 'util-view-search-show-user-filters'}),
							{queue: 'util-view-search-show-user-filters-container'});
				}
				else
				{
					app.vq.add(
					[
						'<div class="col-10">',
							'<div class="container-fluid px-0">',
								'<div class="row">',
									app.vq.get({queue: 'util-view-search-show-user-filters'}),
								'</div>',
							'</div>',
						'</div>',
						'<div class="col-2 pr-3 text-right">'
					],
					{queue: 'util-view-search-show-user-filters-container'});

					if (_.isArray(search.userFilters))
					{
						app.vq.add(
						[
							'<div>' +
								'<button type="button" id="util-view-search-user-filter-search" style="margin-top:26px;"',
									' class="myds-click btn btn-default btn-outline btn-block" role="button" data-controller="util-view-search-process">',
	            					'Search',
	           					'</button>',
	           				'</div>'
						],
						{queue: 'util-view-search-show-user-filters-container'});
					}

					if (_.has(search, 'options.select'))
					{
						if (search.options.select != undefined)
						{
							if (search.options.select.controller != undefined && search.options.select.caption != undefined)
							{
								app.vq.add(
								[
									'<button type="button" id="util-view-search-user-filter-search"',
											' class="myds-click btn btn-default btn-outline mt-2 btn-block" role="button"' +
											' data-select-controller="' + search.options.select.controller + '"',
											' data-controller="util-view-search-select-init"',
											' data-name="' + search.name + '"',
											' data-context="util-view-search-show-view"',
											(search.data!=undefined?' ' + search.data:''),
											'>',
			            				search.options.select.caption,
			           				'</button>',
								],
								{queue: 'util-view-search-show-user-filters-container'});
							}
						}
					}

					app.vq.add(
					[
           				'</div>'
					],
					{queue: 'util-view-search-show-user-filters-container'});
				}

				app.vq.add(
				[
							'</div>',
		    			'</div>',
		    		'</div></form>'
				],
				{
					queue: 'util-view-search-show-user-filters-container'
				});

				if (template == undefined)
				{
					var whoami = app.invoke('util-whoami');
					var filename = 'export-' + search.name;

					if (_.has(whoami, 'buildingMe.about.prefix'))
					{
						filename = whoami.buildingMe.about.prefix + '-' + filename;
					}

					template =
					[
			 			'<div class="col-lg-12" data-name="{{name}}">',
							'<div class="card">',
								'<div class="card-header">',
									'<div class="float-right" data-html2canvas-ignore="true">',
										(context!=undefined?'<button class="myds-click btn btn-white btn-sm" role="button" data-controller="' + context + '">' +
		               				'<i class="fa fa-times fa-fw"></i> Close' +
		              				'</button>':''),
		              				'<div class="btn-group" role="group">',
				                     '<button class="myds-click btn btn-white btn-sm ml-2" role="button" data-controller="util-view-search-export"',
				                     	' data-filename="', filename, '">',
			               				'<i class="fa fa-cloud-download-alt fa-fw"></i>',
			              				'</button>',
			              				'<button class="myds-pdf btn btn-white btn-sm" role="button" data-selector="', search.selector, '">',
			               				'<i class="far fa-file-pdf fa-fw"></i>',
			              				'</button>',
			              			'</div>',
		                  	'</div>',
									'<h2 class="ml-2', (!_.isEmpty(search.notes)?' mt-0 mb-0':'') , '">{{caption}}</h2>',
									'<div class="ml-2 mt-1 text-muted w-75">{{notes}}</div>',
								'</div>',
								app.vq.get({queue: 'util-view-search-show-user-filters-container'}),
								'<div class="card-body" id="util-view-search-show-view">',
								'</div>',
								'<div class="card-footer" id="util-view-search-show-footer">',
									search.footerTemplate,
								'</div>',
							'</div>',
						'</div>'
					]
				}

				app.vq.add(template,
				{
					queue: 'util-view-search-show',
					type: 'template'
				});

				app.vq.add(
				[
					'<div class="container-fluid">',
		    			'<div class="row">'
				],
				{
					queue: 'util-view-search-show'
				});

				app.vq.add(
				{
					queue: 'util-view-search-show',
					useTemplate: true
				},
				search);

				app.vq.add(
				[
						'</div>',
		    		'</div>'
				],
				{
					queue: 'util-view-search-show'
				});

				app.vq.render(selector,
				{
					queue: 'util-view-search-show'
				});

				mydigitalstructure._util.view.datepicker({selector: '.myds-date', format: 'D MMM YYYY', pickerOptions: {buttons: {showClear: true}, useCurrent: false}});
				mydigitalstructure._util.view.datepicker({selector: '.myds-date-time', format: 'D MMM YYYY LT'});

				_.each(search.userFilters, function (userFilter)
				{
					if (userFilter.type == 'text-select' && userFilter.data != undefined)
					{
						userFilter._param = userFilter.data;
						userFilter._param.container = 'util-view-search-user-filter-' + userFilter.name;
						userFilter._param.controller = 'util-view-search-process';
						userFilter._param.context = userFilter.name;
						userFilter._param.options = {containerCssClass: 'select-sm', allowClear: true, placeholder: 'Select...'};

						var userFilterValue = _.find(search._userFilterValues, function (userFilterValue) {return userFilterValue.name == userFilter.name});

	           		if (userFilterValue != undefined)
	           		{
	           			userFilter.value = {id: userFilterValue.id, text: userFilterValue.text};
	           			userFilter._param.defaultValue = userFilter.value;
	           		}

						app.invoke('util-view-select', userFilter._param);
					}
				});

				$('.myds-text-select:visible').removeClass('disabled');
				app.invoke('util-view-search-process', param)
			}
		}
	});

	app.add(
	{
		name: 'util-view-search-process',
		code: function (param)
		{
			var searches = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'searches',
				value: searches
			});

			var searchInitialise = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'dataContext'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var search = _.find(searches, function (search) {return search.name == name});

			if (search.processController != undefined)
			{
				param = mydigitalstructure._util.param.set(param, 'search', search)
				app.invoke(search.processController, param);
			}
			else
			{
				app.invoke('util-view-search-process-show', param)
			}
		}
	});

	app.add(
	{
		name: 'util-view-search-process-show',
		code: function (param)
		{
			var searches = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'searches',
				value: searches
			});

			var searchInitialise = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'dataContext'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var search = _.find(searches, function (search) {return search.name == name});

			if (search != undefined)
			{
				if (search.format != undefined)
				{
					if (search.options == undefined)
					{
						search.options = {}
					}

					if (searchInitialise.options != undefined)
					{
						search.options = _.assign(search.options, searchInitialise.options)
					}

					if (search.noDataText != undefined)
					{
						search.options.noDataText = search.noDataText;
					}

					var filters;

					if (search.filterController != undefined)
					{
						app.invoke(search.filterController, filters)
					}
					else
					{
						var dataUserFilters = app.get(
						{
							scope: 'util-view-search-user-filter',
							valueDefault: {}
						});

						// Do user filters

						filters = _.clone(search.filters);
						if (filters == undefined) {filters = []}

						var userFilterValue;

						_.each(search.userFilters, function (userFilter)
						{
							userFilter.value = dataUserFilters[userFilter.name];

							if (userFilter.value == undefined)
							{
								searchUserFilterValue = _.find(search._userFilterValues, function (userFilterValue) {return userFilterValue.name == userFilter.name});

		              		if (searchUserFilterValue != undefined)
		              		{
		              			if (userFilter.type == 'text')
									{
		              				userFilter.value = searchUserFilterValue.text;
		              			}
		              			else if (userFilter.type == 'date')
									{
		              				userFilter.value = searchUserFilterValue.date;
		              			}
		              			else
		              			{
		              				userFilter.value = searchUserFilterValue.id;
		              			}
		              		}
		              	}

							if (userFilter.storage != undefined)
							{	
								if (userFilter.storage.field != undefined
										&& userFilter.value != undefined
										&& userFilter.value != ''
										&& userFilter.value != 'undefined')
								{
									if (userFilter.storage.comparison == undefined)
									{
										if (userFilter.type == 'text')
										{
											userFilter.storage.comparison = 'TEXT_IS_LIKE';
										}
										else
										{
											userFilter.storage.comparison = 'EQUAL_TO';
										}
									}

									userFilter._filters =
									{
										field: userFilter.storage.field,
										comparison: userFilter.storage.comparison,
										value: userFilter.value
									}

									if (userFilter.controller != undefined)
									{
										app.invoke(userFilter.controller, userFilter, userFilter._filters);
									}

									filters.push(userFilter._filters)
								}
							}
						});
					}

					app.invoke('util-view-table',
					{
						container: 'util-view-search-show-view',
						context: 'util-view-search-show-view',
						object: search.object,
						filters: filters,
						options: search.options,
						format: search.format
					});
				}
			}
		}
	});

	app.add(
	{
		name: 'util-view-search-export',
		code: function (param)
		{
			app.invoke('util-export-table',
			{
				scope: 'util-view-search-show-view',
				filename: param.dataContext.filename + '-' + moment().format('DDMMMYYYY-HHmm').toUpperCase() + '.csv'
			});
		}
	});

	app.add(
	{
		name: 'util-view-search-select-init',
		code: function (param)
		{
			var searches = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'searches'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var search = _.find(searches, function (search) {return search.name == name});

			mydigitalstructure._util.data.clear(
			{
				scope: 'util-view-search-select',
				context: 'inputIndex'
			});

			if (search != undefined)
			{
				var context = app._util.param.get(param.dataContext, 'context').value;

				if (context != undefined)
				{
					var inputs = app.set(
					{
						scope: 'util-view-search-select',
						context: 'inputs',
						value: $('[data-context="' + context + '"] input.myds-view-table-select:checked')
					});

					if (inputs.length != 0)
					{
						app.invoke('util-view-search-select-process');
					}
				}
			}
		}
	});

	app.add(
	{
		name: 'util-view-search-select-process',
		code: function (param)
		{
			var inputIndex = app.get(
			{
				scope: 'util-view-search-select',
				context: 'inputIndex',
				valueDefault: 0
			});

			var inputs = app.get(
			{
				scope: 'util-view-search-select',
				context: 'inputs'
			});

			var searches = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'searches'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var search = _.find(searches, function (search) {return search.name == name});

			if (search != undefined)
			{
				if (inputIndex != 0)
				{
					var inputPrevious = inputs[inputIndex - 1];
					$('#' + inputPrevious.id + '-container').html('<i class="far fa-check-circle text-muted"></i>');
				}

				if (inputIndex < inputs.length)
				{
					var input = inputs[inputIndex];

					inputIndex = inputIndex + 1;
					app.set(
					{
						scope: 'util-view-search-select',
						context: 'inputIndex',
						value: inputIndex
					});

					$('#' + input.id + '-container').html('<span class="spinner-border spinner-border-sm myds-spinner" role="status" aria-hidden="true"></span>');

					app.invoke(search.options.select.controller, input)
				}
				else
				{
					app.invoke('util-view-search-select-finalise')
				}
			}
		}
	});

	app.add(
	{
		name: 'util-view-search-select-finalise',
		code: function (param)
		{
			var searches = app.get(
			{
				scope: 'util-view-search-initialise',
				context: 'searches'
			});

			var name = app.get(
			{
				scope: 'util-view-search-show',
				context: 'name'
			});

			var search = _.find(searches, function (search) {return search.name == name});

			if (search != undefined)
			{
				if (_.has(search, 'options.select.controllerFinalise'))
				{
					app.invoke(search.options.select.controllerFinalise)
				}
			}
		}
	});

}

