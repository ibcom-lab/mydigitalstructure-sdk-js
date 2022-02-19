mydigitalstructure._util.local =
{
	cache:
	{
		save: function (param)
		{
			var key = mydigitalstructure._util.param.get(param, 'key').value;
			var persist = mydigitalstructure._util.param.get(param, 'persist', {default: false}).value;
			var storage = (persist?localStorage:sessionStorage);
			var data = mydigitalstructure._util.param.get(param, 'data').value;
			var onComplete = mydigitalstructure._util.param.get(param, 'onComplete').value;

			if (typeof data != 'string')
			{
				data = JSON.stringify(data);
			}
	
			storage.setItem(key, data);
	
			if (onComplete != undefined)
			{
				mydigitalstructure._util.onComplete(param);
			}
		}, 

		search: function (param, response)
		{
			var key = mydigitalstructure._util.param.get(param, 'key').value;
			var persist = mydigitalstructure._util.param.get(param, 'persist', {default: false}).value;
			var storage = (persist?localStorage:sessionStorage);
			var isJSON = mydigitalstructure._util.param.get(param, 'isJSON', {default: key.toLowerCase().indexOf('.json') != -1}).value;
			var onComplete = mydigitalstructure._util.param.get(param, 'onComplete').value;
	
			var data = storage.getItem(key);
	
			if (data == null) {data = undefined}
	
			if (isJSON && data !== undefined)
			{
				data = JSON.parse(data);
			}
	
			if (onComplete != undefined)
			{
				param = mydigitalstructure._util.param.set(param, 'data', data);
				mydigitalstructure._util.onComplete(param);
			}
			else
			{
				return data;
			}
		},

		remove: function (param, response)
		{
			var key = mydigitalstructure._util.param.get(param, 'key').value;
			var persist = mydigitalstructure._util.param.get(param, 'persist', {default: false}).value;
			var storage = (persist?localStorage:sessionStorage);
			var all = mydigitalstructure._util.param.get(param, 'all', {default: false}).value;
	
			if (all)
			{
				storage.clear()
			}
			else
			{
				storage.removeItem(key);
			}	
	
			mydigitalstructure._util.onComplete(param);
		}
	}
}

mydigitalstructure._util.factory.local = function (param)
{
	mydigitalstructure._util.controller.add(
	{
		name: 'util-local-cache-save',
		code: function (param)
		{
			mydigitalstructure._util.local.cache.save(param)
		}
	});

	mydigitalstructure._util.controller.add(
	{
		name: 'util-local-cache-search',
		code: function (param)
		{
			mydigitalstructure._util.local.cache.search(param)
		}
	});

	mydigitalstructure._util.controller.add(
	{
		name: 'util-local-cache-remove',
		code: function (param)
		{
			mydigitalstructure._util.local.cache.remove(param)
		}
	});
}