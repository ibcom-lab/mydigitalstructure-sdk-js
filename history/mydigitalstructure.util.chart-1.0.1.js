/*
	{
    	title: "Util; Charting",
    	Using chartist; https://github.com/gionkunz/chartist-js

    	Works with Util Dashboard
  	}

*/

mydigitalstructure._util.factory.chart = function (param)
{
	app.add(
	{
		name: 'util-view-chart-render',
		code: function (param)
		{
			var type = app._util.param.get(param, 'type', {default: 'Bar'}).value;
			var data = app._util.param.get(param, 'data').value;
			var options = app._util.param.get(param, 'options').value;
			var viewOptions = app._util.param.get(param, 'viewOptions').value;
			var containerSelector = app._util.param.get(param, 'containerSelector').value;

			if (containerSelector != undefined)
			{
				if (_.isObject(Chartist))
				{
					new Chartist[type](containerSelector, data, options, viewOptions);
				}
			}
		}
	});
}



