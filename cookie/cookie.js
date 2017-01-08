/*
* @Author: Wang Xiao
* @Date:   2016-01-27 13:56:09
* @Last Modified by:   Wang Xiao
* @Last Modified time: 2016-01-27 17:16:22
*
* http://mrcoles.com/blog/cookies-max-age-vs-expires/
*/

;(function(window, document, undefined){

    function encode(val){
        return encodeURIComponent(val);
    };

    function decode(val){
        return decodeURIComponent(val);
    };

    function type(obj){
        return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
    };

    function isJson(str){
        try{
            var str = JSON.parse(str);
            if(type(str) === 'object'){
                return true;
            }
        } catch (e){
            return false
        }

        return false;
    };

    function getKeys(obj){
        var keys = [];

        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }

        return keys;
    };

    var cookie = {
        set: function(key, value, options){

            if(type(key) === 'object'){
                for(var arg in key){
                    if(key.hasOwnProperty(arg)){
                        this.set(arg, key[arg], value);
                    }
                }
            } else {
                // value to json
                if(type(value) === 'object'){
                    try{
                        value = JSON.stringify(object);
                    } catch(e){
                        console.log('value should be string');
                    }
                }

                var cookieText = encode(key) + '=' + encode(value);

                // IE8 不支持 max-age
                if(options.expires){
                    var expires, maxAge;
                    switch(type(options.expires)){
                        case 'number':
                            expires = new Date();
                            expires.setTime(expires.getTime() + options.expires * 1000);

                            maxAge = options.expires;

                            break;
                        case 'string':
                            expires = new Date(string);
                            maxAge = (sExpires - new Date()) / 1000;
                            break;
                        case 'date':
                            expires = options.expires;
                            maxAge = (options.expires - new Date()) / 1000;
                    }

                    cookieText += '; expires=' + expires.toUTCString() + '; max-age=' + maxAge;
                }

                if(options.path){
                    cookieText += '; path=' + options.path;
                }

                if(options.domain){
                    cookieText += '; domain=' + options.domain;
                }

                if(options.secure){
                    cookieText += '; secure';
                }

                document.cookie = cookieText;
            }


            return this;
        },

        get: function(key){
            var cookies = this.all();
            if(type(key) === 'array'){

                var result = {},
                    len = key.length;

                for(var i=0; i<len; i++){
                    result[key[i]] = cookies[key[i]];
                }

                return result;

            } else {

                return cookies[key];
            }
        },

        all: function(){
            if(document.cookie === '') return null;

            var cookies = document.cookie.split('; '),
                len = cookies.length,
                result = {};

            for(var i=0; i<len; i++){
                var cookie = cookies[i].split('='),
                    key = decode(cookie.shift()),
                    value = cookie.join('=');

                result[key] = isJson(value) ? JSON.parse(value) : value;
            };

            return result;
        },

        remove: function(key){
            if(type(key) === 'array'){
                var len = key.length;

                for(var i=0; i<len; i++){
                    this.remove(key[i]);
                }
            } else {
                this.set(key, '', {
                    maxAge: 0;
                })
            }

            return this;
        },

        empty: function(){
            var cookies = this.all();

            this.remove(getKeys(cookies));
        },

        has: function(key){
            var name = encode(name) + '=';

            return document.cookie.indexOf(name) > -1;
        },

        enabled: function(){
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/cookieEnabled
            if(navigator.cookieEnabled) return true;

            var result = this.set('__test__', 'test').get('__test__') === 'test';

            this.remove('__test__');

            return result;
        }
    };

    // If an AMD loader is present use AMD.
    // If a CommonJS loader is present use CommonJS.
    // Otherwise assign the `cookie` object to the global scope.

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return cookie;
        });
    } else if (typeof exports !== 'undefined') {
        exports.cookie = cookie;
    } else {
        window.cookie = cookie;
    }

})(window, document)
