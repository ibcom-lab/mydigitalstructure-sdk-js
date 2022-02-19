/*
    Uses: https://github.com/brix/crypto-js
*/

mydigitalstructure._util.protect =
{
	data: {},

	available: function (oParam)
    {
        return ('CryptoJS' in window);
    },

	key: 
    {
        data: {},
        create:
        {				
            single:	function(param)
            {
                var type;
                var persist = mydigitalstructure._util.param.get(oParam, 'persist', {default: false}).value;
                var cryptoKeyReference = mydigitalstructure._util.param.get(oParam, 'cryptoKeyReference').value;
                var local = mydigitalstructure._util.param.get(oParam, 'local', {default: false}).value;
                var keySize = 512/32;
                var savedCryptoKey = mydigitalstructure._util.param.get(oParam, 'savedCryptoKey').value;

                if (!savedCryptoKey)
                {	
                    var salt = CryptoJS.lib.WordArray.random(128/8);
                    var password = mydigitalstructure._scope.session.logonKey;
                    if (password == undefined) {password = (Math.random()).toString()}
                    var cryptoKey = CryptoJS.PBKDF2(password, salt, { keySize: keySize }).toString();

                    param = mydigitalstructure._util.param.set(param, 'cryptoKey', cryptoKey);

                    if (persist)
                    {	
                        if (local)
                        {	
                            mydigitalstructure._util.whenCan.invoke(
                            {
                                now:
                                {
                                    method: mydigitalstructure._util.local.cache.save,
                                    param:
                                    {
                                        key: sCryptoKeyReference,
                                        cryptoKeyReference: sCryptoKeyReference,
                                        persist: true,
                                        protect: oParam.protect,
                                        data: sCryptoKey
                                    }
                                },
                                then:
                                {
                                    comment: 'util.local.cache.save<>util.protect.key.create.single',
                                    method: ns1blankspace.util.protect.key.create.single,
                                    set: 'savedCryptoKey',
                                    param: oParam
                                }	
                            });
                        }
                        else
                        {
                            var oData = 
                            {
                                reference: sCryptoKeyReference,
                                key: sCryptoKey
                            }

                            $.ajax(
                            {
                                type: 'POST',
                                url: ns1blankspace.util.endpointURI('CORE_PROTECT_KEY_MANAGE'),
                                data: oData,
                                dataType: 'json',
                                success: function ()
                                {
                                    oParam.savedCryptoKey = sCryptoKey;
                                    ns1blankspace.util.protect.key.create.single(oParam)
                                }
                            });		
                        }
                    }
                }
                else
                {	
                    var sCryptoKey = mydigitalstructure._util.param.get(oParam, 'cryptoKey', {remove: true}).value;

                    if (sCryptoKeyReference && sCryptoKey)
                    {	
                        ns1blankspace.util.protect.key.data[sCryptoKeyReference] = sCryptoKey;
                    }

                    return ns1blankspace.util.whenCan.complete(sSavedCryptoKey, oParam)
                }	
            },

            pair: function(oParam) {}			
        },			

        search: 	function(oParam)
                    {
                        var bLocal = mydigitalstructure._util.param.get(oParam, 'local', {"default": false}).value;
                        var sCryptoKeyReference = mydigitalstructure._util.param.get(oParam, 'cryptoKeyReference').value;
                        var bCreateKey = mydigitalstructure._util.param.get(oParam, 'createKey', {"default": false}).value;

                        if (ns1blankspace.util.protect.key.data[sCryptoKeyReference] !== undefined)
                        {	
                            ns1blankspace.util.whenCan.complete(ns1blankspace.util.protect.key.data[sCryptoKeyReference], oParam);
                        }
                        else
                        {	
                            var sProtectCryptoKey = mydigitalstructure._util.param.get(oParam, 'protectCryptoKey').value;

                            if (sProtectCryptoKey === undefined)
                            {
                                if (bLocal)
                                {
                                    oParam = ns1blankspace.util.setParam(oParam, 'key', sCryptoKeyReference);
                                    //var sCryptoKey = ns1blankspace.util.local.cache.search(oParam);
                                    
                                    ns1blankspace.util.whenCan.execute(
                                    {
                                        now:
                                        {
                                            method: ns1blankspace.util.local.cache.search,
                                            param: oParam
                                        },
                                        then:
                                        {
                                            comment: 'util.local.cache.search<>util.protect.key.search',
                                            method: ns1blankspace.util.protect.key.search,
                                            set: 'protectCryptoKey',
                                            param: oParam
                                        }
                                    });
                                }	
                                else
                                {
                                    var oSearch = new AdvancedSearch();
                                    oSearch.method = 'CORE_PROTECT_KEY_SEARCH';
                                    oSearch.addField('key');
                                    oSearch.addField(ns1blankspace.option.auditFields);
                                    oSearch.addFilter('reference', 'EQUAL_TO', sCryptoKeyReference);
                                    oSearch.sort('modifieddate', 'desc');
                                    
                                    oSearch.getResults(function(oResponse)
                                    {
                                        oParam = ns1blankspace.util.setParam(oParam, 'protectCryptoKey', '');

                                        if (oResponse.data.rows.length !== 0)
                                        {	
                                            oParam.protectCryptoKey = oResponse.data.rows[0].key;
                                        }

                                        ns1blankspace.util.protect.key.search(oParam)
                                    });
                                }	
                            }
                            else
                            {
                                if (bCreateKey)
                                {	
                                    ns1blankspace.util.whenCan.execute(
                                    {
                                        now:
                                        {
                                            method: ns1blankspace.util.protect.key.create.single,
                                            param:
                                            {
                                                local: bLocal,
                                                persist: true,
                                                cryptoKeyReference: sCryptoKeyReference
                                            }
                                        },
                                        then:
                                        {
                                            comment: 'util.protect.key.create.single<>util.protect.key.search',
                                            method: ns1blankspace.util.protect.key.search,
                                            param: oParam
                                        }
                                    });
                                }

                                if (sProtectCryptoKey != undefined)
                                {	
                                    ns1blankspace.util.protect.key.data[sCryptoKeyReference] = sProtectCryptoKey;
                                }

                                return ns1blankspace.util.whenCan.complete(sProtectCryptoKey, oParam);
                            }
                        }	
                    }					
    },

encrypt: 	function(oParam)
    {
        if (mydigitalstructure._util.param.get(oParam, 'cryptoKey').exists)
        {
            var sData = mydigitalstructure._util.param.get(oParam, 'data', {remove: true}).value;
            var sCryptoKey = mydigitalstructure._util.param.get(oParam, 'cryptoKey', {remove: true}).value;
            var sProtectedData = CryptoJS.AES.encrypt(sData, sCryptoKey).toString();

            if (mydigitalstructure._util.param.get(oParam, 'onComplete').exists)
            {	
                oParam = ns1blankspace.util.setParam(oParam, 'protectedData', sProtectedData);
                ns1blankspace.util.onComplete(oParam)
            }
            else
            {
                return ns1blankspace.util.whenCan.complete(sProtectedData, oParam);
            }	
        }
        else
        {	
            ns1blankspace.util.whenCan.execute(
            {
                now:
                {
                    method: ns1blankspace.util.protect.key.search,
                    param: oParam
                },
                then:
                {
                    comment: 'util.protect.key.search<>util.protect.encrypt',
                    method: ns1blankspace.util.protect.encrypt,
                    set: 'cryptoKey',
                    param: oParam
                }	
            });
        }	
    },

decrypt: 	function(oParam)
    {
        if (mydigitalstructure._util.param.get(oParam, 'cryptoKey').value)
        {
            var sProtectedData = mydigitalstructure._util.param.get(oParam, 'protectedData', {remove: true}).value;
            var sCryptoKey = mydigitalstructure._util.param.get(oParam, 'cryptoKey', {remove: true}).value;
            var sData = CryptoJS.AES.decrypt(sProtectedData, sCryptoKey).toString(CryptoJS.enc.Utf8);

            if (mydigitalstructure._util.param.get(oParam, 'onComplete').exists)
            {	
                oParam = ns1blankspace.util.setParam(oParam, 'data', sData)
                ns1blankspace.util.onComplete(oParam)
            }
            else
            {
                return ns1blankspace.util.whenCan.complete(sData, oParam);
            }	
        }
        else
        {	
            ns1blankspace.util.whenCan.execute(
            {
                now:
                {
                    method: ns1blankspace.util.protect.key.search,
                    param: oParam
                },
                then:
                {
                    comment: 'util.protect.key.search<>util.protect.decrypt',
                    method: ns1blankspace.util.protect.decrypt,
                    set: 'cryptoKey',
                    param: oParam
                }	
            });
        }	
    }								
}	


mydigitalstructure._util.factory.protect = function (param)
{
	mydigitalstructure._util.controller.add(
	[
		{
			name: 'util-protext-xxx',
			code: function (param)
			{
				//mydigitalstructure._.util
			}
		},
	
	]);
}