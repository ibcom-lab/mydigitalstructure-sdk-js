/*
 
 headers: [{text:}]
 captions: [{text:, source:}]
 fileData: [{name: value}]
  
*/

mydigitalstructure._util.factory.export = function (param)
{
	app.controller['util-export-table'] = function (param, response)
	{
		var context = mydigitalstructure._util.param.get(param, 'context').value;
		var container = mydigitalstructure._util.param.get(param, 'container').value;
		var filename = mydigitalstructure._util.param.get(param, 'filename').value;
		var filenamePrefix = mydigitalstructure._util.param.get(param, 'filenamePrefix').value;
		var scope = mydigitalstructure._util.param.get(param, 'scope').value;

		if (context == undefined) {context = container}
		if (scope == undefined && context != undefined) {scope = '_table-' + context}

		if (scope != undefined)
		{
			var tableParam = app._util.data.get(
			{
				scope: scope,
				context: '_param'
			});

			if (tableParam == undefined)
			{
				mydigitalstructure._util.notify({message: 'There is no data to export.', type: 'danger'})
			}
			else
			{
				app._util.data.clear(
				{
					scope: scope,
					context: 'export',
					name: 'cancelProcessing'
				});

				if (tableParam.format != undefined)
				{
					var captions = $.grep(tableParam.format.columns, function (column)
					{
						return ((column.param != undefined || column.name != undefined) && (column.caption != undefined || column.exportCaption != undefined) && (column.export == undefined || column.export == true))
					});

					$.each(captions, function(c, caption)
					{
						caption.text = caption.caption;
						if (caption.exportCaption != undefined)
						{
							caption.text = caption.exportCaption;
						}

						if (caption.exportName != undefined)
						{
							caption.source = caption.exportName
						}
						else
						{
							caption.source = caption.param;
							if (caption.source == undefined) {caption.source = caption.name}
						}
					});

					app._util.data.set(
					{
						scope: scope,
						context: 'export',
						name: 'captions',
						value: captions
					});

					if (tableParam.format.row != undefined)
					{
						if (_.isFunction(tableParam.format.row.method))
						{
							app._util.data.set(
							{
								scope: scope,
								context: 'export',
								name: 'exportController',
								value: tableParam.format.row.method
							});
						}

						if (!_.isUndefined(tableParam.format.row.controller))
						{
							app._util.data.set(
							{
								scope: scope,
								context: 'export',
								name: 'exportController',
								value: tableParam.format.row.controller
							});
						}
					}

					if (tableParam.format != undefined)
					{
						var methodColumns = $.grep(tableParam.format.columns, function (column)
						{
							return (column.method != undefined || column.controller != undefined)
						});

						app._util.data.set(
						{
							scope: scope,
							context: 'export',
							name: 'exportControllerColumns',
							value: methodColumns
						});
					}

					if (filename == undefined && filenamePrefix == undefined)
					{
						filename = 'export-' + scope.replace('_table-', '') + '.csv'
					}

					app._util.data.set(
					{
						scope: scope,
						context: 'export',
						name: 'filename',
						value: filename
					});

					app.controller['util-export-download'](
					_.assign(
					{
						source: scope,
						filename: filename
					},
					param))
				}	
			}
		}
	}

	app.controller['util-export-download'] = function (param, response)
	{
		var source = mydigitalstructure._util.param.get(param, 'source').value;
		var scope = mydigitalstructure._util.param.get(param, 'scope').value;
		if (source == undefined) {source = scope}

		var filename = mydigitalstructure._util.param.get(param, 'filename').value;
		var beforeExportController = mydigitalstructure._util.param.get(param, 'beforeExportController').value;

		$('.myds-export[data-context="' + source + '"]').addClass('disabled');
		$('.myds-export[data-context="' + source + '"]').text('Downloading...');

		if (param == undefined) {param = {}}

		var exportParam = app._util.data.get(
		{
			controller: source,
			context: 'export'
		});

		var dataSource = app._util.data.get(
		{
			controller: source
		});

		if (_.isObject(response))
		{	
			var exportController = exportParam.exportController;
			var exportControllerColumns = exportParam.exportControllerColumns;
			var rows = response.data.rows;

			if (exportController != undefined)
			{
				if (!_.isFunction(exportController))
				{
					if (_.isFunction(app.controller[exportController]))
					{
						exportController = app.controller[exportController];
					}
				}	
				
				if (_.isFunction(exportController))
				{
					_.each(rows, function (row)
					{
						exportController(row)
					});
				}	
			}

			if (exportControllerColumns.length != 0)
			{
				_.each(rows, function (row)
				{
					_.each(exportControllerColumns, function (column)
					{
						if (column.name == undefined) {column.name = column.param}

						if (column.name != undefined)
						{
							if (typeof(column.method) == 'function')
							{
								row[column.name] = column.method(row)
							}

							if (typeof app.controller[column.controller] == 'function')
							{
								columnData = mydigitalstructure._util.controller.invoke({name: column.controller}, column, row);
								if (columnData != undefined) {row[column.name] = columnData}
							}
						}
					});
				});
			}

			app.data[source].all = _.concat(app.data[source].all, rows);
		}	

		var getMore = false;

		if (!_.isUndefined(dataSource.count))
		{
			if (_.gt(dataSource.count, _.size(dataSource['all'])))
			{
				getMore = true;
			}
		}

		var cancel = (exportParam.cancelProcessing == true);

		if (cancel)
		{
			app.invoke(exportParam.processing.cancelledController,
			{
				source: source
			});
		}
		else
		{
			if (getMore)
			{
				var _retrieve = mydigitalstructure._scope.data[source]._retrieve;

				var retrievedRows = _.toNumber(_.size(dataSource['all']));
				var totalRows = _.toNumber(dataSource.count);
				var rowsToRetrieve = totalRows - retrievedRows;
				var rows;

				if (_.has(exportParam.processing, 'rows'))
				{
					rows = _.toNumber(exportParam.processing.rows)
				}

				if (rows == undefined)
				{
					rows = 1000;
				}

				if (rowsToRetrieve > rows)
				{
					rowsToRetrieve = rows;
				}
			
				if (_.has(exportParam.processing, 'controller'))
				{
					app.invoke(exportParam.processing.controller,
					{
						source: source,
						percentage: parseInt((retrievedRows / totalRows) * 100)
					})
				} 

				mydigitalstructure._util.view.moreSearch(
				{
					id: _retrieve.moreid,
					startrow: _.size(dataSource['all']),
					rows: rowsToRetrieve,
					controller: 'util-export-download',
					controllerParam: param
				})
			}
			else
			{
				if (_.has(exportParam.processing, 'controller'))
				{
					app.invoke(exportParam.processing.controller,
					{
						source: source,
						percentage: 100
					})
				} 

				param.fileData = app.data[source]['all'];

				if (beforeExportController != undefined)
				{
					var _fileData = mydigitalstructure._util.controller.invoke(beforeExportController, param);
					if (_fileData != undefined)
					{
						param.fileData = _fileData
					}
				}

				app.controller['util-export-data-to-csv'](param);
			}	
		}
	}

	app.controller['util-export-data-to-csv'] = function (param, data)
	{
		var source = mydigitalstructure._util.param.get(param, 'source').value;
		
		var exportParam = app._util.data.get(
		{
			controller: source,
			context: 'export'
		});

		var fileData = mydigitalstructure._util.param.get(param, 'fileData').value;

		if (_.isUndefined(fileData))
		{
			fileData = app._util.data.get(
			{
				controller: 'util-export-0',
				context: 'filedata'
			});
		}	

		var csv = [];

		if (exportParam.headers != undefined)
		{	
			$.each(exportParam.headers, function (h, header)
			{
				csv.push('"' + header.text + '"');
				csv.push('\r\n');
			});

			csv.push('\r\n');
		}

		if (exportParam.captions != undefined)
		{
			csv.push($.map(exportParam.captions, function (caption) {return '"' + caption.text + '"'}).join(','));
			csv.push('\r\n');
		}
		
		if (fileData == undefined)
		{
			fileData = exportParam.fileData;	
		}

		if (param.filename == undefined)
		{
			param.filename = exportParam.filename;	
		}
		
		var sources;

		if (_.size(_.filter(exportParam.captions, function (c) {return c.source != undefined})) != 0)
		{
			sources = _.pluck(exportParam.captions, 'source');
		}

		if (fileData != undefined)
		{
			var rowData;
			var findParam;
			var findValue;

			$.each(fileData, function (r, row)
			{
				rowData = [];

				//if there is one column with source, then all have to have source!
				if (sources != undefined)
				{
					_.each(sources, function (source)
					{
						if (_.isObject(source))
						{
							findParam = source.find;
							if(_.isObject(findParam))
							{
								findParam.id = row[findParam.context];
								if (_.isUndefined(findParam.name)) {findParam.name = 'title'};
								findValue = app._util.data.find(findParam);
								findValue = _.toString(findValue);
								findValue = $('<p>' + he.decode(findValue) + '</p>').text();
								rowData.push('"' + (findValue==undefined?'':_.replaceAll(findValue,'"','\'')) + '"');
							}
							else
							{
								rowData.push('');
							}
						}
						else
						{
							findValue = $('<p>' + he.decode(_.toString(row[source])) + '</p>').text();

							var contents = $('<p>' + he.decode(_.toString(row[source])) + '</p>').contents();

							contents = _.filter(contents, function (content)
							{
								return (!_.isUndefined(content.data) && content.data != '\n')
							});

							findValue = _.join(_.map(contents, function (content)
							{
								var r;
								if (_.trim(content.data) != '') {r = content.data}		
								return r
							}), '; ')

							rowData.push('"' + (row[source]==undefined?'':_.replaceAll(findValue,'"','\'')) + '"');
						}	
					})
				}
				else
				{	
					for (var key in row)
			  		{
			     		if (row.hasOwnProperty(key))
			     		{
			     			rowData.push('"' + he.decode(row[key]) + '"');
			     		}  
			     	}
			    } 	

		     	csv.push(rowData.join(','));
		     	csv.push('\r\n');
			});
		}	

		if (param == undefined) {param = {}}
		param.data = csv.join('');
		app.controller['util-export-to-file'](param)
	}

	app.controller['util-export-data-as-is-to-csv'] = function (param, data)
	{
		var scope = mydigitalstructure._util.param.get(param, 'scope').value;
		var context = mydigitalstructure._util.param.get(param, 'context').value;
		var fileData = mydigitalstructure._util.param.get(param, 'fileData').value;

		if (_.isUndefined(fileData) && !_.isUndefined(scope))
		{
			fileData = app._util.data.get(
			{
				scope: scope,
				context: context
			});
		}	

		var csv = [];
	
		if (param.filename == undefined)
		{
			param.filenamePrefix = 'export';	
		}
		
		if (fileData != undefined)
		{
			var rowData;
			var findParam;
			var findValue;

			var row = _.first(fileData);
			var headerData = [];

			for (var key in row)
	  		{
	     		if (row.hasOwnProperty(key))
	     		{
	     			headerData.push('"' + key + '"'); 
	     		}  
	     	}

     		csv.push(headerData.join(','));
	     	csv.push('\r\n');

			$.each(fileData, function (r, row)
			{
				rowData = [];
				
				for (var key in row)
		  		{
		     		if (row.hasOwnProperty(key))
		     		{
		     			rowData.push('"' + he.decode(_.toString(row[key])) + '"');
		     		}  
		     	}
			    
		     	csv.push(rowData.join(','));
		     	csv.push('\r\n');
			});
		}	

		if (param == undefined) {param = {}}
		param.data = csv.join('');
		app.controller['util-export-to-file'](param)
	}	

	app.controller['util-export-to-file'] = function (param)
	{
		var fileData = mydigitalstructure._util.param.get(param, 'data').value;
		var filename = mydigitalstructure._util.param.get(param, 'filename').value;
		var filenamePrefix = mydigitalstructure._util.param.get(param, 'filenamePrefix').value;
		var controller = mydigitalstructure._util.param.get(param, 'controller').value;
		var source = mydigitalstructure._util.param.get(param, 'source').value;
		var object = mydigitalstructure._util.param.get(param, 'object').value;
		var objectContext = mydigitalstructure._util.param.get(param, 'objectContext').value;
		var download = mydigitalstructure._util.param.get(param, 'download', {default: false}).value;
		var useLocal = mydigitalstructure._util.param.get(param, 'useLocal').value;

		if (_.isUndefined(filenamePrefix))
		{	
			filenamePrefix = app._util.data.get(
			{
				controller: 'util-export',
				context: 'dataContext',
				name: 'filenamePrefix'
			});
		}	

		if (_.isUndefined(filename))
		{
			if (_.isUndefined(filenamePrefix))
			{
				filenamePrefix = (controller?controller:source);
				if (_.isUndefined(filenamePrefix)) {filenamePrefix = 'export'}
			}
			filename = filenamePrefix + '-' + _.toUpper(moment().format("DDMMMYYYY")) + '.csv';
		}

		if (useLocal == undefined)
		{
			useLocal = mydigitalstructure.saveAs;
		}
	
		if (useLocal && window.saveAs != undefined)
		{
			var blob = new Blob([fileData], {type: "text/plain;charset=utf-8"});
			saveAs(blob, filename);

			$('#util-export').modal('hide');

			mydigitalstructure._util.doCallBack(param);
		}
		else
		{
			var data =
			{
				filedata: fileData,
				filename: filename,
				object: object,
				objectcontext: objectContext
			}

			$.ajax(
			{
				type: 'POST',
				url: '/rpc/core/?method=CORE_FILE_MANAGE',
				data: data,
				dataType: 'json',
				success: function(response)
				{
					if (download)
					{
						window.open(response.link, '_self');
					}

					$('#util-export').modal('hide');

					mydigitalstructure._util.doCallBack(param, response);
				}
			});
		}	
	}

	app.controller['util-export-image'] = function (param)
	{
		if (param.viewStatus == 'shown')
		{
			var dataContext = app._util.data.get(
			{
				controller: 'util-export-image',
				context: 'dataContext'
			});

			var param =
			{
				elementSVGContainerID: dataContext.source,
				elementImageContainerID: 'util-export-image-view',
				elementImageDownloadID: 'util-export-image-download',
				viewScale: 4,
				format: 'png',
				styles: '<style type="text/css"><![CDATA[' +
							'svg{font:10px arial; -webkit-tap-highlight-color:transparent; shape-rendering: crispEdges;} line, path{fill:none;stroke:#000} text{-webkit-user-select:none;-moz-user-select:none;user-select:none}.c3-bars path,.c3-event-rect,.c3-legend-item-tile,.c3-xgrid-focus,-ygrid{shape-rendering:crispEdges}-chart-arc path{stroke:#fff}-chart-arc text{fill:#fff;font-size:13px}-grid line{stroke:#aaa;}-grid text{fill:#aaa} .c3-xgrid, .c3-ygrid{stroke-dasharray:3 3}-text-empty{fill:gray;font-size:2em}-line{stroke-width:1px}-circle._expanded_{stroke-width:1px;stroke:#fff}-selected-circle{fill:#fff;stroke-width:2px}-bar{stroke-width:0}-bar._expanded_{fill-opacity:.75}-target-focused{opacity:1}-target-focused path-line,-target-focused path-step{stroke-width:2px}-target-defocused{opacity:.3!important}-region{fill:#4682b4;fill-opacity:.1}-brush .extent{fill-opacity:.1}-legend-item{font-size:12px}-legend-item-hidden{opacity:.15}-legend-background{opacity:.75;fill:#fff;stroke:#d3d3d3;stroke-width:1}-title{font:14px sans-serif}-tooltip-container{z-index:10}-tooltip{border-collapse:collapse;border-spacing:0;background-color:#fff;empty-cells:show;-webkit-box-shadow:7px 7px 12px -9px #777;-moz-box-shadow:7px 7px 12px -9px #777;box-shadow:7px 7px 12px -9px #777;opacity:.9}-tooltip tr{border:1px solid #CCC}-tooltip th{background-color:#aaa;font-size:14px;padding:2px 5px;text-align:left;color:#FFF}-tooltip td{font-size:13px;padding:3px 6px;background-color:#fff;border-left:1px dotted #999}-tooltip td>span{display:inline-block;width:10px;height:10px;margin-right:6px}-tooltip td.value{text-align:right}-area{stroke-width:0;opacity:.2}-chart-arcs-title{dominant-baseline:middle;font-size:1.3em}-chart-arcs -chart-arcs-background{fill:#e0e0e0;stroke:none}-chart-arcs -chart-arcs-gauge-unit{fill:#000;font-size:16px}-chart-arcs -chart-arcs-gauge-max,-chart-arcs -chart-arcs-gauge-min{fill:#777}-chart-arc -gauge-value{fill:#000}' +
							']]></style>',
				onComplete: mydigitalstructure._util.downloadImage	
			}
			
			mydigitalstructure._util.svgAsImage(param);
		}	
	}

	mydigitalstructure._util.controller.add(
	{
		name: 'util-export-sheet',
		code: function (param)
		{
			var dataContext = mydigitalstructure._util.param.get(param, 'dataContext').value;

			if (dataContext != undefined)
			{
				param = _.assign(param, param.dataContext)
			}

			mydigitalstructure._util.export.sheet.init(param);
		}
	})
}

if (mydigitalstructure._util.export = {})
{
	mydigitalstructure._util.export = {}
}

//https://github.com/sheetjs/sheetjs

if (_.isObject(window.XLSX))
{
	mydigitalstructure._util.export.sheet =
	{
		data: {},

		init: function (param)
		{
			mydigitalstructure._util.import.sheet.data._param = param;

			var controller = mydigitalstructure._util.param.get(param, 'controller').value;
			var scope = mydigitalstructure._util.param.get(param, 'scope').value;
			var context = mydigitalstructure._util.param.get(param, 'context').value;
			var name = mydigitalstructure._util.param.get(param, 'name',  {default: 'export-format'}).value;
			var filename = mydigitalstructure._util.param.get(param, 'filename', {default: 'export.xlsx'}).value;
			
			var exportData = mydigitalstructure._util.param.get(param, 'data').value;
			var templateAttachment = mydigitalstructure._util.param.get(param, 'templateAttachment').value;

			var download = mydigitalstructure._util.param.get(param, 'download', {default: false}).value;
			var store = mydigitalstructure._util.param.get(param, 'store', {default: false}).value;

			mydigitalstructure._util.param.set(param, 'exportData', exportData);

			var url = mydigitalstructure._util.param.get(param, 'url').value; 
			if (url == undefined)
			{
				if (templateAttachment != undefined)
				{
					
					url = '/rpc/core/?method=CORE_ATTACHMENT_DOWNLOAD&id=' + templateAttachment;
				}
			}

			var exportFormats = mydigitalstructure._util.param.get(param, 'formats').value; 

			if (exportFormats == undefined) 
			{
				if (scope != undefined)
				{
					exportFormats = mydigitalstructure._util.data.get(
					{
						scope: scope,
						context: context,
						name: name
					});
				}
			}

			if (url == undefined)
			{
				mydigitalstructure._util.log.add(
				{
					message: 'mydigitalstructure._util.export.sheet; no template URL'
				});
			}
			else
			{
				/* Convert to $.ajax with beforeSend: to set responseType */
				var req = new XMLHttpRequest();
				req.open("GET", url, true);
				req.responseType = "arraybuffer";

				req.onload = function(e)
				{
					var data = new Uint8Array(req.response);
				  	var workbook = XLSX.read(data, {type: "array", cellStyles: true, bookImages: true});

				  	//RESOLVE NAMES TO CELLS

				  	if (workbook.Workbook != undefined)
				  	{
					  	mydigitalstructure._util.export.sheet.data.names = workbook.Workbook.Names;

					  	_.each(mydigitalstructure._util.export.sheet.data.names,  function (name)
					  	{
					  		name.sheet = _.replaceAll(_.first(_.split(name.Ref, '!')), "'", '');
							name.cell = _.replaceAll(_.last(_.split(name.Ref, '!')), '\\$', '');

					  		_.each(exportFormats, function (format)
							{
								if (format.name != undefined)
								{
									if (format.name.toLowerCase() == name.Name.toLowerCase() 
											&& format.sheet == name.sheet)
									{
			   						format.cell = name.cell;
									}
								}
							});
					  	});
					}

				  	// GO THROUGH FORMATS AND WRITE VALUES TO WORKSHEETS

				  	var worksheet;
				  	var cell;
				  	var value;

				  	_.each(exportFormats, function (format)
				  	{
				  		if (format.sheet != undefined)
				  		{
					  		value = format.value;

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

									if (format.range.header.firstRow)
									{
										format.range.header.cell =
											(format.range.header.firstRowColumn!=undefined?format.range.header.firstRowColumn:'A') + '1';
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

									if (format.range.footer.lastRow)
									{
										format.range.footer.cell = (format.range.footer.lastRowColumn!=undefined?format.range.footer.lastRowColumn:'A') +
												(numeral(mydigitalstructure._util.import.sheet.data.sheets[format.sheet].maximumRow).value() + 1);
									}
								}

								mydigitalstructure._util.export.sheet.range(format, worksheet);
							}	
							else
							{  
								if (format.storage != undefined)
								{
									var storageData = _.find(exportData, function (data)
									{
										return data.field == format.storage.field;
									});

									if (storageData != undefined)
									{
										if (storageData.value != undefined)
										{
											value = _.unescape(_.unescape(storageData.value))
										}
									}
								}

								worksheet = workbook.Sheets[format.sheet];

								if (worksheet != undefined)
								{
									cell = worksheet[format.cell];

									if (cell == undefined)
									{
										cell = {};
									}

									cell.t = 's';

									if (format.type != undefined)
									{
										cell.t = format.type;
									}
								
									cell.v = (value!=undefined?value:'');
								}
							}
						}
					});

				  	mydigitalstructure._util.export.sheet.data.workbook = workbook;

				  	//https://github.com/sheetjs/sheetjs#writing-options
			
					if (store)
					{
						mydigitalstructure._util.export.sheet.data.base64 = XLSX.write(workbook, {type: 'base64', cellStyles: true, bookImages: true});
						mydigitalstructure._util.export.sheet.data.binary = XLSX.write(workbook, {type: 'array', cellStyles: true, bookImages: true});
						mydigitalstructure._util.export.sheet.store.save(param,
						{
							base64: mydigitalstructure._util.export.sheet.data.base64,
							binary: mydigitalstructure._util.export.sheet.data.binary
						})
					}
					else
					{
						param = mydigitalstructure._util.param.set(param, 'data', mydigitalstructure._util.export.sheet.data)
						mydigitalstructure._util.onComplete(param);
					}
					
					if (download)
					{
						XLSX.writeFile(workbook, filename, {cellStyles: true, bookImages: true}
					);}
					
					//If email: true then process the automation task by name - once moved to myds util
					
				}

				req.send();
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
 		},

		store:
		{
			save: function (param, fileData)
			{
				var filename = mydigitalstructure._util.param.get(param, 'filename', {default: 'export.xlsx'}).value;
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
						callback: mydigitalstructure._util.export.sheet.store.process,
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
							mydigitalstructure._util.export.sheet.store.process(param, data)
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

					mydigitalstructure._util.export.sheet.data.attachment =
					{
						id: attachment.attachment,
						link: attachment.attachmentlink,
						href: '/download/' + attachment.attachmentlink
					}
				}

				param = mydigitalstructure._util.param.set(param, 'data', mydigitalstructure._util.export.sheet.data);

				if (compress)
				{
					mydigitalstructure._util.export.sheet.store.compress(param)
				}
				else
				{
					mydigitalstructure._util.export.sheet.store.complete(param)
				}
			},
		
			compress: function (param, response)
			{
				var filename = mydigitalstructure._util.param.get(param, 'filename', {default: 'export.xlsx'}).value;
				var object = mydigitalstructure._util.param.get(param, 'object').value;
				var objectContext = mydigitalstructure._util.param.get(param, 'objectContext').value;

				var _filename = _.split(filename, '.');
				_filename.pop()

				filename = _.join(_filename, '.') + '-' + moment().format('DDMMMYYYY-HHmm') + '.zip';

				if (response == undefined)
				{
					mydigitalstructure.cloud.invoke(
					{
						method: 'core_attachment_zip',
						data:
						{
							object: object,
							objectcontext: objectContext,
							filename: filename
						},
						callback: mydigitalstructure._util.export.sheet.store.compress,
						callbackParam: param
					});
				}
				else
				{
					if (response.status == 'OK')
					{
						mydigitalstructure._util.export.sheet.data.attachment =
						{
							id: response.attachment,
							link: response.attachmentlink,
							href: '/download/' + response.attachmentlink
						}

						param = mydigitalstructure._util.param.set(param, 'data', mydigitalstructure._util.export.sheet.data);
					}

					mydigitalstructure._util.export.sheet.store.complete(param)
				}
			},

			complete: function (param)
			{
				app.invoke('util-view-spinner-remove', {controller: 'util-export-create-sheet'});	
				mydigitalstructure._util.onComplete(param);
			}
		}
	}
}

