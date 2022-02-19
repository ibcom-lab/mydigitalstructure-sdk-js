/*
    Utility for protecting data through encryption and storing locally.

    Uses: https://github.com/brix/crypto-js

    Data stored locally can also be protected using a key stored on mydigitalstructure.cloud.

    ie to pre-encrypt data before saving on mydigitalstructure.cloud:

    1. Create a key [localDataProtectionKey]
    2. Save key [localDataProtectionKey] in local browser cache, but before saving it:
        2a. Create another key [cloudLocalKeyProtectionKey] that is saved on mydigitalstructure.cloud against the user account.
        2b. Use the cloudKey to encrypt the local key
    3. Use the local [localDataProtectionKey] key to encrypt data

*/

mydigitalstructure._util.protect =
{
	data: {},

	available: function (param)
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
                var persist = mydigitalstructure._util.param.get(param, 'persist', {default: false}).value;
                var cryptoKeyReference = mydigitalstructure._util.param.get(param, 'cryptoKeyReference').value;
                var local = mydigitalstructure._util.param.get(param, 'local', {default: false}).value;
                var keySize = 512/32;
                var savedCryptoKey = mydigitalstructure._util.param.get(param, 'savedCryptoKey').value;

                if (!savedCryptoKey && persist)
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
                                        key: cryptoKeyReference,
                                        cryptoKeyReference: cryptoKeyReference,
                                        persist: true,
                                        protect: param.protect,
                                        data: cryptoKey
                                    }
                                },
                                then:
                                {
                                    comment: 'util.local.cache.save<>util.protect.key.create.single',
                                    method: mydigitalstructure._util.protect.key.create.single,
                                    set: 'savedCryptoKey',
                                    param: param
                                }	
                            });
                        }
                        else
                        {
                            var data = 
                            {
                                reference: cryptoKeyReference,
                                key: cryptoKey
                            }

                            param.savedCryptoKey = cryptoKey;

                            mydigitalstructure.cloud.save(
                            {
                                object: 'core_protect_key',
                                data: data,
                                callback: mydigitalstructure._util.protect.key.create.single,
                                callbackParam: param
                            });	
                        }
                    }
                }
                else
                {	
                    var cryptoKey = mydigitalstructure._util.param.get(param, 'cryptoKey', {remove: true}).value;

                    if (cryptoKeyReference && cryptoKey)
                    {	
                        mydigitalstructure._util.protect.key.data[cryptoKeyReference] = cryptoKey;
                    }

                    return mydigitalstructure._util.whenCan.complete(savedCryptoKey, param)
                }	
            }		
        },			

        search: function(param)
        {
            var local = mydigitalstructure._util.param.get(param, 'local', {default: false}).value;
            var cryptoKeyReference = mydigitalstructure._util.param.get(param, 'cryptoKeyReference').value;
            var createKey = mydigitalstructure._util.param.get(param, 'createKey', {default: false}).value;
            var cryptoKey = mydigitalstructure._util.protect.key.data[cryptoKeyReference];

            if (cryptoKey != undefined)
            {	
                mydigitalstructure._util.whenCan.complete(cryptoKey, param);
            }
            else
            {	
                var protectCryptoKey = mydigitalstructure._util.param.get(param, 'protectCryptoKey').value;

                if (protectCryptoKey === undefined)
                {
                    if (local)
                    {
                        param = mydigitalstructure._util.param.set(param, 'key', cryptoKeyReference);
                        
                        mydigitalstructure._util.whenCan.execute(
                        {
                            now:
                            {
                                method: mydigitalstructure._util.local.cache.search,
                                param: param
                            },
                            then:
                            {
                                comment: 'util.local.cache.search<>util.protect.key.search',
                                method: mydigitalstructure._util.protect.key.search,
                                set: 'protectCryptoKey',
                                param: param
                            }
                        });
                    }	
                    else
                    {
                        mydigitalstructure.cloud.search(
                        {
                            object: 'core_protect_key',
                            fields: ['key'],
                            filters: 
                            [
                                {
                                    field: 'reference',
                                    value: 'cryptoKeyReference'
                                }
                            ],
                            sorts:
                            [
                                {
                                    field: 'modifieddate',
                                    direction: 'desc'
                                }
                            ],
                            includeMetadata: true,
                            includeMetadataGUID: true,
                            callbackParam: param,
                            callback: function (param, response)
                            {
                                param = mydigitalstructure._util.param.set(param, 'protectCryptoKey', '');

                                if (response.data.rows.length !== 0)
                                {	
                                    param.protectCryptoKey = _.first(response.data.row).key;
                                }

                                mydigitalstructure._util.protect.key.search(param)
                            }
                        });
                    }	
                }
                else
                {
                    if (createKey)
                    {	
                        mydigitalstructure._util.whenCan.execute(
                        {
                            now:
                            {
                                method: mydigitalstructure._util.protect.key.create.single,
                                param:
                                {
                                    local: local,
                                    persist: true,
                                    cryptoKeyReference: cryptoKeyReference
                                }
                            },
                            then:
                            {
                                comment: 'util.protect.key.create.single<>util.protect.key.search',
                                method: mydigitalstructure._util.protect.key.search,
                                param: param
                            }
                        });
                    }

                    if (protectCryptoKey != undefined)
                    {	
                        mydigitalstructure._util.protect.key.data[cryptoKeyReference] = protectCryptoKey;
                    }

                    return mydigitalstructure._util.whenCan.complete(protectCryptoKey, param);
                }
            }	
        }					
    },

    encrypt: function(param)
    {
        if (mydigitalstructure._util.param.get(param, 'cryptoKey').exists)
        {
            var data = mydigitalstructure._util.param.get(param, 'data', {remove: true}).value;
            var sCryptoKey = mydigitalstructure._util.param.get(param, 'cryptoKey', {remove: true}).value;
            var protectedData = CryptoJS.AES.encrypt(data, cryptoKey).toString();

            if (mydigitalstructure._util.param.get(param, 'onComplete').exists)
            {	
                param = mydigitalstructure._util.param.set(param, 'protectedData', protectedData);
                mydigitalstructure._util.onComplete(param)
            }
            else
            {
                return mydigitalstructure._util.whenCan.complete(protectedData, param);
            }	
        }
        else
        {	
            mydigitalstructure._util.whenCan.execute(
            {
                now:
                {
                    method: mydigitalstructure._util.protect.key.search,
                    param: param
                },
                then:
                {
                    comment: 'util.protect.key.search<>util.protect.encrypt',
                    method: mydigitalstructure._util.protect.encrypt,
                    set: 'cryptoKey',
                    param: param
                }	
            });
        }	
    },

    decrypt: function(param)
    {
        if (mydigitalstructure._util.param.get(param, 'cryptoKey').value)
        {
            var protectedData = mydigitalstructure._util.param.get(param, 'protectedData', {remove: true}).value;
            var cryptoKey = mydigitalstructure._util.param.get(param, 'cryptoKey', {remove: true}).value;
            var data = CryptoJS.AES.decrypt(protectedData, cryptoKey).toString(CryptoJS.enc.Utf8);

            if (mydigitalstructure._util.param.get(param, 'onComplete').exists)
            {	
                param = mydigitalstructure._util.param.set(param, 'data', data)
                mydigitalstructure._util.onComplete(param)
            }
            else
            {
                return mydigitalstructure._util.whenCan.complete(data, param);
            }	
        }
        else
        {	
            mydigitalstructure._util.whenCan.execute(
            {
                now:
                {
                    method: mydigitalstructure._util.protect.key.search,
                    param: param
                },
                then:
                {
                    comment: 'util.protect.key.search<>util.protect.decrypt',
                    method: mydigitalstructure._util.protect.decrypt,
                    set: 'cryptoKey',
                    param: param
                }	
            });
        }	
    }								
}