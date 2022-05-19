/*
dashboards = 
[
	{
		name: 'dashboard-hello-contacts',
		notes: '',
		containerSelector: '#dashboard-1',
		template: '<strong>{{count}}</strong>',
		queryController: undefined,
		responseController: undefined,
		storage:
		{
			object: 'contact_person',
			name: 'contact_person',
			fields:
			[
				{name: 'count(id) count'}
			]
		}
]
*/

mydigitalstructure._util.factory.dashboard = function (param)
{
	mydigitalstructure._util.controller.add(
	[
		{
			name: 'util-dashboard',
			code: function (param)
			{
				var dashboards = app._util.param.get(param, 'dashboards').value;

				if (dashboards == undefined)
				{
					dashboards = app.get(
					{
						scope: 'util-dashboard',
						context: 'dashboards'
					});
				}
				else
				{
					app.set(
					{
						scope: 'util-dashboard',
						context: 'dashboards',
						value: dashboards
					});
				}

				if (dashboards != undefined)
				{
					_.each(dashboards, function (dashboard)
					{
						app.invoke('util-dashboard-initialise', {dashboard: dashboard});
					});
				}
			}
		},
		{
			name: 'util-dashboard-initialise',
			code: function (param)
			{
				var dashboard = app._util.param.get(param, 'dashboard').value;

				app._util.data.clear(
				{
					scope: 'util-dashboard',
					context: dashboard.name,
					name: 'dataIndex'
				});

				if (_.has(dashboard, 'initialise.controller'))
				{
					//It must invoke util-dashboard-process controller when complete.
					mydigitalstructure._util.controller.invoke(dashboard.initialise.controller, param)
				}
				else
				{
					mydigitalstructure._util.controller.invoke('util-dashboard-process', param);
				}
			}
		},
		{
			name: 'util-dashboard-process',
			code: function (param)
			{
				var dashboard = app._util.param.get(param, 'dashboard').value;

				if (dashboard.queryController != undefined)
				{
					app.invoke(dashboard.queryController, param)
				}
				else
				{
					dashboard.storage.callback = 'util-dashboard-render';
					dashboard.storage.callbackParam = param;

					if (dashboard.storage.fields == undefined)
					{
						dashboard.storage.fields = 
						[
							{name: 'count(id) count'}
						]
					}

					mydigitalstructure.cloud.retrieve(dashboard.storage);
				}
			}
		},
		{
			name: 'util-dashboard-render',
			code: function (param, response)
			{
				var dashboard = app._util.param.get(param, 'dashboard').value;

				if (response != undefined)
				{
					var data = response.data.rows;

					if (!dashboard.multiple) {data = _.first(response.data.rows)}

					if (dashboard.responseController)
					{
						data = app.invoke(dashboard.responseController, param, data)
					}
					
					app.set(
					{
						scope: 'util-dashboard',
						context: dashboard.name,
						name: 'data',
						value: data
					});

					if (dashboard.renderController)
					{
						app.invoke(dashboard.renderController, param, data)
					}
					else
					{
						if (!dashboard.multiple)
						{
							if (dashboard.containerSelector == undefined)
							{
								dashboard.containerSelector = '#' + dashboard.name
							}

							if (dashboard.template == undefined)
							{
								dashboard.template = '{{count}}'
							}
							
							app.refresh(
							{
								selector: dashboard.containerSelector,
								template: dashboard.template,
								data: data
							});
						}
					}
				}
			}
		}
	]);
}





