//Uses tinyMCE
// https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.0.0/tinymce.min.js
// or https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js" referrerpolicy="origin"

mydigitalstructure._util.factory.editor = function (param)
{
	app.add(
	{
		name: 'util-view-editor',
		code: function (param)
		{
			var height = mydigitalstructure._util.param.get(param, 'height', {"default": '370px'}).value;
			var width = mydigitalstructure._util.param.get(param, 'width', {"default": 'auto'}).value;
			var dynamicTags = mydigitalstructure._util.param.get(param, 'dynamicTags', {"default": false}).value;
			var theme = mydigitalstructure._util.param.get(param, 'theme', {"default": 'modern'}).value;
			var selector = mydigitalstructure._util.param.get(param, 'selector', {"default": 'textarea'}).value;
			var object = mydigitalstructure._util.param.get(param, 'object', {"default": '32'}).value;
			var toolbars = mydigitalstructure._util.param.get(param, 'toolbars').value;
			var simple = mydigitalstructure._util.param.get(param, 'simple', {"default": false}).value;
			var settings = mydigitalstructure._util.param.get(param, 'settings').value;
			var onInit = mydigitalstructure._util.param.get(param, 'onInit').value;
			var onSetup = mydigitalstructure._util.param.get(param, 'onSetup').value;
			var contentCSS = mydigitalstructure._util.param.get(param, 'contentCSS').value;
			var content = mydigitalstructure._util.param.get(param, 'content').value;
			var additional = '';
			var cleanContent = mydigitalstructure._util.param.get(param, 'cleanContent', {default: true}).value;
			var fonts = mydigitalstructure._util.param.get(param, 'fonts').value;

			var fontFormats = 'Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;' +
									'Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;' +
									'Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,' +
									'arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;' +
									'Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats'

			if (!_.isUndefined(fonts)) {fontFormats = fontFormats + fonts}

			if (cleanContent) {content = _.unescape(content)}
			if (dynamicTags) {additional = 'dynamicTags,'}

			if (settings == undefined)
			{	
				settings = 
				{
					selector: selector,
					theme: "silver",
					skin: 'oxide',
					height : height, 
					width : width,
					plugins:
					[
							"advlist autolink link image lists charmap print preview anchor",
							"searchreplace visualblocks code fullscreen insertdatetime media",
							"table paste"
					],

					menubar: false,
					statusbar : false,
					toolbar_items_size: 'small',

					style_formats:
					[
							{title: 'Bold text', inline: 'b'}
					],

					font_formats: fonts,

					templates: '/ondemand/core/?method=CORE_DYNAMIC_TAG_SEARCH',
					link_list: '/rpc/core/?method=CORE_EDITOR_LINK_SEARCH',
					image_list: '/rpc/core/?method=CORE_EDITOR_IMAGE_SEARCH',

					browser_spellcheck: true,
					content_css: contentCSS,
					convert_urls: false
				}

				if (simple)
				{
					settings.toolbar1 = 'bold italic underline | alignleft aligncenter alignright alignjustify | fontselect fontsizeselect';
					settings.toolbar2 = 'forecolor backcolor | cut copy paste | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor code';
				}	
				else
				{	
					if (toolbars == undefined)
					{
						settings.toolbar1 = 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor | bullist numlist | formatselect fontselect fontsizeselect';
						settings.toolbar2 = 'cut copy paste | outdent indent blockquote | undo redo | link unlink anchor image media code';
						settings.toolbar3 = 'table | hr removeformat | subscript superscript | charmap emoticons | ltr rtl | visualchars visualblocks nonbreaking pagebreak | template | fullscreen';
					}
					else
					{
						_.each(toolbars, function (toolbar, t)
						{
							settings['toolbar' + (t+1)] = toolbar;
						});
					}
				}

				if (onInit != undefined)
				{
					settings.init_instance_callback = onInit;
				}

				settings.setup = app.controller['util-view-editor-setup'];

				if (onSetup != undefined)
				{
					settings._setup = onSetup;
				}
				
				if (content != undefined)
				{
					settings.init_instance_callback = function (editor)
					{
						editor.setContent(content)
					}
				}
			}
				
			tinyMCE.remove(selector)
			tinyMCE.init(settings);						
		}
	});

	app.add(
	{
		name: 'util-view-editor-setup',
		code: function (editor)
		{
			var fontSize = '12pt';
			var fontFamily = 'Helvetica';

			if (_.has(mydigitalstructure.options, 'editor.fontSize'))
			{
				fontSize = mydigitalstructure.options.editor.fontSize;
			}

			if (_.has(mydigitalstructure.options, 'editor.fontFamily'))
			{
				fontFamily = mydigitalstructure.options.editor.fontFamily;
			}

			editor.on('init', function() 
			{
				this.getDoc().body.style.fontSize = fontSize;
				this.getDoc().body.style.fontFamily = fontFamily;		
			});

			editor.on('PreInit', function(e)
			{
				var doc = this.getDoc();

				if (_.has(mydigitalstructure.options, 'editor.setup'))
				{
					var jscript = mydigitalstructure.options.editor.setup;
					var script = doc.createElement("script");
					script.type = "text/javascript";
					script.mydigitalstructureendChild(doc.createTextNode(jscript));
					doc.getElementsByTagName('head')[0].mydigitalstructureendChild(script);
				}    
		   });

		   var data = $('#' + editor.id).data();
		   var dataScope = data.scope;
		   if (_.isEmpty(dataScope)) {dataScope = data.controller}

		   if (!_.isEmpty(dataScope))
		   {
		   	editor.on('change', function(e)
				{
			      mydigitalstructure._util.data.set(
					{
						controller: dataScope,
						context: data.context,
						value: editor.getContent()
					});
			  	});

				editor.on('keyup', function(e)
				{
			      mydigitalstructure._util.data.set(
					{
						controller: dataScope,
						context: data.context,
						value: editor.getContent()
					});
			  	});
		   }

			if (_.isFunction(editor.settings._setup)) {editor.settings._setup(editor)}
		}
	});

	app.add(
	{
		name: 'util-editor',
		code: function (param)
		{
			mydigitalstructure._util.controller.invoke('util-view-editor', param)
		}
	});
}