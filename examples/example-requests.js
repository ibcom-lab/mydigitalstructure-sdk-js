
mydigitalstructure.register(
{
	spacename: '',
	firstname: '',
	surname: '',
	email: '',
	notes: '',
	emaildocument: ,
	site: ,
	callback: 
});

mydigitalstructure.register(
{
	spacename: 'Test-1',
	firstname: 'Test-1-firstname',
	surname: 'Test-1-surname',
	email: 'Test-1@email.com',
	notes: '',
	emaildocument: undefined,
	site: 355,
	callback: undefined
});

mydigitalstructure.auth(
{
	logon: 'Test-1@email.com',
	password: 'water57'
});

mydigitalstructure.register(
{
	object: 'website',
	callback: undefined
});

mydigitalstructure.register(
{
	object: 'website',
	templateName: 'bootstrap',
	callback: undefined
});