// Knockout Functions
ko.bindingHandlers.tinymce = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel){
		var modelValue = valueAccessor();
		var options = {
			mode: "textareas",
			theme: "simple",
			editor_selector: "cwrcNote",
			setup: function(editor){ // Used to handle changes
				editor.onChange.add(function(ed, data){
					if(ko.isWriteableObservable(modelValue)){
						modelValue(data.content)
					}
				});
			}
		};

		//Handle destroying the editor
		ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
			$(element).parent().find("span.mceEditor,div.mceEditor").each(function(i, node){
				var editor = tinyMCE.get(node.id.replace(/_parent$/, ""));
				if(editor){
					editor.remove();
				}
			});
		});

		// Initialize tiny mce
		$(element).tinymce(options);
	},
	update: function(element, valueAccessor, allBindingsAccessor, viewModel){
		var value = ko.utils.unwrapObservable(valueAccessor());
		$(element).html(value);
	}
};

// Dialog Functions
function CWRCDialogs(opts) {
	var compareArray = function(inputArray, checkArray){
		if(inputArray.length == checkArray.length){
			for(var index in inputArray){
				if(inputArray[index] != checkArray[index]){
					return false;
				}
			}

			return true;
		}

		return false;
	}

	var self = this;
	self.entitySchema = opts.entitySchema;
	self.entityBase = opts.entityBase;
	self.lang = "a:en";
	self.viewModel = {};
	
	self.viewModel.displayMode = function(field) {
		
		// in case of quantifier check if it is empty

		if (!field.input) {

			field.input = 'label'
			field.label = 'problematic field'
		} 		
		
		switch(field.input) {
			case 'zeroormore':
			case 'oneormore':
			case 'interleave':
			case 'optional':
				if (field.interfaceFields().length == 0) {
					return 'empty';
				} 
				break;
		}
		
		return field.input;
	}
	self.viewModel.interfaceFields = ko.observableArray([]);
	
	$('body').append("<div id='newPersonDialogue' class='cwrcDialog' title=''>"+
						  "<div class='ui-widget cwrc-dialog-content' data-bind='template: { name: displayMode, foreach: interfaceFields }'> </div>"+
						  "</div>");
				
	$.ajax({
	    type: "GET",
		url: self.entitySchema,
		dataType: "xml",
		success: function(xml) {
			self.schema = xml;
		}
	});


	// add templates
	
	// single

	var emptyTemplate = '<script type="text/html" id="empty">  </script>';

	var interleaveTemplate = '<script type="text/html" id="interleave">'+
							 '<div  class="ui-widget cwrc-dialog-content cwrc-quantifier interleave" data-bind="template:{ name: displayMode, foreach: interfaceFields } " ></div>' +
							 '</script>';
	
	var zeroOrMoreTemplate = '<script type="text/html" id="zeroormore">'+
							 '<div class="cwrc-zeroormore growable cwrc-quantifier" data-bind="foreach: interfaceFields">' +
							 '<h3><a href="#"></a></h3>'+
							 '<div data-bind="template:{ name: $parent.displayMode, foreach: $data } "></div>' +
							 '</div>' +
							 '<a class="cwrcClick ui-icon-inline ui-icon ui-icon-plusthick" toolTip="Add new (TODO: add tool tip text)" href="#" data-bind="click: add"></a> ' +
							 '<a class="cwrcClick ui-icon-inline ui-icon ui-icon-minusthick" toolTip="Remove (TODO: add tool tip text)" href="#" data-bind="click: remove"></a>' +
							 '<br/><br/>' +
							 '</script>';
	
	var oneOrMoreTemplate = '<script type="text/html" id="oneormore">'+
							'<div class="cwrc-oneormore growable cwrc-quantifier" data-bind="foreach: interfaceFields">' +
							'<h3><a href="#"></a></h3>'+
							'<div data-bind="template:{ name: $parent.displayMode, foreach: $data } "></div>' +
							'</div>' +
							'<a class="cwrcClick ui-icon-inline ui-icon ui-icon-plusthick" toolTip="Add new (TODO: add tool tip text)" href="#" data-bind="click: add"></a> ' +
							'<a class="cwrcClick ui-icon-inline ui-icon ui-icon-minusthick" toolTip="Remove (TODO: add tool tip text)" href="#" data-bind="click: remove"></a>' +
							'<!-- ko if: $data.useButton -->' +
							'<button style="float: right;" type="button" data-bind="text: buttonMessage, click: buttonClick"></button>' +
							'<!-- /ko -->' +
							'<br/><br/>' +
							'</script>';
	
	var optionalTemplate = '<script type="text/html" id="optional">'+
						   '<span class="ui-widget cwrc-dialog-content cwrc-quantifier optional" data-bind="template:{ name: displayMode, foreach: interfaceFields } " ></span>' +
						   '</script>';

	// items

	var textInputTemplate = '<script type="text/html" id="textField">'+
							'<div class="cwrc-item">' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> :&nbsp;</div>' +
	    					'<div><input data-bind="value: value" />' +
							'<span class="cwrc-help" data-bind="attr:{title: helpText}"> [?]</span></div>' +
							'</div>' +
							'</script>';

	var datePickerTemplate = '<script type="text/html" id="datePicker">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical">Date :&nbsp;</div>' +
	    					'<div><input class="datePicker" placeholder="YYYY-MM-DD" data-bind="value: value" /> <span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span>' +
							'</div>' +
							'</div>' +
							'</script>';
							
	var labelTemplate = '<script type="text/html" id="label">'+
							'<div>' +
	    					'<div><h4><span data-bind="text: label"></span></h4></div>' +
	    					'<div></div>' +
							'</div>' +
							'</script>';
									
	var dialogueTemplate = '<script type="text/html" id="dialogue">'+							
	    					'<div class="cwrc-dialog"><h4><span data-bind="text: label"></span></h4></div>' +
							'</script>';	
	// XXX
	var textAreaTemplate = '<script type="text/html" id="textArea">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> :&nbsp;</div>' +
	    					'<div><textarea class="cwrcNote" rows="2" cols="20" data-bind="tinymce: value"></textarea><span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span></div>' +
							//'<div><h4><span data-bind="text: value"></span></h4></div>' + // This line is used to check if the text area is working.
							'</div>' +
							'</script>';
	// multiple
	// XXXX
	var dynamicCheckboxTemplate = '<script type="text/html" id="dynamicCheckbox">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> :&nbsp;</div>' +
	    					'<div>'+
							'<span><ul class="cwrc-dialog-list" data-bind="foreach: choices">' + 
							'<li><div><input type="checkbox" data-bind="{attr:{name: $parent.path, value: value}, checked: $parent.selected}" />' +
							'<span data-bind="text: content"></span></div></li>' +
							'</ul></span><span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span> ' +
							'</div>' +
							'</div>' +
							'</script>';
	// XXX
	var sliderTemplate = '<script type="text/html" id="slider">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> :&nbsp;</div>' +
	    					'<div>'+
							'<span><ul class = "cwrc-dialog-list" data-bind="foreach: choices">' + 
							'<li><div><input type="radio" data-bind="{attr:{name: $parent.path, value: value}, checked: $parent.selected}" />' +
							'<span data-bind="text: content"></span></div></li>' +
							'</ul></span><span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span> ' +
							'</div>' +
							'</div>' +
							'</script>';
	
	var dropDownTemplate = '<script type="text/html" id="dropDown">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> :&nbsp;</div>' +
	    					'<div>'+
							'<select data-bind="value: value, options: choices, optionsValue: \'value\', optionsText: \'content\'"></select> ' +
							'<span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span></div>' +													
							'</div>' +
							'</script>';							
	
	// XXX Need to change
	var comboboxTemplate = '<script type="text/html" id="combobox">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> :&nbsp;</div>' +
	    					'<div>'+
							'<select data-bind="options: choices, optionsValue: \'value\', optionsText: \'content\'"></select>' + 
							' <span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span></div>' +
							'</div>' +
							'</script>';
							
	var radioButtonTemplate = '<script type="text/html" id="radioButton">'+
							'<div>' +
	    					'<div class="cwrc-property-label-vertical"><span data-bind="text: label"></span> <span class="cwrc-help" data-bind="attr:{title: helpText}">[?]</span> :&nbsp;</div>' +
	    					'<div>'+
							'<ul class="cwrc-dialog-list" data-bind="foreach: choices">' + 
							'<li><div>'+
							'<input type="radio" data-bind="{attr:{name: $parent.path, value: value}, checked: $parent.selected}" />' +
							'<span data-bind="text: content"></span>'+
							'</div></li>' +
							'</ul>' +
							'</div>' +
							'</div>' +
							'</script>';							
									
	var cwrcstyle = '<link rel="stylesheet" type="text/css" href="css/style.css" />';
	
	$('head').append(emptyTemplate);
	$('head').append(interleaveTemplate);
	$('head').append(zeroOrMoreTemplate);
	$('head').append(oneOrMoreTemplate);
	$('head').append(optionalTemplate);
				
	$('head').append(textInputTemplate);
	$('head').append(datePickerTemplate);	
	$('head').append(labelTemplate);
	$('head').append(dynamicCheckboxTemplate);
	$('head').append(dialogueTemplate);
	$('head').append(textAreaTemplate);
		
	$('head').append(sliderTemplate);
	$('head').append(dropDownTemplate);
	$('head').append(comboboxTemplate);
	$('head').append(radioButtonTemplate);
	$('head').append(cwrcstyle);
	
	// -- functions

	self.editPersonDialog = function(pid, callback) {	
			$.ajax({
			    type: "GET",
				url: self.entityBase + pid + '?callback=?',
				dataType: "jsonp xml",
				success: function(xml) {
					self.editing = true;
					self.working = xml;
					self.currentPID = pid;
					self.callback = callback;
					if (! self.schema) {
						setTimeout(function(){
							self.editPersonDialog(pid, callback);
						}, 50);
					} else {
						self.type = 'person';			
						self.completeNewDialog();
					}
				}
			});		
	}

	self.prepNewDialog = function(callback) {
		self.editing = false;
		self.working = $.parseXML('<entity xmlns="http://www.w3.org/1999/xhtml"></entity>');
		self.callback = callback;
		self.viewModel.interfaceFields = ko.observableArray([]);
	}

	self.newPersonDialog = function(callback) {
		// var self = this;	
		self.prepNewDialog(callback);
		
		if (! self.schema) {
			setTimeout(function(){
				self.newPersonDialog(callback);
			}, 50);
		} else {
			self.type = 'person';					
			self.completeNewDialog();		
		}
	};
	
	self.editOrganizationDialog = function(pid, callback) {	
			$.ajax({
			    type: "GET",
				url: self.entityBase + pid + '?callback=?',
				dataType: "jsonp xml",
				success: function(xml) {
					self.editing = true;
					self.working = xml;
					self.currentPID = pid;
					self.callback = callback;
					if (! self.schema) {
						setTimeout(function(){
							self.editOrganizationDialog(pid, callback);
						}, 50);
					} else {
						self.type = 'organization';			
						self.completeNewDialog();
					}
				}
			});		
	}	

	self.newOrganizationDialog = function(callback) {
		self.prepNewDialog(callback) ;

		if (! self.schema) {
			setTimeout(function(){
				self.newPersonDialog(callback);
			}, 50);
		} else {
			self.type = 'organization';					
			self.completeNewDialog();		
		}
	}


	self.processRef = function(element) {
		var defName = $(element).attr('name');
		var defNode = $(self.schema).find('define[name='+defName+']')[0];
		self.visit(defNode);
	}
		

	self.getCurrentInterfaceField = function() {
		return self.viewModel.interfaceFields()[self.viewModel.interfaceFields().length-1];
	}
	
	self.processNode = function(element) {		
		var nodeName = element.nodeName.toLowerCase();
		var visitChildren = true;	
		var createdValue;

		switch(nodeName) {
			case 'element':
				self.processElement(element);
				break;
			case 'attribute':
				break;
			case 'ref':
				self.processRef(element);
				break;
			case 'xs:annotation':
				self.procesXSAnnotation(element);
				visitChildren = false;
				break;
			case 'choice':
				visitChildren = false;
				break;
			case 'oneormore':
			case 'zeroormore':
			case 'interleave':
			case 'optional':
				// right now we assume just one entry per quantifier
				createdValue = self.processQuantifier(element);
				break;
		}
		
		if (visitChildren) {
			// visit all children
			$(element).children().each(function(i,element){
				self.visit(element);
			});
		}
		
		// post process
		
		switch(nodeName) {
			case 'element':
				self.postprocessElement(element);
				break;
			case 'oneormore':
			case 'zeroormore':
			case 'interleave':	
			case 'optional':	
				self.postprocessQuantifier();
				break;				
		}

		// Check if we are in the preferred name and do the needed actions
		if(nodeName == "oneormore" && compareArray(self.path, ["entity","person", "identity", "preferredForm"])){
			createdValue.interfaceFields()[0][1].interfaceFields()[0].value('forename');
			createdValue.add();
			createdValue.interfaceFields()[1][1].interfaceFields()[0].value('surname');
			createdValue.useButton = true;
			createdValue.buttonClick = function(){
				$("#newPersonDialogue ~ .ui-dialog-buttonpane button")[0].click();
			};

			createdValue.buttonMessage = "Save Person";
		}
	}
	
	self.initializeQuantifiers = function() {
		var newField = {};
		self.workingQuantifiers = [];
		newField.input = 'interleave';
		newField.displayMode = self.viewModel.displayMode;
		newField.interfaceFields = ko.observableArray([]);
		self.workingQuantifiers.push(newField);
		self.viewModel.interfaceFields.push(newField);
	}

	self.updateUI = function() {
		// tinyMCE.init({
		//         mode : "textareas",
		// 		editor_selector : "cwrcNote"
		// });
		$(function(){
			$("[title]").tipTip({edgeOffset: 10});
		});

		$(function(){
			$("[toolTip]").tipTip({attribute: "toolTip"});
		});
		
		$( ".datePicker" ).datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: "yy-mm-dd",
			yearRange: "0000:c+100"
		});
		
		$(".cwrc-dialog").parent().parent().each(function(i,e){
		
			$(e).children().children(".cwrc-dialog").each(function(j,f){
				
				var data = $(f).parent().data();
		
				
				if (! data.headerText) {
					var header = $(f).text();
					$(f).text('');
					$(f).parent().prev().html('<a href="#">' + header +'</a>');
					$(f).parent().data({headerText : header});
				} else {
					$(f).parent().prev().html('<a href="#">' + data.headerText +'</a>');
				}
			});
			$(e).accordion({
				event: "click hoverintent",
				collapsible: true			
			});
		});
		

	}
	
	self.cloneArray = function(array) {
		var result = [];
		for (var i in array) {
			result.push(self.cloneObject(array[i]));	
			result[result.length-1].value = ko.observable('');
		}
		return result;
	}
	
	self.processQuantifier = function(element) {
		var newField = {}
		newField.input = element.nodeName.toLowerCase();

		// newField.label = function() {return "Quantifier label";};
		newField.add = function() {

			if (this.isGrowable) {
				this.interfaceFields.push(self.cloneArray(this.addition));	
			} 
			else {
				for (var i in this.addition) {
					this.interfaceFields.push(self.cloneObject(this.addition[i]));				
				}		
			}		
			
			self.updateUI();
		};
		newField.remove = function() {
			if (this.isGrowable) {
				this.interfaceFields.pop();
			} 
			else {
				for (var i in this.addition) {
					this.interfaceFields.pop();
				}
			}
			self.updateUI();
		};
		// newField.isMultiple = function() { return true;};
		newField.interfaceFields = ko.observableArray([]);
		newField.displayMode = self.viewModel.displayMode;
		newField.isGrowable = false;
		self.getWorkingQuantifier().interfaceFields.push(newField);
		self.workingQuantifiers.push(newField)
		
		// self.viewModel.interfaceFields.push(newField);

		return newField;
	}

	self.checkIfHasInterface = function(item) {
		if (item.hasInterface == true) {
			return true;
		} 
		
		switch(item.input) {
			case 'dropDown':
			case 'textField':
			case 'textArea':
			case 'dynamicCheckbox':
			case 'radio':
			case 'combobox':
			case 'slider':
			return true
		}
		return false;
	}


	self.growableQuantifier = function (item) {

		var response = false;
		switch(item.input) {
			case 'zeroormore':
			case 'oneormore':
				response = true;
		}

		return response;
	}


	self.postprocessQuantifier = function() {
		
		var thisQuantifier = self.getWorkingQuantifier();
		
		var hasInterface = false;
		ko.utils.arrayForEach(thisQuantifier.interfaceFields(),function(item){
			if (self.checkIfHasInterface(item)) { // cambiar a revisar empty en quantificadores o widget en hijos
				hasInterface = true;
			}
		});
		thisQuantifier.hasInterface = hasInterface;
		
		if (!hasInterface) {
			thisQuantifier.interfaceFields.removeAll();
			self.workingQuantifiers.pop();
			self.getWorkingQuantifier().interfaceFields.remove(thisQuantifier);
		} else {		
			self.getWorkingQuantifier().addition = [];
			
			ko.utils.arrayForEach(self.getWorkingQuantifier().interfaceFields(), function(item){
				self.getWorkingQuantifier().addition.push(self.cloneObject(item));
				self.getWorkingQuantifier().addition[self.getWorkingQuantifier().addition.length-1].value = ko.observable(''); // XXX interim solution
			});
			
			if (self.growableQuantifier(thisQuantifier)) {
			// 	self.getWorkingQuantifier().interfaceFields = ko.observableArray([self.getWorkingQuantifier().interfaceFields]);
				self.getWorkingQuantifier().isGrowable = true;
				self.getWorkingQuantifier().interfaceFields = ko.observableArray([self.getWorkingQuantifier().addition]);
			} 
			
			self.workingQuantifiers.pop();
		}		
	}
	
	self.getWorkingQuantifier = function() {
		return self.workingQuantifiers[self.workingQuantifiers.length-1];
	}

	self.processElement = function(element) {
		self.path.push($(element).attr('name'));
	}

	self.postprocessElement = function(element) {
		self.path.pop();
	}

	self.cloneObject = function(obj) {
		
		if (obj instanceof Array) {
			var result = [];
			for (var i in obj) {
				result.push(self.cloneObject(obj[i]));
			}			
		} else {		
			var result = {}
			result.label = ko.isObservable(obj.label) ? ko.observable(obj.label()) :  obj.label;
			result.input = ko.isObservable(obj.input) ? ko.observable(obj.input()) :  obj.input;
			result.helpText = ko.isObservable(obj.helpText) ? ko.observable(obj.helpText()) :  obj.helpText;
			result.path = ko.isObservable(obj.path) ? ko.observable(obj.path()) :  obj.path;
			result.value = ko.isObservable(obj.value) ? ko.observable(obj.value()) :  obj.value;
			result.displayMode = obj.displayMode;
		
			result.add = obj.add;
			result.remove = obj.remove;
			result.addition = [];
		
			for (var i in obj.addition) {
				result.addition.push(obj.addition[i]);
			}
		
			if (obj.choices) {
				result.choices = [];
				result.selected = [];

				for (var i in obj.choices) {
					result.choices.push(obj.choices[i])
				}
			}
		
			if (ko.isObservable(obj.interfaceFields)) {
				result.interfaceFields = ko.observableArray([])
				ko.utils.arrayForEach(obj.interfaceFields(), function(item){
					result.interfaceFields.push(self.cloneObject(item));
				});
			} else {
				result.interfaceFields = [];
				for (var i in obj.interfaceFields) {
					result.interfaceFields.push(self.cloneObject(obj.interfaceFields[i]))
				}
			}				
		}
		return result;
	}

	self.isValueContainer = function(element) {
		var test = false;
		$(element).contents().each(function(i,e){

			if (e.nodeType == 3) {
			 	test = true;				
			}
			if (test) return;

		});
		return test;
	}

	self.procesXSAnnotation = function(element) {
		var appinfo = $(element).children("xs\\:appinfo");
		var newField = {};
		newField.label = 'def label';
		newField.input = 'label';
		newField.helpText = '';
		newField.path = self.path+"";

		// find if working element is attribute and add to path

		
		var parent = $(element).parent()[0];
		
		if (parent.nodeName == 'attribute') {
			newField.path += ",@" + $(parent).attr('name');
		}
		
		// find in appinfo the interface-field with the correct path

		$(appinfo).children("interface-field").each(function(i,e){
			var currentPath = $(e).attr('path').split('/');

			if (self.isSamePath(currentPath)) {

				
				newField.label = $(e).children('label').first().text();
				newField.helpText = $(e).children('help-text').first().text();								

				if ($(e).children('input').first().text() != '') {
					newField.input = $(e).children('input').first().text();
				}				
								
				// check if newField needs choices
				var values = $(appinfo).children('values[type='+self.type+']');

				if (values.length == 0) {
					values = $(appinfo).children('values');
				}
			
				if (values.length != 0) {
					
					newField.choices = []
					newField.selected = [];
					
					$(values).find('value').each(function(i,e){
						newField.choices.push({
							'content': $(e).attr(self.lang),
							'value': $(e).text()
						});
					});
				}


				// find value (s)


				if (newField.input != 'label'){
					if (!self.editing) {
						newField.value = ko.observable('');
						self.getWorkingQuantifier().interfaceFields.push(newField);
					} else {

						var selector = $(e).attr('path').replace(/\//g, " > ");
						// XXX temp
						selector = selector.replace('|organization', '');

						$(self.working).find(selector).each(function(i, element){



								var currentField = self.cloneObject(newField);
								if (self.isValueContainer(element)) {
									currentField.value = ko.observable($(element).text());
								} else {
									currentField.value = ko.observable('');
								}
								

								
								
								self.getWorkingQuantifier().interfaceFields.push(currentField);
								// need to add selection value
						})
					}	
				}

				
				return false; // break each
			}
		});
		
		
	}

	self.isSamePath = function(currentPath) {
		
		// var workingPath = currentPath;
		// XXX TESTING
		var len = currentPath.length;
		if (currentPath[len-1].indexOf('@') != -1) {
			// workingPath.pop();
			len = len - 1;
		}
		

		
		if (len != self.path.length) {
			return false;
		}
		
		for (var i=0; i<len; ++i) {
			
			var orPaths = currentPath[i].split('|');
			var same = false;
			for (var j=0; j< orPaths.length; ++j) {
				if (self.path[i] == orPaths[j]) {			
					same = true;
					break;
				} 
			}
			
			if (!same) return false;
		}
		
		return true;
	}

	self.visit = function(element) {;
		if (element.nodeType == 1) {			
			self.nodeStack.push(element);					
			// working with element
			self.processNode(element);					
			self.nodeStack.pop()
		}		
	}

	self.xmlToString = function(xmlData) {       
	    var xmlString;	    
	    if (window.ActiveXObject){ // IE
	        xmlString = xmlData.xml;
	    } else{ // code for Mozilla, Firefox, Opera, etc.
	        xmlString = (new XMLSerializer()).serializeToString(xmlData);
	    }
	    return xmlString;
	}
	
	self.visitStringifyResult = function(fields) {

		for (var i=0; i< fields().length; i++) {
			var thisField = fields()[i];
			if (thisField.path) {
				// alert("creating")				
				self.createNode(thisField);
				
			} else if (thisField instanceof Array) {

				for (var j=0; j<thisField.length; ++j) {
					
					if (thisField[j].path) {
						self.createNode(thisField[j]);
					} else if (thisField[j].hasOwnProperty('interfaceFields')) {
						self.visitStringifyResult(thisField[j].interfaceFields);
					}
					
					// alert(thisField[j].path)
					// self.createNode(thisField[j]);
					// self.visitStringifyResult(thisField[j].interfaceFields);
					// alert(thisField[j])
					// for (var k in thisField[j]) {
					// 						if (thisField[j].hasOwnProperty(k)) {
					// 							alert(k + ' : ' + thisField[j][k])
					// 						}
					// 					}
				}			
			} else if (fields()[i].hasOwnProperty('interfaceFields')) {
				// alert(" not creating")
				self.visitStringifyResult(fields()[i].interfaceFields);

			}
		}
		
		
	}
	
	self.isNodeAttribute = function(node) {
		return node.path.indexOf('@') != -1;
	}
	
	self.createNode = function(node) {
		
		
		var pathString = node.path;
		
		var fullPath = pathString.split(',');
		var attr = '';
		
		if (self.isNodeAttribute(node)) {
			attr = fullPath[fullPath.length-1];
			attr = attr.replace('@', '');
			fullPath.pop();
			pathString = fullPath + '';
		}
		
		
		if (node.input != 'label')	{
			
			
			for (var i=0; i< fullPath.length; i++) {
		
				var path = pathString.split(',');
				var thisPathString = path.splice(0, i+1) + "";
				var selector = thisPathString.replace(/,/g, " > ");

				var entry = $(self.working).find(selector);
				
				if (entry.size() == 0 || i == fullPath.length-1) {
				
					path = pathString.split(',');
						
					thisPathString = path.splice(0, i) + "";
					selector = thisPathString.replace(/,/g, " > ");
							
					var newElement = self.working.createElement(fullPath[i]); 
					$(self.working).find(selector).append(newElement);		
				
				}
			}
			
			// if working with attribute add to full path
			var selector = pathString.replace(/,/g, " > ");
			
			if (attr != '') {

				$(self.working).find(selector).last().attr(attr, '');
			}


			
			// set value
			switch(node.input) {
				case 'dropDown':
				case 'combobox':
					self.setValue(node, attr, selector, node.value().value);
					break;
				case 'textArea':
				case 'textField':
					self.setValue(node, attr, selector, node.value());
					break;
				case 'radioButton':
				case 'slider':
				case 'dynamicCheckbox':
					self.setValue(node, attr, selector, node.selected);					
					break;
			}								
		}	
	}
	
	self.setValue = function(node, attr, selector, val) {
		if (self.isNodeAttribute(node)) {
			$(self.working).find(selector).last().attr(attr, val)
		} else {
			$(self.working).find(selector).last().text(val);
		}
	}
	
	self.getWorkingXML = function() {
		self.visitStringifyResult(self.viewModel.interfaceFields);
		return self.xmlToString(self.working);
		
	}

	self.addWorkflowStamp = function(pid, xml, callback) {
		self.viewModel.interfaceFields.removeAll();

// newField.choices = []
// 					newField.selected = [];
					
// 					$(values).find('value').each(function(i,e){
// 						newField.choices.push({
// 							'content': $(e).attr(self.lang),
// 							'value': $(e).text()
// 						});
// 					});

		
		var createWorkflowStamp = function(category, stamp, status, note) {
			var now = new Date();
			return	'<cwrc:workflow xmlns:cwrc="cwrc.ca/workflow">'+
					    '<cwrc:auto date="'+now.toString('yyyy-MM-dd')+'" toolID="EntityInterface" datastreamID="CWRC-ENTITY">'+
					        '<cwrc:activity category="'+category+'" stamp="'+stamp+'" status="'+status+'">'+
					       ' </cwrc:activity>'+
					        '<cwrc:assigned process="entityApproval" category="metadata_contribution">'+
					            '<cwrc:tool toolID="entityManager">'+
					                '<cwrc:note>'+note+'</cwrc:note>'+
					            '</cwrc:tool>'+                        
					        '</cwrc:assigned>'+           
					    '</cwrc:auto>'+
					'</cwrc:workflow>';
		}

		var categories = [{'content':'created',
							'value':'created'},
							{'content':'deposited',
							'value':'deposited'},
							{'content':'metadata_contribution',
							'value':'metadata_contribution'},
							{'content':'content_contribution',
							'value':'content_contribution'},
							{'content':'checked',
							'value':'checked'},
							{'content':'machine_processed',
							'value':'machine_processed'},
							{'content':'user-tagged',
							'value':'user-tagged'},
							{'content':'rights_assigned',
							'value':'rights_assigned'},
							{'content':'published',
							'value':'published'},
							{'content':'peer-reviewed/evaluated',
							'value':'peer-reviewed/evaluated'},
							{'content':'withdrawn',
							'value':'withdrawn'},
							{'content':'deleted',
							'value':'deleted'}
						];

		var stamps = [{'value':'niso:AO',
						'content':"Author's Original (AO)"},
						{'value':'niso:SMUR',
						'content':'Submitted Manuscript Under Review (SMUR)'},
						{'value':'niso:AM',
						'content':'Accepted Manuscript (AM)'},
						{'value':'niso:P',
						'content':'Proof (P)'},
						{'value':'niso:VoR',
						'content':'Version of Record (VoR)'},
						{'value':'niso:CVoR',
						'content':'Corrected Version of Record (CVoR)'},
						{'value':'niso:EVoR',
						'content':'Enhanced Version of Record (EVoR)'},
						{'value':'orl:SUB',
						'content':'Submitted (SUB)'},
						{'value':'orl:RWT',
						'content':'Researched / Written / Tagged (RWT)'},
						{'value':'orl:REV',
						'content':'Revised (REV)'},
						{'value':'orl:RBV',
						'content':'Reviewed by Volume Author (RVB)'},
						{'value':'orl:CAS',
						'content':'Checked Against Sources (CAS)'},
						{'value':'orl:CFT',
						'content':'Checked for Tagging (CFT)'},
						{'value':'orl:CFB',
						'content':'Checked for Bibliographic Practices (CFB)'},
						{'value':'orl:PUB',
						'content':'Published (PUB)'},
						{'value':'orl:ENH',
						'content':'Enhanced (ENH)'},
						{'value':'orl:TC',
						'content':'Tag Cleanup (TC)'},
						{'value':'orl:PUBR',
						'content':'Publication Readthrough (PUBR)'},
						{'value':'cwrc:cre',
						'content':'repository item created (original version of repository object) - equivalent to category created  '},
						{'value':'cwrc:dep',
						'content':'repository item deposited (an existing file) - equivalent to category deposited'},
						{'value':'cwrc:cvr',
						'content':'object value edited - cvr (corrected version of record)'},
						{'value':'cwrc:evr',
						'content':'object value added evr (enhanced version of record)'},
						{'value':'cwrc:ckd',
						'content':'Checked/corrected - equivalent to category checked'},
						{'value':'cwrc:tag',
						'content':'tagged by member of general public (i.e. subject keywords/ folksonomic descriptors  added) - equivalent to category tagged'},
						{'value':'cwrc:rights_asg',
						'content':'Copyright/license terms attached to object - equivalent to category rights_assigned'},
						{'value':'cwrc:pub',
						'content':'repository item under ongoing publishing procedures - equivalent to category published'},
						{'value':'cwrc:rev',
						'content':'peer-review as opposed to internal editing/revision - equivalent to category peer-reviewed/evaluated'},
						{'value':'cwrc:wdr',
						'content':'Removed from published state - equivalent to category withdrawn'},
						{'value':'cwrc:del',
						'content':'Deleted from the repository - equivalent to category deleted'}
					];

		var status = [
			{'value':'c',
			'content':'Complete'},
			{'value':'ipr',
			'content':'In Progress'},
			{'value':'p',
			'content':'Pending'},
			{'value':'i',
			'content':'Incomplete'}
		];

		self.viewModel.interfaceFields.push({
			'displayMode' : self.viewModel.displayMode,
			'input' : 'dropDown',
			'value' : '',
			'label' : 'Category',
			'helpText' : 'Select from a list of categories',
			'selected' : [],
			'choices' : categories
		
		});

		self.viewModel.interfaceFields.push({
			'displayMode' : self.viewModel.displayMode,
			'input' : 'dropDown',
			'value' : '',
			'label' : 'Stamp',
			'helpText' : 'Select from a list of stamps',
			'selected' : [],
			'choices' : stamps
		
		});

		self.viewModel.interfaceFields.push({
			'displayMode' : self.viewModel.displayMode,
			'input' : 'dropDown',
			'value' : '',
			'label' : 'Status',
			'helpText' : 'Select from a list of status',
			'selected' : [],
			'choices' : status
		
		});

		self.viewModel.interfaceFields.push({
			'displayMode' : self.viewModel.displayMode,
			'input' : 'textArea',
			'value' : ko.observable(''),
			'label' : 'Note',
			'helpText' : 'Enter optional note',			
		
		});

		ko.applyBindings(self.viewModel);
		var windowHeight = 300;
		var windowWidth = 161 * 5;

		$("#newPersonDialogue").attr('title', "Add Workflow Stamp");
		$("#newPersonDialogue").dialog({
			height: $(window).height() < windowHeight ? $(window).height() : windowHeight, 
			width:windowWidth, 
			modal:true,
			buttons: { 
				"save": function() { 
					// send info
					// back end does not like attributes on root element
					// alert(self.viewModel.interfaceFields()[0].selected);
					// for (var i in self.viewModel.interfaceFields()[0].value)
					// 	if (self.viewModel.interfaceFields()[0].value.hasOwnProperty(i))
					// 		alert(i + " " + self.viewModel.interfaceFields()[0].value[i]);
					$.post('http://apps.testing.cwrc.ca/'+"services/ccm/item/save",
					{'xml': xml,
					'id' : pid,
					'stamp' : createWorkflowStamp(self.viewModel.interfaceFields()[0].value.value, 
												  self.viewModel.interfaceFields()[1].value.value,
												  self.viewModel.interfaceFields()[2].value.value,  
												  self.viewModel.interfaceFields()[3].value())},
					function(data){
						if (data!=-1 && data !=-2) {
							// alert(data);							
							$(this).dialog("close"); 					
						} else {
							// alert(data)
							alert("Error saving document stamp!")
						}
					}
					
					);	

					$(this).dialog("close"); 	

					
				},
				"cancel" : function(){
					$(this).dialog("close");
				}
				
			}
		});

		// alert(pid + " " + xml);

		// self.viewModel.interfaceFields.removeAll();
		

		// $("#newPersonDialogue").dialog({
		// 	height: $(window).height() < 570 ? $(window).height() : 570, 
		// 	width:590, 
		// 	modal:true,
		// 	buttons: { 
		// 		"save": function() { 
		// 			// send info
					
		// 			$(this).dialog("close"); 					
		// 		},
		// 		"cancel" : function() {
		// 			$(this).dialog("close"); 
		// 		}
				
		// 		}
		// 	});
		// self.updateUI();
		// });
	}

	self.completeNewDialog = function() {
		
		// deep copy
		// self.working = $.extend(true, {}, self.empty);
		// self.viewModel.interfaceFields = ko.observableArray([]);
		self.viewModel.interfaceFields.removeAll();
		
		// self.type = 'person';
		self.nodeStack = new Array();
		self.initializeQuantifiers();
				
		// get main interface order

		var interfaceOrder = $(self.schema).find('interface-order[type='+self.type+']');
		
		self.path = $(interfaceOrder).attr('path').split('/');
		
		interfaceOrder.children('ref').each(function(){								
			var defName = $(this).attr("name");
			$(self.schema).find('define[name='+defName+']')
					   .children()
					   .each(function(i,element) {
							self.visit(element);
					});
		});
		
		ko.applyBindings(self.viewModel);

		$("#newPersonDialogue").attr('title', "New " + self.type);

		$("#newPersonDialogue").dialog({
			height: $(window).height() < 570 ? $(window).height() : 570, 
			width:590, 
			modal:true,
			buttons: { 
				"save": function() { 
					// send info
					// back end does not like attributes on root element
					self.working = $.parseXML('<entity xmlns="http://www.w3.org/1999/xhtml"></entity>');
					var dataString = self.getWorkingXML().replace(" xmlns=\"http://www.w3.org/1999/xhtml\"", '');
					
					if (! self.editing){
												
						$.ajax({
							url: self.entityBase + 'save',
							type: 'POST',
							data: {'xml':dataString},
							dataType: 'jsonp',
							success: function(result) {
								alert(result);
								self.callback(result);
							}}
						);
											
					} else {

						$.ajax({
							url: self.entityBase + 'save',
							type: 'POST',
							data: {'xml':dataString, 'id':self.currentPID},
							dataType: 'jsonp',
							success: function(result) {
								self.callback(result);
							}}
						);
					}
					$(this).dialog("close"); 					
				},
				"cancel" : function() {
					$(this).dialog("close");
				}
			}
		});

		// Check for first name part and add the forename and sirname sections
		
		// Update the ui components
		self.updateUI();
		
	};
	


}
