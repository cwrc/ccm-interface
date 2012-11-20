var CCM = function(config) {
	var self = this;
	self.config = config || {};
	
	this.init = function() {

		// var tabsTemplate = '<script type="text/html" id="tabsTemplate">' +
		// 					'<span data-bind="text:name"></span>' +
		// 				   	'</script>';

		var queryTemplate = '<script type="text/html" id="queryTemplate">' +
							// 'Query template' +
							'<span data-bind="text: data.index()*data.rows()"></span>-' +
							'<span data-bind="text: data.index()*data.rows()"></span> of ' +
							'<span data-bind="text: data.content().response.numFound"></span> ' +
							'<a href="#" class="cwrcButton" data-bind="click:function(){$root.paginateSearchLeft($data);}">'+
							'<span class="cwrcButton ui-icon ui-icon-triangle-1-w"></span></a>' +
							'<a href="#" class="cwrcButton" data-bind="click:function(){$root.paginateSearchRight($data);}">' +
							'<span class="cwrcButton ui-icon ui-icon-triangle-1-e"></span></a>' +
							'<table class="cwrcSearchQueryResults">' +
							'<thead><tr>' +
							'<th>Label</th><th>Type</th>' +
							'</tr></thead><tbody>' +
							'{{each(index, doc) data.content().response.docs}}' +
							'<tr>' +
							'<td data-bind="text:doc[\'gen.label\']"></td>' +
							'<td data-bind="text:doc[\'gen.type\']"></td>' +
							'</tr>' +					
							'{{/each}}' +					
							'</tbody></table>' +
						   	'</script>';


		var cwrcEditorTemplate = '<script type="text/html" id="cwrcEditorTemplate">' +
							'<iframe data-bind="attr: { id: data.tabId}" class="cwrcEditor" src="' + self.config.baseurl + 'dialogs/ccm/cwrceditor/editor.htm" scrolling="0" frameborder="0">​</iframe>'
							'</script>';
					
		var dashboardTemplate = '<script type="text/html" id="dashboardTemplate">' +
							// 'Dashboard template - create new - working with - notifications' +
							'<div>New:' +
							'<ul>' +
							'<li><a href="#" class="cwrcCreateNewEditor" id="cwrcCreateNewEvent">Event</a></li>' +
							'<li><a href="#" class="cwrcCreateNewEditor" id="cwrcCreateNewLetter">Letter</a></li>' +
							'<li><a href="#" class="cwrcCreateNewEditor" id="cwrcCreateNewPoem">Poem</a></li>' +
							'<li><a href="#" class="cwrcCreateNewEditor" id="cwrcCreateNewProse">Prose</a></li>' +
							'</ul>'+
							'<table class="cwrcNotifications">' +
								'<thead>'+
									'<tr>'+
										'<th>Subject</th>'+
										'<th>Created by</th>'+
										'<th>Description</th>'+									
										'<th>Time stamp</th>'+
										'<th>Responses</th>'+
									'</tr>'+
								'</thead><tbody>'+
								'{{each(index, notification) $root.notifications() }}' +
								'<tr>'+
								'<td><span data-bind="text: notification.subject"></span></td>'+									
								'<td><span data-bind="text: notification.creator"></span></td>'+
								'<td><span data-bind="text: notification.description"></span></td>'+
								'<td><span data-bind="text: notification.timeStamp"></span></td>'+
								'<td>'+
									'{{each(index, response) notification.responses() }}' +
										// '<button type="button"><span data-bind="text: response.value"></span></button>'+
										'<button type="button" data-bind="click: function(){$root.performResponse(response, notification)}"><span data-bind="text: response.value"></span></button>'+
									'{{/each}}' +					
									// '<div data-bind="foreach: responses">'+
										//'<button type="button" data-bind="click: $root.performResponse.bind($data, $parent)"><span data-bind="text: value"></span></button>'+
									// '</div>'+
								'</td>'+
								'</tr>'+
								'{{/each}}' +					
								'</tbody>'+
								// '<tbody data-bind="foreach: notifications">'+
								// 	'<tr>'+
								// 		'<td><span data-bind="text: subject"></span></td>'+									
								// 		'<td><span data-bind="text: creator"></span></td>'+
								// 		'<td><span data-bind="text: description"></span></td>'+
								// 		'<td><span data-bind="text: timeStamp"></span></td>'+
								// 		'<td>'+
								// 			'<div data-bind="foreach: responses">'+
								// 				'<button type="button" data-bind="click: $root.performResponse.bind($data, $parent)"><span data-bind="text: value"></span></button>'+
								// 			'</div>'+
								// 		'</td>'+
								// 	'</tr>'+
								// '</tbody>'+
							'</table>'+
						   	'</script>';


		var docs = {stamps :{}, 
					test:{}};
		docs.stamps.creation = function() {
			var now = new Date();
			return	'<cwrc:workflow xmlns:cwrc="cwrc.ca/workflow">'+
					    '<cwrc:auto date="'+now.toString('yyyy-MM-dd')+'" toolID="EntityInterface" datastreamID="CWRC-ENTITY">'+
					        '<cwrc:activity category="created" stamp="cwrc:cre" status="c">'+
					       ' </cwrc:activity>'+
					        '<cwrc:assigned process="entityApproval" category="metadata_contribution">'+
					            '<cwrc:tool toolID="entityManager">'+
					                '<cwrc:note>Entity flagged for approval by administrator.</cwrc:note>'+
					            '</cwrc:tool>'+                        
					        '</cwrc:assigned>'+           
					    '</cwrc:auto>'+
					'</cwrc:workflow>';
		}						   	
			
		docs.test.newDocument = function(id) {
			
			var url = ''
			switch(id) {
				case 'cwrcCreateNewProse':
					url = self.config.baseurl+'dialogs/ccm/xml/templates/prose_template-TEI.xml';
				break;
				case 'cwrcCreateNewPoem':
					url = self.config.baseurl+'dialogs/ccm/xml/templates/poem_template-TEI.xml';
				break;
				case 'cwrcCreateNewLetter':
					url = self.config.baseurl+'dialogs/ccm/xml/templates/letter_template-TEI.xml';
				break;
				case 'cwrcCreateNewEvent':
					url = self.config.baseurl+'dialogs/ccm/xml/templates/event_template.xml';
				break;
			}


			return $.ajax(
  						{
    						type: 'GET',
    						async: false,
    						url:  url
  						}).responseText;

		};

		// $('head').append(tabsTemplate);
		$('head').append(queryTemplate);
		$('head').append(cwrcEditorTemplate);
		$('head').append(dashboardTemplate);
		// $('head').append(mainTabTemplate);
		// $('head').append(tabTemplate);
		// $('head').append(cwrcTabsTemplate);
	
	
		$(document).ready(function() {
			
	
			
			$(".cwrcButton").button();
			$("#cwrcSearchBar").find('input').watermark("Search");
			// XXX TEMP
			$("#cwrcLogoutButton").click(function(){ 
				window.location = "http://logout@apps.testing.cwrc.ca/dialogs/ccm";
			});
	
			self.workingCategory = "";
			self.viewModel = { tabs : ko.observableArray([]),
								notifications : null};
			// XXX Hardcoded user notifications
			$.ajax({
				url:'http://apps.testing.cwrc.ca/services/NotificationManager/notifications/13',
				async:false,
				dataType:'json',
				success:function(data) {
					// alert(data)
					self.viewModel.notifications =  ko.mapping.fromJS(data);
					// alert(self.viewModel.notifications())
				}
			});

			self.createTab = function(type, name, data) {
				var result = {
					'type': type,
					'name': name,
					'data': data
				};		
				return result;
			}
			
			
			self.viewModel.stylelizeTable = function() {
					$(".cwrcSearchQueryResults th").each(function(){
				  		$(this).addClass("ui-state-default");
				  	});
					$(".cwrcSearchQueryResults tr:odd").each(function(){
						$(this).addClass("ui-widget-content");
					});
					$(".cwrcSearchQueryResults tr:even").each(function(){
						$(this).addClass("ui-state-highlight");
					});
			}

			self.viewModel.querySolr = function(start, rows, query, callback) {
				$.ajax({
					type: "POST",
					url: self.config.baseurl + "/solr/solr_core_default/select?wt=json&start="+start+"&rows="+rows+"&q=" + query,
					//url: "http://apps.testing.cwrc.ca/dialogs/ccm//json/solrresult.json",
					dataType: "json",
					success: function(data) {
						// after getting response add tab to dashboard.
						callback(data);
						// Stylelize table
						// $(".cwrcSearchQueryResults").addClass("ui-widget");				
						// $(".cwrcSearchQueryResults thead").addClass("ui-widget-header");				
						self.viewModel.stylelizeTable();

					},
					error: function (xhr, ajaxOptions, thrownError){
				        alert(xhr.statusText);
				        alert(thrownError);
					}
				});
			}

			self.viewModel.getHref = function(tab) {
				return '#' + tab.data.id;
			}

			self.viewModel.displayMode = function(tab) {
				return tab.type + "Template";
			}

			self.viewModel.removeItem = function(item) {
			        // this.items.remove(item);
				var newSelected = self.viewModel.tabs.indexOf(item) - 1;
				self.viewModel.tabs.remove(item);
				self.viewModel.selected(self.viewModel.tabs()[newSelected]);

		    };

			self.viewModel.moveItem = function(item, index) {
			        self.viewModel.tabs.remove(item);
			        self.viewModel.tabs.splice(index, 0, item);
		    };

			self.viewModel.paginateSearchLeft = function(tab) {

				if (tab.data.index() > 0) {
					tab.data.index(tab.data.index() -1);
					self.viewModel.updateSearchTable(tab);
				}
			}

			self.viewModel.paginateSearchRight = function(tab) {
				var totalIndexes = Math.round(tab.data.content().response.numFound / tab.data.rows())-1;
				var nextIndex = tab.data.index() +1;

				if (nextIndex <= totalIndexes) {
					tab.data.index(nextIndex);
					self.viewModel.updateSearchTable(tab);
				}
			}

			self.viewModel.updateSearchTable = function(tab) {
				var rows = tab.data.rows();
				var start = tab.data.index()*rows;

				self.viewModel.querySolr(start, rows, tab.data.content().responseHeader.params.q, function(content){
					tab.data.content(content);
					$(".cwrcButton").button();								
				})
			}
						
			// Add dashboard
			self.viewModel.tabs.push(self.createTab('dashboard', 'Dashboard', {removable:false}));
	
			$("#cwrcSearchBar").find('button')
				.button()
				.click(function(){		
			
				
					// make call
					var startingRows = 23;
					var searchQuery = $("#cwrcSearchBar").find('input').val().trim();	
					if (searchQuery == '') {
						searchQuery = '*'
					}
					$("#cwrcSearchBar").find('input').val('');
			
					self.viewModel.querySolr(0, startingRows, searchQuery, function(data){
						self.viewModel.tabs.push(self.createTab('query', 
														  'Search: ' + searchQuery, 
														  {removable:true,
														   index:ko.observable(0),
														   rows:ko.observable(startingRows),
														   content: ko.observable(data)}));
						self.selectLastTab();
					});
			
					// $('.cwrcCloseTabButton').button();

			});

			// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
			self.guidGenerator = function() {
    			var S4 = function() {
       				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    			};
    			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
			}
			
			self.callAPI = function(type, url, data, success) {
				$.ajax({
					type: type,
					url: self.config.baseurl + url,
					data: data,
					dataType: "text",
					success: function(data) {
						success(data);						
					},
					error: function (xhr, ajaxOptions, thrownError){
				        alert(xhr.statusText);
				        alert(thrownError);
					}
				});		
			}

			self.selectLastTab = function() {
				var length = self.viewModel.tabs().length;
				self.viewModel.selected(self.viewModel.tabs()[length-1]);
			}

			// http://www.ke-cai.net/2010/01/theme-your-table-with-$-ui.html
		
			ko.bindingHandlers.ready = {
				init: function(element, valueAccessor) {
					$(element).ready(function(){
						var success = valueAccessor();
						success(element);
					})
				}
			}

			self.viewModel.performResponse = function(response, notification) {
				// alert(notification.action);
				// alert(response)
				// for (var i in response)
				// 	if (response.hasOwnProperty(i)) {
				// 		alert(i + " " + response[i])
				// 	}
				alert(response.action());
				self.viewModel.notifications.remove(notification);

				// jQuery.getJSON(response.action);

				//alert(notification);
				//self.viewModel.notifications.remove(notification);
			}
			
			self.viewModel.selected = ko.observable(self.viewModel.tabs()[0]);
	




			ko.applyBindings(self.viewModel);
			var setTabHeight = function (){
				var containerPadding = 150;
				var tabPadding = 210;
				$('.tab-content').css({'height': (($(window).height()) - tabPadding)+'px'});	
				$('.tab-pane').css({'height': (($(window).height()) - tabPadding)+'px'});	
				$('.tabTemplate').css({'height': (($(window).height()) - tabPadding)+'px'});	


				$(window).resize(function(){
				// $('.tabbable') .css({'height': (($(window).height()) - containerPadding)+'px'});		
				$('.tab-content').css({'height': (($(window).height()) - tabPadding)+'px'});		
				$('.tab-pane').css({'height': (($(window).height()) - tabPadding)+'px'});	
				$('.tabTemplate').css({'height': (($(window).height()) - tabPadding)+'px'});	

			});	
			}
			$(".cwrcCreateNewEditor").click(function(){
				// create new document
				var tabId = self.guidGenerator();

				$.post(self.config.baseurl+"services/ccm/item/save",
					{xml:docs.test.newDocument($(this).attr('id')),
					stamp:docs.stamps.creation()},
					function(data){
						if (data!=-1 && data !=-2) {
							// alert(data);
							self.viewModel.tabs.push(self.createTab('cwrcEditor', 
																	'New Document', 
																	{removable:true,
																	 'tabId': tabId,
																	}));								
									
							// alert("Loading...");
							var load = function(){
								
								if ($("#"+tabId)[0].contentWindow.writer != null) {
									$("#"+tabId)[0].contentWindow.writer.fm.loadDocumentFromUrl(self.config.baseurl+"services/ccm/item/"+data);										
									$("#"+tabId)[0].contentWindow.writer.docPID = data;
									self.selectLastTab();
									setTabHeight();
								} else {
									setTimeout(load, 3000);									
								}

							} 

							load();

							// setTimeout(load, 5500);




						} else {
							// alert(data)
							alert("Error creating new document!")
						}
					}
				);



			});	

			// XXX TEMP



			
			setTabHeight();
	
			// https://apps.testing.cwrc.ca/solr/solr_core_default/select?wt=json&q=jeff
	
		});
	}
	
	return self;
}