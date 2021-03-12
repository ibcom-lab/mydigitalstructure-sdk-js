mydigitalstructure._util.security =
{
	data: {users: []},

	share:
	{
		link: 
		{ 
			add: function (param)
			{
				var shareWithGUID = mydigitalstructure._util.param.get(param, 'shareWithGUID').value;

				if (shareWithGUID != undefined)
				{
					mydigitalstructure._util.security.share.link._util.add.init(param);
				}
				else
				{
					mydigitalstructure._util.log.add({message: 'mydigitalstructure._util.security.share.link.add: Missing shareWithGUID:', keep: true });
				}
			},

			remove: function (param)
			{
				var shareGUID = mydigitalstructure._util.param.get(param, 'shareGUID').value; 

				if (shareGUID != undefined)
				{
					mydigitalstructure._util.security.share.link._util.remove.init(param);
				}
				else
				{
					mydigitalstructure._util.log.add({message: 'mydigitalstructure._util.security.share.link.remove: Missing shareGUID:', keep: true });
				}
			},

			find: function (param, response)
			{
				var shareType = mydigitalstructure._util.param.get(param, 'shareType', {default: 'shared_by_me'}).value;
				var container = mydigitalstructure._util.param.get(param, 'container').value;
				var onComplete = mydigitalstructure._util.param.get(param, 'onComplete').value;

				var sharedByContact = mydigitalstructure._util.param.get(param, 'sharedByContact', {default: {}}).value;
				var sharedWithContact = mydigitalstructure._util.param.get(param, 'sharedWithContact', {default: {}}).value;
				
				var filters = [];
				
				if (shareType == 'shared_by_me' && sharedByContact.contactperson != undefined)
				{
					filters.push(
					{
						field: 'contactperson',
						comparison: 'EQUAL_TO',
						value: sharedByContact.contactperson
					});
				}

				if (shareType == 'shared_by_my_business' && sharedByContact.contactbusiness != undefined)
				{
					filters.push(
					{
						field: 'contactbusiness',
						comparison: 'EQUAL_TO',
						value: sharedByContact.contactbusiness
					});
				}

				if (shareType == 'shared_with_me' || shareType == 'shared_with_user')
				{
					var many = (_.keys(sharedWithContact).length > 1);
					var sharedWithContactFilters = [];

					if (sharedWithContact.contactperson != undefined)
					{
						sharedWithContactFilters.push(
						{
							field: 'access.user.contactperson',
							comparison: 'EQUAL_TO',
							value: sharedWithContact.contactperson
						});
					}

					if (sharedWithContact.contactbusiness != undefined)
					{
						if (many && sharedWithContactFilters.length != 0)
						{
							sharedWithContactFilters.push(
							{
								field: 'or'
							});
						}

						sharedWithContactFilters.push(
						{
							field: 'usercontactbusiness',
							comparison: 'EQUAL_TO',
							value: sharedWithContact.contactbusiness
						});
					}

					if (sharedWithContact.user != undefined)
					{
						if (many && sharedWithContactFilters.length != 0)
						{
							sharedWithContactFilters.push(
							{
								field: 'or'
							});
						}

						sharedWithContactFilters.push(
						{
							field: 'user',
							comparison: 'EQUAL_TO',
							value: sharedWithContact.user
						});
					}

					if (sharedWithContactFilters.length != 0)
					{
						filters = _.concat(filters, [{field: '('}], sharedWithContactFilters, [{field: ')'}]);
					}
				}

				if (container != undefined)
				{
					var columns = [];

					if (shareType == 'shared_by_my_business' || shareType == 'shared_by_me')
					{
						columns = _.concat(columns,
						[
							{
								caption: 'Data shared with',
								name: 'sharedwithtext',
								sortBy: true,
								defaultSort: true,
								class: 'col-sm-12 text-left',
								data: 'id="util-security-sharing-{{id}}"'
							}
						]);
					}
					else
					{
						columns = _.concat(columns,
						[
							{
								caption: 'Shared by',
								name: 'sharedbytext',
								sortBy: true,
								defaultSort: true,
								class: 'col-sm-12 text-left',
								data: 'id="util-security-sharing-{{id}}"'
							}
						]);
					}

					columns = _.concat(columns,
					[
						{
							fields:
							[
								'guid', 'notes', 'user', 'usertext', 'access.user.contactpersontext', 'contactpersontext', 'contactbusinesstext',
								'access.user.contactperson.firstname', 'access.user.contactperson.surname'
							]
						}
					]);

					var noDataText = 'Not shared.';

					mydigitalstructure._util.controller.invoke('util-view-table',
					{
						object: 'setup_user_data_access',
						container: container,
						context: 'util-security-sharing',
						filters: filters,
						onComplete: onComplete,
						options:
						{
							noDataText: noDataText,
							rows: 20,
							orientation: 'vertical',
							progressive: true,
							class: 'table-condensed',
							deleteConfirm:
							{
								text: 'Are you sure you want to remove this share?',
								position: 'left'
							},
							header: false
						},
						format:
						{
							header:
							{
								class: 'd-flex'
							},

							row:
							{
								class: 'd-flex',
								data: 'data-id="{{id}}"',
								method: function (row)
								{
									row.sharedbytext = '';
									
									if (row.contactbusinesstext != '' && row.contactbusinesstext != undefined)
									{
										row.sharedbytext = '<div>' + row.contactbusinesstext + '</div>';
										if (row.contactpersontext != '' && row.contactpersontext != undefined)
										{
											row.sharedbytext = row.sharedbytext + 
												'<div class="text-muted">' + row.contactpersontext + '</div>';
										}
									}
									else if (row.contactpersontext != '' && row.contactpersontext != undefined)
									{
										row.sharedbytext = '<div>' + row.contactpersontext + '</div>';
									}

									row.sharedwithtext = row['access.user.contactperson.firstname'] +
															' ' + row['access.user.contactperson.surname']
								}
							},

							columns: columns
						}
					});
				}
				else
				{
					if (response == undefined)
					{
						mydigitalstructure.retrieve(
						{
							object: 'setup_user_data_access',
							data:
							{
								criteria:
								{
									fields:
									[
										{name: 'contactbusiness'},
										{name: 'contactbusinesstext'},
										{name: 'contactperson'},
										{name: 'contactpersontext'},
										{name: 'notes'},
										{name: 'user'},
										{name: 'usertext'},
										{name: 'user.contactperson'},
										{name: 'usercontactbusiness'},
										{name: 'usercontactbusinesstext'},
										{name: 'guid'}
									],
									filters: filters,
									options: {rows: 1000}
								}
							},
							callback: mydigitalstructure._util.security.share.link.find
						});
					}
					else
					{
						param = mydigitalstructure._util.param.set(param, 'data', response.data.rows);
						mydigitalstructure._util.onComplete(param);
					}
				}
			},

			request: function (param)
			{
				var shareRequestGUID = mydigitalstructure._util.param.get(param, 'shareRequestGUID').value; 

				if (shareRequestGUID != undefined)
				{
					mydigitalstructure._util.security.share.link._util.request.init(param);
				}
				else
				{
					mydigitalstructure._util.log.add({message: 'mydigitalstructure._util.security.share.link.request: Missing shareRequestGUID:', keep: true });
				}
			},

			_util:
			{
				data:
				{
					shareWithGUIDTypes:
					{
						user: {field: 'user.guid'},
						contact_business: {field: 'user.contactbusiness.guid'},
						contact_person: {field: 'user.contactperson.guid'}
					},

					shareTypes:
					[
						'shared_by_me',
						'shared_by_me_business',
						'shared_with_me'
					]
				},

				request:
				{
					init: function (param, response)
					{
						var requestObject = ['email', 'action', 'conversation_post', 'conversation_comment'];
						var requestObjectContext; //actiontypeid, conversationpostid
						var preserve = [true, false];
						var lock = [true, false]

						var data = {};

						mydigitalstructure.invoke(
						{
							object: requestObject,
							data: data
						});
					}
				},

				add: 
				{
					init: function (param, response)
					{
						var shareWithContactBusiness = mydigitalstructure._util.param.get(param, 'shareWithContactBusiness').value;

						if (shareWithContactBusiness == '' || shareWithContactBusiness == undefined)
						{
							param = mydigitalstructure._util.param.set(param, 'onComplete', mydigitalstructure._util.security.share.link._util.add.process);
							mydigitalstructure._util.security.share.link._util.getUser(param);
						}
						else
						{
							param = mydigitalstructure._util.param.set(param, 'onComplete', mydigitalstructure._util.security.share.link._util.add.processUserContactBusiness);
							mydigitalstructure._util.security.share.link._util.getUserContactBusiness(param);
						}
					},

					process: function (param, response)
					{
						//sharedBy = {contactbusiness:, contactperson:}

						var shareWithUser = mydigitalstructure._util.param.get(param, 'shareWithUser').value;

						var sharedBy = mydigitalstructure._util.param.get(param, 'sharedBy').value;
						var sharedByContact = mydigitalstructure._util.param.get(param, 'sharedByContact').value;
						var sharedByType = mydigitalstructure._util.param.get(param, 'sharedByType', {default: 'contact_person'}).value;

						if (shareWithUser != undefined && mydigitalstructure._scope.user != undefined)
						{
							if (sharedByContact == undefined)
							{
								sharedByContact = {contactbusiness: mydigitalstructure._scope.user.contactbusiness}
								if (sharedByType == 'contact_person')
								{
									sharedByContact.contactperson = mydigitalstructure._scope.user.contactperson
								} 
							}

							var data = 
							{
								contactbusiness: sharedByContact.contactbusiness,
								contactperson: sharedByContact.contactperson
							}

							if (shareWithUserContactBusiness)
							{
								data.usercontactbusiness = shareWithUser['user.contactbusiness.id'];
								data.notes = 'Shared with ' + shareWithUser['username'] + ' and other users associated with ' +
												shareWithUser['user.contactbusiness.tradename'] + ' by ' + mydigitalstructure._scope.user.userlogonname
							}
							else
							{
								data.user = shareWithUser['id'],
								data.notes = 'Shared with ' + shareWithUser['username'] + ' by ' + mydigitalstructure._scope.user.userlogonname
							}

							mydigitalstructure.save(
							{
								object: 'setup_user_data_access',
								data: data,
								callback: mydigitalstructure._util.security.share.link._util.add.finalise,
								callbackParam: param
							});
						}
					},

					processUserContactBusiness: function (param, response)
					{
						var shareWithUserContactBusiness = mydigitalstructure._util.param.get(param, 'shareWithUserContactBusiness').value;

						var sharedBy = mydigitalstructure._util.param.get(param, 'sharedBy').value;
						var sharedByContact = mydigitalstructure._util.param.get(param, 'sharedByContact').value;
						var sharedByType = mydigitalstructure._util.param.get(param, 'sharedByType', {default: 'contact_person'}).value;

						if (shareWithUserContactBusiness != undefined && mydigitalstructure._scope.user != undefined)
						{
							if (sharedByContact == undefined)
							{
								sharedByContact = {contactbusiness: mydigitalstructure._scope.user.contactbusiness}
								if (sharedByType == 'contact_person')
								{
									sharedByContact.contactperson = mydigitalstructure._scope.user.contactperson
								} 
							}

							var data = 
							{
								contactbusiness: sharedByContact.contactbusiness,
								contactperson: sharedByContact.contactperson
							}

							data.usercontactbusiness = shareWithUserContactBusiness['id'];
							data.notes = 'Shared with ' + shareWithUserContactBusiness['tradename'] +
													' by ' + mydigitalstructure._scope.user.userlogonname
							
							mydigitalstructure.save(
							{
								object: 'setup_user_data_access',
								data: data,
								callback: mydigitalstructure._util.security.share.link._util.add.finalise,
								callbackParam: param
							});
						}
					},

					finalise: function (param, response)
					{
						mydigitalstructure._util.onComplete(param);
					}
				},

				remove: 
				{
					init: function (param, response)
					{
						param = mydigitalstructure._util.param.set(param, 'onComplete', mydigitalstructure._util.security.share.link._util.remove.process);
						mydigitalstructure._util.security.share.link._util.getShare(param)
					},

					process: function (param, response)
					{
						var share = mydigitalstructure._util.param.get(param, 'share').value;
					
						if (share != undefined)
						{
							var data = 
							{
								remove: 1,
								id: share.id,
							}

							mydigitalstructure.delete(
							{
								object: 'setup_user_data_access',
								data: data,
								callback: mydigitalstructure._util.security.share.link._util.remove.finalise,
								callbackParam: param
							});
						}
					},

					finalise: function (param, response)
					{
						mydigitalstructure._util.onComplete(param);
					}
				},

				getUser: function (param, response)
				{
					var shareWithGUID = mydigitalstructure._util.param.get(param, 'shareWithGUID').value;
					var shareWithGUIDType = mydigitalstructure._util.param.get(param, 'shareWithGUIDType', {default: 'user'}).value;

					if (response == undefined)
					{
						if (shareWithGUID != undefined)
						{
							mydigitalstructure._util.security.share.link._util.data.getUser = undefined;

							var filters = [];

							if (shareWithGUID != undefined)
							{
								filters.push(
								{
									name: mydigitalstructure._util.security.share.link._util.data.shareWithGUIDTypes[shareWithGUIDType].field,
									comparison: 'EQUAL_TO',
									value: shareWithGUID
								});
							}

							mydigitalstructure.retrieve(
							{
								object: 'setup_user',
								data:
								{
									criteria:
									{
										fields:
										[
											{name: 'user.contactbusiness.tradename'},
											{name: 'user.contactbusiness.id'},
											{name: 'user.contactperson.firstname'},
											{name: 'user.contactperson.surname'},
											{name: 'user.contactperson.email'},
											{name: 'user.contactperson.id'},
											{name: 'username'},
											{name: 'manager'},
											{name: 'notes'}
										],
										filters: filters,
										options: {rows: 1}
									}
								},
								callback: mydigitalstructure._util.security.share.link._util.getUser,
								callbackParam: param
							});
						}
						else
						{
							mydigitalstructure._util.log.add({message: 'mydigitalstructure._util.security.share.link._util.getUser: Missing shareWithGUID:', keep: true });
						}	
					}
					else
					{
						if (response.data.rows.length != 0)
						{
							mydigitalstructure._util.security.share.link._util.data.getUser = response.data.rows[0];
						}

						param.shareWithUser = mydigitalstructure._util.security.share.link._util.data.getUser;
						mydigitalstructure._util.onComplete(param);
					}	
				},

				getUserContactBusiness: function (param, response)
				{
					var shareWithContactBusiness = mydigitalstructure._util.param.get(param, 'shareWithContactBusiness').value;

					if (response == undefined)
					{
						if (shareWithContactBusiness != undefined)
						{
							mydigitalstructure._util.security.share.link._util.data.getUserContactBusiness = undefined;

							var filters = [];

							filters.push(
							{
								name: 'id',
								comparison: 'EQUAL_TO',
								value: shareWithContactBusiness
							});
							
							mydigitalstructure.retrieve(
							{
								object: 'contact_business',
								data:
								{
									criteria:
									{
										fields:
										[
											{name: 'tradename'}
										],
										filters: filters,
										options: {rows: 1}
									}
								},
								callback: mydigitalstructure._util.security.share.link._util.getUserContactBusiness,
								callbackParam: param
							});
						}
						else
						{
							mydigitalstructure._util.log.add({message: 'mydigitalstructure._util.security.share.link._util.getUserContactBusiness: Missing shareWithContactBusiness:', keep: true });
						}	
					}
					else
					{
						if (response.data.rows.length != 0)
						{
							mydigitalstructure._util.security.share.link._util.data.getUserContactBusiness = response.data.rows[0];
						}

						param.shareWithUserContactBusiness = mydigitalstructure._util.security.share.link._util.data.getUserContactBusiness;
						mydigitalstructure._util.onComplete(param);
					}	
				},

				getShare: function (param, response)
				{
					var shareGUID = mydigitalstructure._util.param.get(param, 'shareGUID').value;
	
					if (response == undefined)
					{
						if (shareGUID != undefined)
						{
							mydigitalstructure._util.security.share.link._util.data.getShare = undefined;

							var filters = [];

							filters.push(
							{
								name: 'guid',
								comparison: 'EQUAL_TO',
								value1: shareGUID
							});

							mydigitalstructure.retrieve(
							{
								object: 'setup_user_data_access',
								data:
								{
									criteria:
									{
										fields:
										[
											{name: 'contactbusiness'},
											{name: 'contactperson'},
											{name: 'user'},
											{name: 'access.user.contactperson'},
											{name: 'notes'}
										],
										filters: filters,
										options: {rows: 1}
									}
								},
								callback: mydigitalstructure._util.security.share.link._util.getShare,
								callbackParam: param
							});
						}
						else
						{
							mydigitalstructure._util.log.add({message: 'mydigitalstructure._util.security.share.link._util.getShare: Missing shareGUID:', keep: true });
						}	
					}
					else
					{
						if (response.data.rows.length != 0)
						{
							mydigitalstructure._util.security.share.link._util.data.getShare = response.data.rows[0];
						}

						param.share = mydigitalstructure._util.security.share.link._util.data.getShare;
						mydigitalstructure._util.onComplete(param);
					}
					
				}
			}
		},

		//[[user]], [[contactperson]] or [[contactbusiness]]

		setup:
		{
			data:
			{
				roles:
				{
					sharedBy:
					{
						title: 'Shared By',
						methods:
						[
							{
								title: 'SETUP_USER_SEARCH',
								canuse: 'Y',
								guidmandatory: 'Y'
							},
							{
								title: 'SETUP_USER_DATA_ACCESS_SEARCH',
								canuse: 'Y',
								guidmandatory: 'N'
							},
							{
								title: 'SETUP_USER_DATA_ACCESS_MANAGE',
								canadd: 'Y',
								canupdate: 'Y',
								canremove: 'Y',
								guidmandatory: 'N'
							}
						],
						properties:
						[
							{
								methodtitle: 'SETUP_USER_DATA_ACCESS_MANAGE',
								name: 'contactperson',
								allowedvalues: '[[contactperson]]',
								disallowedvalues: '',
								notes: 'As user can only add sharing for self.',
								type: undefined
							},
							{
								methodtitle: 'SETUP_USER_DATA_ACCESS_MANAGE',
								name: 'contactbusiness',
								allowedvalues: '[[contactbusiness]]',
								disallowedvalues: '',
								notes: 'As user can only add sharing for own contact business',
								type: undefined
							},
							{
								methodtitle: 'SETUP_USER_DATA_ACCESS_SEARCH',
								name: 'contactperson',
								allowedvalues: '[[contactperson]]',
								notes: 'As user can only search for sharing for self.',
								type: undefined
							},
							{
								methodtitle: 'SETUP_USER_DATA_ACCESS_SEARCH',
								name: 'contactbusiness',
								allowedvalues: '[[contactbusiness]]',
								disallowedvalues: '',
								notes: 'As user can only search for sharing for own contact business',
								type: undefined
							}
						]
					},

					sharedWith:
					{
						title: 'Shared With',
						methods:
						[
							{
								title: 'SETUP_USER_SEARCH',
								canuse: 'Y'
							},
							{
								title: 'SETUP_USER_DATA_ACCESS_SEARCH',
								canuse: 'Y'
							}
						],
						properties:
						[
							{
								methodtitle: 'SETUP_USER_SEARCH',
								name: 'id',
								allowedvalues: '[[user]]',
								disallowedvalues: '',
								notes: 'As user can only see own user details.'
							},
							{
								methodtitle: 'SETUP_USER_DATA_ACCESS_SEARCH',
								name: 'user',
								allowedvalues: '[[user]]',
								notes: 'As user can only search for sharing where shared with them.'
							}
						]
					}
				}
			},

			//user relationship manager type: disabled//tight

			init: function (param)
			{
				var shareUserRoleTitle = mydigitalstructure._util.param.get(param, 'shareUserRoleTitle').value;
				var shareType = mydigitalstructure._util.param.get(param, 'shareType', {default: 'sharedBy'}).value;
				var accessRole = mydigitalstructure._util.security.share.setup.data.roles[shareType];

				if (accessRole != undefined)
				{
					mydigitalstructure._util.security.share.setup.import.data.accessRole = accessRole;

					if (shareUserRoleTitle == undefined)
					{
						mydigitalstructure._util.security.share.setup.import.userRole()
					}
					else
					{
						var filters =
						[
							{
								filter: 'title',
								comparison: 'EQUAL_TO',
								value: shareUserRoleTitle
							}
						]

						mydigitalstructure.retrieve(
						{
							object: 'setup_role',
							fields: {name: 'title'},
							filters: filters,
							callback: mydigitalstructure._util.security.share.setup.import.userRole
						});
					}
				}
			},

			import:
			{
				data: {},

				userRole: function (param, response)
				{
					if (response == undefined)
					{
						var data =
						{
							title: mydigitalstructure._util.security.share.setup.import.data.accessRole.title
						}

						mydigitalstructure.create(
						{
							object: 'setup_role',
							data: data,
							callback: mydigitalstructure._util.security.share.setup.import.userRole
						});
					}
					else
					{
						if (response.status == 'ER')
						{}
						else
						{
							if (_.has(response, 'data'))
							{
								if (response.data.rows.length > 0)
								{
									mydigitalstructure._util.security.share.setup.import.data.roleID = _.first(response.data.rows).id;
								}
							}
							else
							{
								mydigitalstructure._util.security.share.setup.import.data.roleID = response.id;
							}

							mydigitalstructure._util.security.share.setup.import.methods(param);
						}
					}
				},

				methods: function (param, response)
				{
					if (response == undefined)
					{
						var methodTitles = _.map(mydigitalstructure._util.security.share.setup.import.data.accessRole.methods, 'title');
						var propertyMethodTitles = _.map(mydigitalstructure._util.security.share.setup.import.data.accessRole.properties, 'methpdtitle');

						var filters =
						[
							{
								field: 'title',
								comparison: 'IN_LIST',
								value: _.join(_.concat(methodTitles, propertyMethodTitles), ',')
							}
						]

						mydigitalstructure.retrieve(
						{
							object: 'setup_method',
							fields: {name: 'title'},
							filters: filters,
							callback: mydigitalstructure._util.security.share.setup.import.methods
						});
					}
					else
					{
						mydigitalstructure._util.security.share.setup.import.data.methods = response.data.rows;

						if (mydigitalstructure._util.security.share.setup.import.data.methods.length != 0)
						{
							mydigitalstructure._util.security.share.setup.import.userRoleMethods()
						}
					}
				},

				userRoleMethods: function (param, response)
				{
					if (mydigitalstructure._util.security.share.setup.import.data.roleID == undefined)
					{}
					else
					{
						var userRoleMethodIndex = mydigitalstructure._util.param.get(param, 'userRoleMethodIndex', {default: 0}).value;
						var userRoleMethods = mydigitalstructure._util.security.share.setup.import.data.accessRole.methods;
						var userRoleMethod;

						if (userRoleMethodIndex < userRoleMethods.length)
						{
							param = mydigitalstructure._util.param.set(param, 'userRoleMethodIndex', userRoleMethodIndex + 1);
							userRoleMethod = userRoleMethods[userRoleMethodIndex];

							var method = _.find(mydigitalstructure._util.security.share.setup.import.data.methods,
															function (method) {return method.title == userRoleMethod.title});

							if (method != undefined)
							{
								var data =
								{
									role: mydigitalstructure._util.security.share.setup.import.data.roleID,
									accessmethod: method.id,
									canuse: userRoleMethod.canuse,
									canadd: userRoleMethod.canadd,
									canupdate: userRoleMethod.canupdate,
									canremove: userRoleMethod.canremove,
									guidmandatory: userRoleMethod.guidmandatory
								}

								mydigitalstructure.create(
								{
									object: 'setup_role_method_access',
									data: data,
									callback: mydigitalstructure._util.security.share.setup.import.userRoleMethods,
									callbackParam: param
								});
							}
						}
						else
						{
							if (mydigitalstructure._util.security.share.setup.import.data.accessRole.properties != undefined)
							{
								mydigitalstructure._util.security.share.setup.import.userRoleProperties()
							}
							else
							{
								mydigitalstructure._util.security.share.setup.import.finalise()
							}
						}
					}
				},

				userRoleProperties: function (param, response)
				{
					if (mydigitalstructure._util.security.share.setup.import.data.roleID == undefined)
					{}
					else
					{
						var userRolePropertyIndex = mydigitalstructure._util.param.get(param, 'userRolePropertyIndex', {default: 0}).value;
						var userRoleProperties = mydigitalstructure._util.security.share.setup.import.data.accessRole.properties;
						var userRoleProperty;

						if (userRolePropertyIndex < userRoleProperties.length)
						{
							param = mydigitalstructure._util.param.set(param, 'userRolePropertyIndex', userRolePropertyIndex + 1);
							userRoleProperty = userRoleProperties[userRolePropertyIndex];

							var method = _.find(mydigitalstructure._util.security.share.setup.import.data.methods,
															function (method) {return method.title == userRoleProperty.methodtitle});

							if (method != undefined)
							{
								var data =
								{
									role: mydigitalstructure._util.security.share.setup.import.data.roleID,
									accessmethod: method.id,
									parameter: userRoleProperty.name,
									allowedvalues: userRoleProperty.allowedvalues,
									disallowedvalues: userRoleProperty.disallowedvalues,
									notes: userRoleProperty.notes,
									type: userRoleProperty.type
								}

								mydigitalstructure.create(
								{
									object: 'setup_role_parameter_access',
									data: data,
									callback: mydigitalstructure._util.security.share.setup.import.userRoleProperties,
									callbackParam: param
								});
							}
						}
						else
						{
							mydigitalstructure._util.security.share.setup.import.finalise()
						}
					}
				},

				finalise: function (param)
				{
					mydigitalstructure._util.onComplete(param);
				}
			}
		},

		// Check to see if rules have been set up OK
		check:
		{
			init: function (param)
			{
				//Based on a access policy check/validate the users set up - for security auditing.
			}
		},

		user: 
		{
			init: function (param)
			{
				var userID = mydigitalstructure._util.param.get(param, 'userID').value;

				//userID =

				// Access policy:

				// - Can see all data (user)
				// - Can only see own linked data (user)

				// - Can set up shares with other users (user-role)
				// - Can see other contact data shared with them (user-role)

				/*
				userDataPolicy =
				{
					access:
					{
						all: true
						onlyOwn: true
					},

					share:
					{
						canRequestShare: true,
						canSetupShare: true,
						canAcceptShare: true 
					}
				}
				*/


			}
		}
	}
}

mydigitalstructure.security = {share: mydigitalstructure._util.security.share.link}

mydigitalstructure._util.factory.security = function (param)
{
	mydigitalstructure._util.controller.add(
	[
		{
			name: 'util-security-share-add',
			code: function (param)
			{
				mydigitalstructure.security.share.add(param);
			}
		},
		{
			name: 'util-security-share-find',
			code: function (param)
			{
				mydigitalstructure.security.share.find(param);
			}
		},
		{
			name: 'util-security-share-remove',
			code: function (param)
			{
				mydigitalstructure.security.share.remove(param);
			}
		},
		{
			name: 'util-security-share-setup',
			code: function (param)
			{
				mydigitalstructure._util.security.share.setup.init(param);
			}
		}
	]);

	mydigitalstructure._util.controller.add(
	{
		name:	'util-security-sharing-show',
		code: function (param)
		{
			if (param.status == 'shown')
			{
				var data = app._util.data.get(
				{
					controller: 'util-security-sharing-show',
					context: 'dataContext',
					valueDefault: {}
				});

				var sharedByContact = {}
				var shareType = 'shared_by_my_business';

				if (data.object == 12)
				{
					sharedByContact.contactbusiness = data.objectcontext
				}

				if (data.object == 32)
				{
					sharedByContact.contactperson = data.objectcontext;
					shareType = 'shared_by_me';
				}

				mydigitalstructure.security.share.find(
				{
					container: data.container,
					sharedByContact: sharedByContact,
					shareType: shareType
				});
			}
		}
	});
}

mydigitalstructure._util.security.trusted =
{
	data: {},
	google:
	{
		onSignIn: function (googleUser)
		{
			var profile = googleUser.getBasicProfile();
			var id_token = googleUser.getAuthResponse().id_token;

			var user =
			{
				id: profile.getId(),
				name: profile.getName(),
				imageURL: profile.getImageUrl(),
				email: profile.getEmail(),
				idToken: id_token
			}

			console.log(user)
			console.log(id_token)

			return user;

			/*
			console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
			console.log('Name: ' + profile.getName());
			console.log('Image URL: ' + profile.getImageUrl());
			console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
			*/
		},

		signOut: function ()
		{
			var auth2 = gapi.auth2.getAuthInstance();
			auth2.signOut().then(function ()
			{
				console.log('User signed out.');
			});
		}
	},

	_util:
	{
		jwt:
		{
			data: {},

			verify: function (token, key, acceptField)
			{
				//https://github.com/kjur/jsrsasign
				//https://kjur.github.io/jsrsasign/api/symbols/KJUR.jws.JWS.html#.verifyJWT
				//https://github.com/kjur/jsrsasign/blob/master/sample/sample_jwsverify.html

				//var sJWS = token;
				//var hN = key.n;
				//var hE = key.e;
				//pubKey = KEYUTIL.getKey({n: hN, e: hE});

				var jws = new KJUR.jws.JWS();
				var isValid = false;
				var pubKey;
				var hasError = false;
				var error;

				if (acceptField == undefined)
				{
					acceptField = {alg: ["RS256"]}
				}

				try
				{
					pubKey = KEYUTIL.getKey(key);
					jws.parseJWS(token);
					isValid = KJUR.jws.JWS.verifyJWT(token, pubKey, acceptField);
				}
				catch (ex)
				{
					error = ex;
					hasError = true;
					isValid = false;
				}

				var returnValue = {valid: isValid};

				if (hasError)
				{
					returnValue.error = error;
				}
				else
				{
					if (isValid)
					{
						returnValue.parsedJWT = jws.parsedJWS
					}
				}

				return returnValue;
			},

			decode: function (param)
			{
				if (_.isObject(window.Base64))
				{
					if (mydigitalstructure._util.versionCheck('3.4.4', Base64.VERSION))
					{
						var token = mydigitalstructure._util.param.get(param, 'token').value;
						var key = mydigitalstructure._util.param.get(param, 'key').value;
						var keys = mydigitalstructure._util.security.trusted._util.jwt.data.keys;
						var keyType = 'cert';

						if (token != undefined)
						{
							if (key == undefined && keys == undefined)
							{
								param = mydigitalstructure._util.param.set(param, 'onComplete', mydigitalstructure._util.security.trusted._util.jwt.decode);
								mydigitalstructure._util.security.trusted._util.jwt.getKeys(param)
							}
							else
							{
								var _token = token.split('.');
								
								var parsedJWT = 
								{
									header: _token[0],
									payload: _token[1],
									signature: _token[2]
								}

								var decodedJWT = 
								{
									header: JSON.parse(Base64.fromBase64(parsedJWT.header)),
									payload: JSON.parse(Base64.fromBase64(parsedJWT.payload))
								}

								if (key == undefined)
								{
									if (keyType == 'cert')
									{
										key = keys[decodedJWT.header.kid]
									}
									else
									{
										mydigitalstructure._util.security.trusted._util.jwt.data._key = _.find(keys, function (key) {return key.kid == decodedJWT.header.kid});
									}

									if (mydigitalstructure._util.security.trusted._util.jwt.data._key != undefined)
									{
										key = mydigitalstructure._util.security.trusted._util.jwt.data._key.n;
									}
								}

								var verification;

								if (keyType == 'cert')
								{
									verification = mydigitalstructure._util.security.trusted._util.jwt.verify(token, key)
								}
								else
								{
									verification = mydigitalstructure._util.security.trusted._util.jwt.verify(token, mydigitalstructure._util.security.trusted._util.jwt.data._key)
								}

								mydigitalstructure._util.security.trusted._util.jwt.data = _.assign(
								mydigitalstructure._util.security.trusted._util.jwt.data,
								{
									sourceJWT: token,
									_sourceJWT: _token,
									parsedJWT: parsedJWT,
									decodedJWT: decodedJWT,
									verification: verification
								});

								//console.log(mydigitalstructure._util.security.trusted._util.jwt.data)
								mydigitalstructure._util.onComplete(param)
							}
						}
					}
					else
					{
						console.log('Base64.js needs to be vesion 3.4.5 or higher.')
					}
				}

			},

			getKeys: function (param, response)
			{
				var keysURI = mydigitalstructure._util.param.get(param, 'keysURI',
									{default: 'https://www.googleapis.com/oauth2/v1/certs'}).value;

				if (mydigitalstructure._util.security.trusted._util.jwt.data.keys == undefined)
				{
					if (response == undefined)
					{
						mydigitalstructure.cloud.invoke(
						{
							method: 'core_url_get',
							data:
							{
								url: keysURI,
								asis: 'Y'
							},
							callback: mydigitalstructure._util.security.trusted._util.jwt.getKeys,
							callbackParam: param
						})
					}
					else
					{
						if (_.has(response, 'keys'))
						{
							mydigitalstructure._util.security.trusted._util.jwt.data.keys = response.keys;
						}
						else
						{
							mydigitalstructure._util.security.trusted._util.jwt.data.keys = response;
						}

						if (response != undefined)
						{
							mydigitalstructure._util.onComplete(param, response);
						}
						else
						{
							console.log('Can not get keys')
						}
					}
				}
				else
				{
					mydigitalstructure._util.onComplete(param)
				}
				
			}
		}
	}
}