if (mydigitalstructure._util.import == undefined)
{
	mydigitalstructure._util.import = {}
}

//Uses https://github.com/sheetjs/sheetjs to create XLSX

if (_.isObject(XLSX))
{
	mydigitalstructure._util.import.sheet =
	{
		data: {},

		init: function (e)
 		{
  			var files = e.target.files
  			var file = files[0];
  			var reader = new FileReader();

            if (file != undefined)
            {
                mydigitalstructure._util.import.sheet.data.uploadFile = file;

                mydigitalstructure._util.import.sheet.data.controller = $(e.target).attr('data-controller');
                mydigitalstructure._util.import.sheet.data.controllerError = $(e.target).attr('data-controller-error');
                mydigitalstructure._util.import.sheet.data.scope = $(e.target).attr('data-scope');
                mydigitalstructure._util.import.sheet.data.context = $(e.target).attr('data-context');
                mydigitalstructure._util.import.sheet.data.version = $(e.target).attr('data-version');
                mydigitalstructure._util.import.sheet.data.useNameIfExists = $(e.target).attr('data-use-name-if-exists');

                mydigitalstructure._util.import.sheet.data.validate = {errors: false, _errors: {}, status: ($(e.target).attr('data-validate') == 'true')};

                if (mydigitalstructure._util.import.sheet.data.scope == undefined)
                {
                    mydigitalstructure._util.import.sheet.data.scope = mydigitalstructure._util.import.sheet.data.controller
                }

                var format = mydigitalstructure._util.data.get(
                {
                    scope: mydigitalstructure._util.import.sheet.data.scope,
                    context: mydigitalstructure._util.import.sheet.data.context,
                    name: 'import-format'
                });

                if (format != undefined)
                {
                    mydigitalstructure._util.import.sheet.data.format = format.fields
                }

                mydigitalstructure._util.import.sheet.data.formatTemplate = mydigitalstructure._util.data.get(
                {
                    scope: mydigitalstructure._util.import.sheet.data.scope,
                    context: mydigitalstructure._util.import.sheet.data.context,
                    name: 'import-format-template'
                })

                reader.onload = function(e)
                {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, {type: 'array', bookImages: true});

                    mydigitalstructure._util.import.sheet.data.workbook = workbook;

                    var validWorkbook = (workbook.Workbook != undefined);

                    if (validWorkbook)
                    {
                        if (workbook.Custprops != undefined)
                        {
                            if (workbook.Custprops.Name != mydigitalstructure._util.import.sheet.data.context)
                            {
                                validWorkbook = false;
                            }

                            if (validWorkbook && mydigitalstructure._util.import.sheet.data.version != undefined)
                            {
                                if (workbook.Custprops.Version != mydigitalstructure._util.import.sheet.data.version)
                                {
                                    validWorkbook = false;
                                }
                            }
                        }
                    }

                    if (mydigitalstructure._util.import.sheet.data.controller == undefined)
                    {
                        console.log('Import Excel; No Controller Set!')
                    }
                    else if (!validWorkbook)
                    {
                        if (mydigitalstructure._util.import.sheet.data.controllerError != undefined)
                        {
                            mydigitalstructure._util.controller.invoke(mydigitalstructure._util.import.sheet.data.controllerError,
                            {
                                error: 'not-valid-excel-file'
                            })
                        }
                        else
                        {
                            mydigitalstructure._util.sendToView(
                            {
                                from: 'myds-import-sheet',
                                status: 'error',
                                message: 'not-valid-excel-file'
                            });
                        }	
                }
                else
                {
                    mydigitalstructure._util.import.sheet.data.names = workbook.Workbook.Names;
                    mydigitalstructure._util.import.sheet.data.lastmodifieddate = moment(workbook.Props.ModifiedDate).format('DD MMM YYYY HH:mm:ss');
                    mydigitalstructure._util.import.sheet.data.processed = {};

                    //PROCESS SHEETS
                    mydigitalstructure._util.import.sheet.data.sheets = {};

                    _.each(mydigitalstructure._util.import.sheet.data.workbook.SheetNames, function (sheetName, sheetIndex)
                    {
                        var sheet = mydigitalstructure._util.import.sheet.data.workbook.Sheets[sheetName];
                        var rows = [];

                        if (sheetIndex == 0)
                        {
                            mydigitalstructure._util.import.sheet.data.defaultSheetName = sheetName;
                        }

                        _.each(sheet, function (value, key)
                        {
                            if (!_.startsWith(key, '!'))
                            {
                                rows.push(numeral(key).value())
                            }
                        });

                        mydigitalstructure._util.import.sheet.data.sheets[sheetName] =
                        {
                            rows: rows,
                            maximumRow: _.max(rows)
                        }
                    });

                    //PROCESS IMAGES
                    mydigitalstructure._util.import.sheet.data.processed._images = {}

                    _.each(mydigitalstructure._util.import.sheet.data.workbook.SheetNames, function (sheetName)
                    {
                        var sheet = mydigitalstructure._util.import.sheet.data.workbook.Sheets[sheetName];
                        mydigitalstructure._util.import.sheet.data.sheets[sheetName].images = sheet["!images"];

                        if (mydigitalstructure._util.import.sheet.data.sheets[sheetName].images != undefined)
                        {
                            mydigitalstructure._util.import.sheet.data.processed._images[sheetName] = []

                            _.each(mydigitalstructure._util.import.sheet.data.sheets[sheetName].images, function (image)
                            {
                                image.type = _.last(_.split(image['!path'], '.'));
                                image.filename = _.last(_.split(image['!path'], '/'));
                                image.src = 'data:image/' + image.type + ';base64,' + btoa(image['!data']);
                                image._img = document.createElement('img');
                                    image._img.src = image.src;

                                    mydigitalstructure._util.import.sheet.data.processed._images[sheetName].push(image);
                            });
                        }
                    });

                    //PROCESS TEMPLATES
                    _.each(mydigitalstructure._util.import.sheet.data.formatTemplate, function (formatTemplate)
                    {
                            _.each(formatTemplate.names, function (name)
                            {
                                var format = 
                                {
                                    sheet: formatTemplate.sheet,
                                    cell: (formatTemplate.cell!=undefined?_.replaceAll(formatTemplate.cell, '{{name}}', name):undefined),
                                    name: formatTemplate.prefix + name,
                                    format: formatTemplate.format,
                                    caption: (formatTemplate.caption!=undefined?_.replaceAll(formatTemplate.caption, '{{name}}', name):undefined),
                                    controller: formatTemplate.controller,
                                    validate: formatTemplate.validate,
                                }

                                if (formatTemplate.storage != undefined)
                                {
                                    format.storage = 
                                    {
                                        object: formatTemplate.storage.object,
                                        field: formatTemplate.storage.field + name
                                    }
                                }

                                mydigitalstructure._util.import.sheet.data.format.push(format);
                            });
                        });

                    //PRE-PROCESS FORMATS
                    _.each(mydigitalstructure._util.import.sheet.data.format, function (format, f)
                    {
                            format._processing = {notes: {cell: 'not-set', sheet:'not-set'}, validate: {errors: false}}
                    
                            format.namebasedoncaption = _.camelCase(format.caption).toLowerCase();
                            format.namebasedoncaption_ = format.caption.replace(/[- )(]/g,'_').replace(/[- )(]/g,'').toLowerCase()
                    
                            format._processing.name = format.name;
                        format._processing.namebasedoncaption = format.namebasedoncaption;
                        format._processing.namebasedoncaption_ = format.namebasedoncaption_;
                        });

                    //RESOLVE NAMES
                    _.each(mydigitalstructure._util.import.sheet.data.names, function (name, n)
                    {
                        name.sheet = _.replaceAll(_.first(_.split(name.Ref, '!')), "'", '');
                        name.cell = _.replaceAll(_.last(_.split(name.Ref, '!')), '\\$', '');

                        _.each(mydigitalstructure._util.import.sheet.data.format, function (format, f)
                        {
                            if ((format.name!=undefined?format.name:'').toLowerCase() == name.Name.toLowerCase() ||
                                    format.namebasedoncaption == name.Name.toLowerCase() || 
                                    format.namebasedoncaption_ == name.Name.toLowerCase())
                            {
                                var suffix = '';

                                if ((format.name!=undefined?format.name:'').toLowerCase() != name.Name.toLowerCase())
                                {
                                    if (format.namebasedoncaption == name.Name.toLowerCase())
                                    {
                                        suffix = '-based-on-caption';
                                        format._processing.name = format.namebasedoncaption;
                                    }
                                    else if (format.namebasedoncaption_ == name.Name.toLowerCase())
                                    {
                                        suffix = '-based-on-caption-underscore'
                                        format._processing.name = format.namebasedoncaption_;
                                    }
                                }
                            
                                if (format.sheet == undefined && format.cell == undefined)
                                {
                                    format.sheet = name.sheet;
                                    format.cell = name.cell;

                                    format._processing.notes.cell = 'based-on-name' + suffix;
                                    format._processing.notes.sheet = 'based-on-name' + suffix;
                                }
                                else if (format.sheet != undefined && format.cell == undefined)
                                {
                                    if (format.sheet == name.sheet)
                                    {
                                        format.cell = name.cell;

                                        format._processing.notes.cell = 'based-on-name' + suffix;
                                    }
                                }
                                else if (mydigitalstructure._util.import.sheet.data.useNameIfExists)
                                {
                                    format.sheet = name.sheet;
                                    format.cell = name.cell;

                                    format._processing.notes.cell = 'based-on-name-as-exists' + suffix;
                                    format._processing.notes.sheet = 'based-on-name-as-exists' + suffix;
                                }	
                            }
                            
                            if (format.range != undefined)
                            {
                                if (format.range.header != undefined)
                                {
                                    if (format.range.header.name != undefined)
                                    {
                                        if (format.range.header.name.toLowerCase() == name.Name.toLowerCase())
                                        {
                                            format.range.header.cell = name.cell;
                                        }
                                    }
                                }

                                if (format.range.footer != undefined)
                                {
                                    if (format.range.footer.name != undefined)
                                    {
                                        if (format.range.footer.name.toLowerCase() == name.Name.toLowerCase())
                                        {
                                            format.range.footer.cell = name.cell;
                                        }
                                    }
                                }
                            }		
                        })
                    });

                    //POST-PROCESS FORMATS; RANGE

                    _.each(mydigitalstructure._util.import.sheet.data.format, function (format, f)
                    {
                        if (format.sheet == undefined)
                            {
                                format.sheet = mydigitalstructure._util.import.sheet.data.defaultSheetName;
                            }
                                
                            if (format.range != undefined)
                            {
                                if (format.range.header != undefined)
                                {
                                    if (format.range.header.firstRow)
                                    {
                                        format.range.header.cell =
                                            (format.range.header.firstRowColumn!=undefined?format.range.header.firstRowColumn:'A') + '1';
                                    }
                                }

                                if (format.range.footer != undefined)
                                {
                                    if (format.range.footer.lastRow)
                                    {
                                        format.range.footer.cell = (format.range.footer.lastRowColumn!=undefined?format.range.footer.lastRowColumn:'A') +
                                                (numeral(mydigitalstructure._util.import.sheet.data.sheets[format.sheet].maximumRow).value() + 1);
                                    }
                                }
                        }	
                    });

                    //PROCESS FIELD FORMATS

                    var param = 
                    {
                        context: mydigitalstructure._util.import.sheet.data.context,
                        format: 'sheet'
                    }

                    var importFormat = mydigitalstructure._util.import.sheet.data.format;

                    if (importFormat != undefined)
                    {
                            var worksheet;
                            var value;
                            var valueFormatted;
                            var comments;
                            var parent;
                            var cell;

                            _.each(importFormat, function (format)
                            {
                                if (format.name == undefined)
                                {
                                    format.name = format.namebasedoncaption;
                                }

                                if (format.sheet == undefined)
                                {
                                    format.sheet = mydigitalstructure._util.import.sheet.data.defaultSheetName;
                                }

                            if (format._processing.notes.cell == 'not-set' && format.cell != undefined)
                            { 
                                format._processing.notes.cell = 'as-set'
                            }

                            if (format._processing.notes.sheet == 'not-set' && format.sheet != undefined)
                            { 
                                format._processing.notes.sheet = 'as-set'
                            }

                                if (format.sheet != undefined)
                                {
                                    mydigitalstructure._util.import.sheet.data.currentSheetName = format.sheet;
                                }
                                else
                                {
                                    format.sheet = mydigitalstructure._util.import.sheet.data.currentSheetName;

                                    if (format.sheet != undefined)
                                { 
                                    format._processing.notes.sheet = 'based-on-preceding-format'
                                }
                                }

                                worksheet = workbook.Sheets[format.sheet];

                                value = undefined;
                                valueFormatted = undefined;
                                comments = [];

                                if (worksheet != undefined)
                                {
                                    if (format.range == undefined)
                                    {
                                        if (format.type == 'image')
                                        {
                                            if (format.index != undefined)
                                            {
                                                var image = _.find(mydigitalstructure._util.import.sheet.data.sheets[format.sheet].images,
                                                function (image)
                                                {
                                                    return (image['!relpos'].c == format.index.c && image['!relpos'].r == format.index.r)
                                                });

                                                if (image != undefined)
                                                {
                                                    value = image._img;
                                                    valueFormatted = image.src;
                                                
                                                    format._processing.filename = format.filename;

                                                    if (format.storage != undefined)
                                                    {
                                                        format._processing.object = format.storage.object;
                                                        image.storage = format.storage;
                                                    }

                                                    if (format._processing.filename == undefined)
                                                    {
                                                        format._processing.filename = (format.name!=undefined?format.name:format.namebasedoncaption) + '.' + image.type;
                                                    }

                                                    image.name = (format.name!=undefined?format.name:format.namebasedoncaption);
                                                    image.caption = format.caption;
                                                    image.filename = format._processing.filename;
                                                }
                                            }
                                        }
                                        else
                                        {
                                            cell = worksheet[format.cell];

                                            if (cell != undefined)
                                            {
                                                value = cell.w;
                                                if (value == undefined)
                                                {
                                                    value = cell.v
                                                }

                                                valueFormatted = _.trim(value);

                                                if (format.format != undefined)
                                                {
                                                    if (format.format.date != undefined)
                                                    {
                                                        if (moment(valueFormatted, format.format.date.in).isValid())
                                                        {
                                                            valueFormatted = moment(valueFormatted, format.format.date.in).format(format.format.date.out)
                                                        }
                                                    }

                                                    if (format.format.contoller != undefined)
                                                    {
                                                        valueFormatted = mydigitalstructure._util.controller.invoke(format.format.contoller, format, valueFormatted)
                                                    }
                                                }

                                                comments = cell.c;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        valueFormatted = mydigitalstructure._util.import.sheet.range(format, worksheet);
                                    }
                                }

                                if (valueFormatted == undefined)
                                {
                                    valueFormatted = format.defaultValue;
                                }

                                format._value = value;
                                format._cell = cell;
                                format.value = valueFormatted;

                                format._comments = _.map(comments, function (comment)
                                {
                                    var comment = _.last(_.split(comment.t, 'Comment:'))

                                    if (comment != undefined)
                                    {
                                        comment = _.trim(comment.replace(/[^a-zA-Z ]/g,""))
                                    }

                                    return comment;
                                });

                                parent = format.parent;
                                if (parent == undefined) {parent = _.camelCase(format.sheet)}

                                //VALIDATION
                                format._processing.validate = mydigitalstructure._util.import.validate(format, valueFormatted);

                                //PROCESSED
                                if (mydigitalstructure._util.import.sheet.data.processed[parent] == undefined)
                                {
                                    mydigitalstructure._util.import.sheet.data.processed[parent] = {}
                                }

                                mydigitalstructure._util.import.sheet.data.processed[parent][format.name] = valueFormatted;
                            });

                            mydigitalstructure._util.import.sheet.data.validate.errors =
                                !_.isEmpty(mydigitalstructure._util.import.sheet.data.validate._errors)
                    }

                    mydigitalstructure._util.data.set(
                    {
                        scope: mydigitalstructure._util.import.sheet.data.scope,
                        context: mydigitalstructure._util.import.sheet.data.context,
                        name: 'dataContext',
                        value: mydigitalstructure._util.import.sheet.data.processed
                    })
                    
                    param = mydigitalstructure._util.param.set(param, 'dataContext', mydigitalstructure._util.import.sheet.data.processed);

                    mydigitalstructure._util.data.set(
                    {
                        scope: (mydigitalstructure._util.import.sheet.data.controller!=undefined?mydigitalstructure._util.import.sheet.data.controller:mydigitalstructure._util.import.sheet.data.scope),
                        context: mydigitalstructure._util.import.sheet.data.context,
                        name: 'dataContext',
                        value: mydigitalstructure._util.import.sheet.data.processed
                    });

                    mydigitalstructure._util.data.set(
                    {
                        scope: (mydigitalstructure._util.import.sheet.data.controller!=undefined?mydigitalstructure._util.import.sheet.data.controller:mydigitalstructure._util.import.sheet.data.scope),
                        context: mydigitalstructure._util.import.sheet.data.context,
                        name: '_dataContext',
                        value: mydigitalstructure._util.import.sheet.data
                    });

                    mydigitalstructure._util.controller.invoke(mydigitalstructure._util.import.sheet.data.controller,
                                                                                param, mydigitalstructure._util.import.sheet.data)
                }
                };

                reader.readAsArrayBuffer(file);
            }
  		},

  		range: function (format, worksheet)
 		{
 			//Use range header to get cells to work through
 			//Assume cells have been resolved

 			var headerCell = format.range.header.cell; // A45
 			var headerRow = numeral(format.range.header.cell).value(); //45

 			var footerCell = format.range.footer.cell; // A53
 			var footerRow = numeral(format.range.footer.cell).value(); //53

 			var fieldsStartRow = headerRow + 1; //46
 			var fieldsEndRow = footerRow - 1; //52

 			var fields = format.range.fields;

 			var importData = []

 			var rows = _.range(fieldsStartRow, fieldsEndRow + 1);
 			var value;
 			var valueFormatted;

 			if (format.name == undefined)
 			{
 				format.name = _.camelCase(format.caption).toLowerCase();
 			}

 			_.each(rows, function (row, r)
 			{
 				rowFields = _.cloneDeep(fields);
 				
 				_.each(rowFields, function (field)
 				{
 					valueFormatted = undefined;
 					value = undefined;

 					field.suffix = (r + 1);
 					field.row = row;
 					field.cell = field.column + field.row;  

 					field._cell = worksheet[field.cell];
 					field._processing = {name: format.name + '-' + field.name + '-' + field.suffix, validate: {}, notes: {}}

					if (field._cell != undefined)
					{
						value = field._cell.w;
						if (value == undefined)
						{
							value = field._cell.v
						}

						valueFormatted = value;

						if (field.format != undefined)
						{
							if (field.format.date != undefined)
							{
								if (moment(valueFormatted, field.format.date.in).isValid())
								{
									valueFormatted = moment(valueFormatted, field.format.date.in).format(field.format.date.out)
								}
							}

							if (field.format.controller != undefined)
							{
								valueFormatted = mydigitalstructure._util.controller.invoke(field.format.controller, field, valueFormatted)
							}
						}

						field._comments = field._cell.c;
					}

					if (valueFormatted == undefined)
					{
						valueFormatted = field.defaultValue;
					}

					field.value = valueFormatted;
					field._value = value;

					//VALIDATION
					field._processing.validate = mydigitalstructure._util.import.validate(field, valueFormatted);
 				});

 				importData.push(_.cloneDeep(rowFields));
 			});

 			return importData;
 		}
  	}

	$(document).off('change', '#myds-util-import-sheet-file, .myds-util-import-sheet')
	.on('change', '#myds-util-import-sheet-file, .myds-util-import-sheet', function(event)
	{
		mydigitalstructure._util.import.sheet.init(event);
	});
}

mydigitalstructure._util.import.validate = function (field, valueFormatted)
{
	var processingErrors = [];
	var validateErrors = {};
	var validateControllerErrors;
	var returnData = {};

	if (field.validate != undefined)
	{	
		if (field.validate.mandatory && (valueFormatted == '' || valueFormatted == undefined))
		{
			processingErrors.push('mandatory');
			validateErrors['mandatory'] = true;
		}

		if (field.validate.numeral)
		{
			if (_.isNull(numeral(valueFormatted).value()))
			{
				processingErrors.push('numeral')
				validateErrors['numeral'] = true;
			}
		}

		var maximum = field.validate.numeralMaximum;

		if (maximum != undefined &&  !_.isNull(numeral(maximum).value()))
		{
			if (!_.isNull(numeral(valueFormatted).value()))
			{
				if (numeral(valueFormatted).value() > numeral(maximum).value())
				{
					processingErrors.push('numeral-maximum')
					validateErrors['numeral-maximum'] = true;
				}
			}
		}

		var minimum = field.validate.numeralMinimum;

		if (minimum != undefined && !_.isNull(numeral(minimum).value()))
		{
			if (!_.isNull(numeral(valueFormatted).value()))
			{
				if (numeral(valueFormatted).value() < numeral(minimum).value())
				{
					processingErrors.push('numeral-minimum')
					validateErrors['numeral-minimum'] = true;
				}
			}
		}

		var maximumLength = field.validate.maximumLength;

		if (maximumLength != undefined)
		{
			if (valueFormatted == undefined)
			{
				console.log('validate-undefined:')
				console.log(field)
			}
			else
			{
				if (numeral(valueFormatted.length).value() > numeral(maximumLength).value())
				{
					processingErrors.push('maximum-length')
					validateErrors['maximum-length'] = true;
				}
			}
		}

		var minimumLength = field.validate.minimumLength;

		if (minimumLength != undefined)
		{
			if (numeral(valueFormatted.length).value() < numeral(minimumLength).value())
			{
				processingErrors.push('minimum-length')
				validateErrors['minimum-length'] = true;
			}
		}

		if (field.validate.email)
		{
			if (!mydigitalstructure._util.validate.isEmail(valueFormatted))
			{
				processingErrors.push('email')
				validateErrors['email'] = true;
			}
		}

		if (field.validate.date)
		{
			if (!mydigitalstructure._util.validate.isDate(valueFormatted))
			{
				processingErrors.push('date')
				validateErrors['date'] = true;
			}
		}

		if (field.validate.allowed != undefined)
		{
			var values = field.validate.allowed.values;

			if (values == undefined && field.validate.allowed.data)
			{
			 	values = app.get(field.validate.allowed.data);
			}

			if (_.indexOf(values, valueFormatted) == -1)
			{
				processingErrors.push('allowed-value')
				validateErrors['allowed-value'] = true;
			}
		}

		if (field.validate.controller != undefined)
		{
			validateControllerErrors = mydigitalstructure._util.controller.invoke(field.validate.controller, field, valueFormatted);
			validateErrors = _.assign(validateErrors, validateControllerErrors);

			_.each(validateControllerErrors, function (value, key)
			{
				if (value == true)
				{
					processingErrors.push(key);
				}
			})
		}

		if (processingErrors.length != 0)
		{
			if (field._processing != undefined)
			{
				if (field._processing.name != undefined)
				{
					mydigitalstructure._util.import.sheet.data.validate._errors[field._processing.name] = validateErrors;
				}
			}

			returnData =
			{
				errors: (processingErrors.length != 0),
				_errors: validateErrors,
				_errorsList: processingErrors
			}
		}
	}

	return returnData;
}

mydigitalstructure._util.factory.import = function (param)
{
	app.add(
	{
		name: 'util-import-sheet',
		code: function (event)
		{	
			mydigitalstructure._util.import.sheet.init(event);
		}
	});

	app.add(
	{
		name: 'util-import-upload-attach',
		code: function (param)
		{	
			var context = mydigitalstructure._util.param.get(param.dataContext, 'context').value;
	
			mydigitalstructure._util.data.set(
			{
				scope: 'util-import',
				context: 'context',
				value: context
			});

			if ($('#myds-util-attachment-upload-import-file0').val() == '')
			{	
				$('#util-import-upload-no-file').removeClass('hidden d-none');

				mydigitalstructure._util.view.refresh(
				{
						selector: '#util-import-status',
						template: 'No file to upload!'
					}
				);

				app.invoke('util-view-spinner-remove', {controller: 'util-import-upload-attach'});
			
				mydigitalstructure._util.sendToView(
				{
					from: 'myds-util-attachments-upload',
					status: 'error',
					message: 'No file to upload'
				});
			}
			else
			{
				$.ajax(
				{
					type: 'POST',
					url: '/rpc/setup/?method=SETUP_IMPORT_MANAGE',
					success: function(response)
					{
						mydigitalstructure._util.data.set(
						{
							scope: 'util-import',
							context: 'id',
							value: response.id
						});

						$('#myds-util-attachment-upload-import-objectcontext').val(response.id);

						mydigitalstructure._util.attachment.upload(
						{
							context: 'myds-util-attachment-upload-import',
							id: response.id,
							callback: 'util-import-upload-attach-process'
						})
					}
				});
			}
		}
	});

	app.add(
	{
		name: 'util-import-upload-attach-process',
		code: function (param, response)
		{
			if (param.attachments == undefined && response == undefined)
			{	
				mydigitalstructure.retrieve(
				{
					object: 'core_attachment',
					data:
					{
						criteria:
						{
							fields:
							[
								{name: 'type'},
								{name: 'filename'},
								{name: 'description'},
								{name: 'download'},
								{name: 'modifieddate'},
								{name: 'attachment'}
							],
							filters:
							[
								{
									name: 'object',
									comparison: 'EQUAL_TO',
									value1: 29
								}
							],
							sorts:
							[
								{
									name: 'id',
									direction: 'desc'
								}
							],
							options:
							{
								rows: 1
							}
						}
					},
					callback: 'util-import-upload-attach-process'
				});	
			}
			else
			{
				var attachment;

				if (param.attachments != undefined)
				{
					attachment = param.attachments[0];
					attachment.id = attachment.attachmentlink
				}
				else
				{
					if (response.data.rows.length > 0)
					{
						attachment = response.data.rows[0];
					}
				}

				if (attachment != undefined)
				{	
					var imports = mydigitalstructure._util.data.get(
					{
						scope: 'util-import',
						context: 'imports'
					});

					var context = mydigitalstructure._util.data.get(
					{
						scope: 'util-import',
						context: 'context'
					});

					var utilImport = _.filter(imports, function (i) {return i.name == context})[0];

					if (utilImport.columns == undefined)
					{
						utilImport.columns = utilImport.fields;

						_.each(utilImport.columns, function (column)
						{
							column.title = column.name
						});
					}
					
					if (utilImport.columns != undefined)
					{
						var data = 
						{
							columns: utilImport.columns,
							delimeter: ',',
							firstlineiscaptions: 'Y',
							id: attachment.id,
							allcolumnstext: 'Y'
						}

						$.ajax(
						{
							type: 'POST',
							url: '/rpc/core/?method=CORE_ATTACHMENT_READ&rows=500',
							data: data,
							dataType: 'json',
							success: function(response)
							{
								mydigitalstructure._util.data.clear(
								{
									scope: 'util-import',
									context: 'dataIndex'
								});

								mydigitalstructure._util.data.set(
								{
									scope: 'util-import',
									context: 'raw',
									value: response.data.rows
								});

								if (utilImport.initialise.controller != undefined)
								{
									//It must invoke util-import-process controller when complete.
									mydigitalstructure._util.controller.invoke(utilImport.initialise.controller, param)
								}
								else
								{
									mydigitalstructure._util.controller.invoke('util-import-process', param);
								}
							}
						});
					}
				}	
			}
		}
	});

	app.add(
	{
		name: 'util-import-find',
		code: function (param, response)
		{		
			app.controller['util-import-find'] = function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller', {'default': 'setup'}).value;
				var context = mydigitalstructure._util.param.get(param, 'context').value;
				var value = mydigitalstructure._util.param.get(param, 'value').value;
				var defaultValue = mydigitalstructure._util.param.get(param, 'defaultValue').value;

				var returnValue = _.find(app.data.setup[context], function (data) {return _.lowerCase(data.title) == _.lowerCase(value)});

				if (_.isObject(returnValue))
				{
					returnValue = returnValue.id
				}
				else
				{
					returnValue = defaultValue
				}

				return returnValue
			}
		}
	});

	app.add(
	{
		name: 'util-import-initialise-storage',
		code: function (param)
		{	
			var initialise = mydigitalstructure._util.param.get(param, 'initialise').value;

			if (initialise == undefined)
			{
				var importFormats = app.get(
				{
					scope: 'util-import',
					context: 'imports'
				});

				var name = app._util.param.get(param, 'name').value;

				if (name == undefined)
				{
					name = app._util.param.get(param, 'context').value;
				}

				if (name == undefined)
				{
					name = app.get(
					{
						scope: 'util-import',
						context: 'context'
					});
				}

				var importFormat = _.find(importFormats, function (importFormat) {return importFormat.name == name});

				if (importFormat != undefined)
				{
					initialise = importFormat.initialise
				}
			}

			var storageIndex = app.get(
			{
				scope: 'util-import-initialise-storage',
				context: 'storageIndex',
				valueDefault: 0
			});

			if (storageIndex < initialise.storage.length)
			{
				var importStorage = initialise.storage[storageIndex];

				app.set(
				{
					scope: 'util-import-initialise-storage',
					context: 'storageIndex',
					value: storageIndex + 1
				});

				app.show('#util-import-status', '<h2 class="my-4 text-muted">Initialising (Getting data)... ' + importStorage.object + '</h2>');
		
                if (importStorage.customOptions == undefined)
                {
                    importStorage.customOptions = importStorage.customoptions
                }

				mydigitalstructure.cloud.retrieve(
				{
					object: importStorage.object,
					fields: importStorage.fields,
					filters: importStorage.filters,
					set:
					{
						scope: 'util-import',
						context: 'in-cloud-storage',
						name: (importStorage.name!=undefined?importStorage.name:importStorage.object)
					},
					options: {rows: 99999},
                    customOptions: importStorage.customOptions,
					callback: 'util-import-initialise-storage',
					callbackParam: param
				});
			}
			else
			{
				app.set(
				{
					scope: 'util-import-initialise-storage',
					context: 'storageIndex',
					value: 0
				});

				var callback = mydigitalstructure._util.param.get(param, 'callback', {default: 'util-import-process'}).value;

				app.invoke(callback, param)
			}
		}
	});

	app.add(
	{
		name: 'util-import-retrieve-from-storage',
		code: function (param)
		{
			app.invoke('util-import-initialise-storage', param)
		}
	});

	app.add(
	{
		name: 'util-import-update-storage',
		code: function (param)
		{	
			var saveToCloudStorages = app.get(
			{
				scope: 'util-import',
				context: 'save-to-cloud-storage'
			});

			var saveToCloudStorageIndex = app.get(
			{
				scope: 'util-import-update-storage',
				context: 'saveToCloudStorageIndex',
				valueDefault: 0
			});

			if (saveToCloudStorageIndex < saveToCloudStorages.length)
			{
				var saveToCloudStorage = saveToCloudStorages[saveToCloudStorageIndex];

				var importObjects = app.get(
				{
					scope: 'util-import',
					context: 'objects'
				});

				if (importObjects != undefined)
				{
					var importObject = importObjects[saveToCloudStorage.index];

					_.each(saveToCloudStorage.data, function (value, key)
					{
						if (_.isObject(value) && importObject != undefined)
						{
							if (importObject[value.object] == undefined)
							{
								importObject[value.object] = {}
							}

							saveToCloudStorage.data[key] = importObject[value.object][value.field]
						}
					});
				}

				app.show('#util-import-status', '<h3 class="my-4 text-muted">Saving to cloud... ' +
					saveToCloudStorage.object + '... ' + (saveToCloudStorageIndex+1) + ' of ' + saveToCloudStorages.length + '</h3>');

				mydigitalstructure.cloud.save(
				{
					object: saveToCloudStorage.object,
					data: saveToCloudStorage.data,
					callback: 'util-import-update-storage-next',
					callbackParam: param
				});
			}
			else
			{
				console.log('cloud storage updated');
			}
		}
	});

	app.add(
	{
		name: 'util-import-update-storage-next',
		code: function (param, response)
		{	
			var saveToCloudStorages = app.get(
			{
				scope: 'util-import',
				context: 'save-to-cloud-storage'
			});

			var saveToCloudStorageIndex = app.get(
			{
				scope: 'util-import-update-storage',
				context: 'saveToCloudStorageIndex',
				valueDefault: 0
			});

			var saveToCloudStorage = saveToCloudStorages[saveToCloudStorageIndex];

			var importObjects = app.get(
			{
				scope: 'util-import',
				context: 'objects'
			});

			if (importObjects != undefined)
			{
				var importObject = importObjects[saveToCloudStorage.index];

				if (importObject != undefined && saveToCloudStorage.objectName != undefined)
				{
					var field = saveToCloudStorage.objectField;
					if (field == undefined) {field = 'id'}

					if (importObject[saveToCloudStorage.objectName] == undefined)
					{
						importObject[saveToCloudStorage.objectName] = {}
					}

					if (_.isObject(importObject[saveToCloudStorage.objectName]))
					{
						importObject[saveToCloudStorage.objectName][field] = response.id
					}
				}
			}
					
			app.set(
			{
				scope: 'util-import-update-storage',
				context: 'saveToCloudStorageIndex',
				value: saveToCloudStorageIndex + 1
			});	

			app.invoke('util-import-update-storage')
		}
	});

	app.add(
	{
		name: 'util-import-process',
		code: function (param, response)
		{	
			var context = app.data["util-import"].context;

			if (context != undefined)
			{
				var utilImport = _.find(app.data['util-import'].imports, function (i) {return i.name == context});

				if (utilImport != undefined)
				{
					param = mydigitalstructure._util.param.set(param, 'import', utilImport);

					var processController = utilImport.processController;
					var preProcessController = utilImport.preProcessController;

					if (processController == undefined)
					{
						processController = 'util-import-process' + context
					}

					if (_.isFunction(app.controller[processController]))
					{
						if (app.data["util-import"].dataIndex == undefined)
						{
							app.data["util-import"].dataIndex = 0;
							app.data['util-import'].processing = [];
						}
						else
						{
							if (response != undefined)
							{
								if (response.status == 'OK')
								{
									if (_.last(app.data['util-import'].processing) != undefined)
									{
										_.last(app.data['util-import'].processing)._status = 'imported-' + 
												_.lowerCase(response.notes)
										
										_.last(app.data['util-import'].processing).response = response;
									}
								}
								else
								{
									_.last(app.data['util-import'].processing)._status = 'error-' + 
											_.lowerCase(response.error.errornotes)
								}
							}
							else
							{
								_.last(app.data['util-import'].processing)._status = 'preprocessing'							
							}

							app.data["util-import"].dataIndex++;
						}	

						if (app.data["util-import"].dataIndex < app.data["util-import"].raw.length)
						{	
							rawData = app.data["util-import"].raw[app.data["util-import"].dataIndex]

							mydigitalstructure._util.view.refresh(
							{
									selector: '#util-import-status',
									template: utilImport.statusTemplate,
									data: rawData
								}
							);

							app.data['util-import'].processing.push(
							{
								index: app.data["util-import"].dataIndex,
								rawData: rawData
							});

							param = mydigitalstructure._util.param.set(param, 'processing', _.last(app.data['util-import'].processing))

							if (preProcessController != undefined)
							{
								app.invoke(preProcessController, param, rawData);
							}
							else
							{
								app.invoke('util-import-process', param);
							}	
						}
						else
						{
							app.data["util-import"].status = _.groupBy(app.data['util-import'].processing, '_status');

							var importRawData = app.data["util-import"].raw;

							//Process Fields for storage
							
							var storageFields = _.filter(utilImport.fields, function (field)
							{
								return field.storage != undefined
							});

							var importStorageData = [];
							var importObjectData = [];
							var storageData;

							_.each(importRawData, function (rawData)
							{
								storageData = {};
								objectData = {};

								_.each(storageFields, function (storageField)
								{	
									if (storageField.storage.object != undefined)
									{
										if (objectData[storageField.storage.object] == undefined)
										{
											objectData[storageField.storage.object] = {}
										}

										if (storageData[storageField.storage.object] == undefined)
										{
											storageData[storageField.storage.object] = {}
										}
									}

									if (storageField.storage.field != undefined)
									{
										storageField._value = rawData[storageField.name];
										storageField.valueFormatted = storageField._value;

										if (storageField.format != undefined)
										{
											if (storageField.format.date != undefined)
											{
												if (moment(storageField.valueFormatted, storageField.format.date.in).isValid())
												{
													storageField.valueFormatted = moment(storageField.valueFormatted, storageField.format.date.in).format(storageField.format.date.out)
												}
											}

											if (storageField.format.contoller != undefined)
											{
												storageField.valueFormatted = mydigitalstructure._util.controller.invoke(storageField.format.contoller, storageField, storageField.valueFormatted)
											}

											if (storageField.format.numeral)
											{
												storageField.valueFormatted = numeral(storageField.valueFormatted).format(storageField.format.numeral)
											}

										}

										if (storageField.validate != undefined)
										{
											storageField.validate = _.assign(storageField.validate, mydigitalstructure._util.import.validate(storageField, storageField.valueFormatted))
											storageField._processing = {validate: storageField.validate};
										}

										storageData[storageField.storage.object][storageField.storage.field] = {value: storageField.valueFormatted, validate: storageField.validate, object: storageField.storage.object};
										objectData[storageField.storage.object][storageField.storage.field] = storageField.valueFormatted
									}
								});

								importStorageData.push(storageData);
								importObjectData.push(objectData);
							});

							app.set(
							{
								scope: 'util-import',
								context: 'storage',
								value: importStorageData
							});

							app.set(
							{
								scope: 'util-import',
								context: 'objects',
								value: importObjectData
							})

							app.invoke(utilImport.processController, param, app.data['util-import'])
						}	
					}
				}
			}
		}
	});
}

mydigitalstructure._util.import.sheet.store =
{
	save: function (param, fileData)
	{
		var filename = mydigitalstructure._util.param.get(param, 'filename', {default: 'uploaded-checklist.xlsx'}).value;
		var object = mydigitalstructure._util.param.get(param, 'object').value;
		var objectContext = mydigitalstructure._util.param.get(param, 'objectContext').value;
		var base64 = mydigitalstructure._util.param.get(param, 'base64', {default: false}).value;
		var type = mydigitalstructure._util.param.get(param, 'type').value;

		if (base64)
		{
			mydigitalstructure.cloud.invoke(
			{
				method: 'core_attachment_from_base64',
				data:
				{
					base64: fileData.base64,
					filename: filename,
					object: object,
					objectcontext: objectContext
				},
				callback: mydigitalstructure._util.import.sheet.store.process,
				callbackParam: param
			});
		}
		else
		{
			var blob = new Blob([fileData.binary], {type: 'application/octet-stream'});

			var formData = new FormData();
			formData.append('file0', blob);
			formData.append('filename0', filename);
			formData.append('object', object);
			formData.append('objectcontext', objectContext);
			
			if (!_.isUndefined(type))
			{
				formData.append('type0', type);
			}

			$.ajax('/rpc/attach/?method=ATTACH_FILE',
			{
				method: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function(data)
				{
					mydigitalstructure._util.import.sheet.store.process(param, data)
				},
				error: function(data)
				{
					app.notify(data)
				}
			});
		}
	},

	process: function (param, response)
	{
		var controller = mydigitalstructure._util.param.get(param, 'controller').value;
		var compress = mydigitalstructure._util.param.get(param, 'compress', {default: false}).value;

		if (response.status == 'OK')
		{
			var attachment;

			if (_.has(response, 'data.rows'))
			{
				attachment = _.first(response.data.rows);
			}
			else
			{
				attachment = response;
			}

			mydigitalstructure._util.import.sheet.data.attachment =
			{
				id: attachment.attachment,
				link: attachment.attachmentlink,
				href: '/download/' + attachment.attachmentlink
			}
		}

		param = mydigitalstructure._util.param.set(param, 'data', mydigitalstructure._util.import.sheet.data);
		mydigitalstructure._util.controller.invoke('util-view-spinner-remove', {controller: 'util-export-create-sheet'});	
		mydigitalstructure._util.onComplete(param);
	}
}
