//Uses fullcalendar
// https://fullcalendar.io


mydigitalstructure._util.factory.calendar = function (param)
{
	app.add(
	{
		name: 'util-view-calendar',
		code: function (param)
		{
			var height = mydigitalstructure._util.param.get(param, 'height', {"default": '370px'}).value;
			var calendarEl = document.getElementById('calendar');
			var calendar = new FullCalendar.Calendar(calendarEl, {})
		}
	})
}