/*
'#myds-util-import-sheet-file, .myds-util-import-sheet' >
mydigitalstructure._util.import.sheet.init:
uses 'import-format' in the data-scope
calls data-controller when done
*/

app.set(
{
	scope: 'util-import-sheet-person',
	context: 'person',
	name: 'import-format',
	value:
	{
		initialise:
		{
			storage:
			[
				{
					object: 'contact_person',
					name: 'contact_person',
					fields:
					[
						{name: 'firstname'},
						{name: 'surname'}
					]
				}
			]
		},
		fields:
		[
			{
				caption: 'First Name',
				name: 'First_Name',
				storage:
				{
					object: 'contact_person',
					field: 'firstname'
				}
			}
		]
	}
});