//helper for various tasks
//Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');


//container
var helpers = {};

//create a hashing function
helpers.hash = function(str){
    if(typeof(str)=='string' && str.length>0){
        var hash = crypto.createHmac('sha256', config.hashingsecret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
};

//create a string of random alpha numeric characters, of a given length
helpers.createrandonstring = function(strlength){
    strlength = typeof(strlength) == 'number' && strlength > 0 ? strlength : false;
    if(strlength){
        //define all the chars and num
        var possiblechars = 'abcdefghijklmnopqrstuvwxyz1234567890';

        //start a new string
        var str = '';
        for(i=1; i<=strlength; i++){
            //get a random char from possible char string and then append the character to the final string
            var randomchar = possiblechars.charAt(
                Math.floor(Math.random()*possiblechars.length)
            );
            str += randomchar;
        }
        return str;
    }else{
        return false;
    }
};

helpers.parseJsonToObject=function(data){
    try {
        var obj = JSON.parse(data);
        return obj;
    } catch (error) {
        return {};
    }
};

//send SMS
helpers.sendTwilioSMS = function(phone, msg, callback){
    phone = typeof(phone) == 'string' && phone.trim().length ==10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length>0 && msg.trim().length < 1600 ? msg.trim() : false;
    if(phone && msg){
        //configure the message payload
        var payload = {
            'Form' : config.twilio.phone,
            'To' : '+91'+phone,
            'Body' : msg
        };
        console.log(payload);
        //configure the request details
        var stringpayload = querystring.stringify(payload);

        var requestdetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Mesages.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringpayload)
            }
        };
        console.log(requestdetails);
        //instantiate request
        var req = https.request(requestdetails, function(response){
            var status = response.statusCode;
            if(status == 200 || status == 201){
                callback(false);
            }else{
                callback('status code returned was '+ status);
            }
        });

        //bind to error so that it is not thrown
        req.on('error', function(e){
            callback(e);
        });

        
        console.log(stringpayload);
        req.write(stringpayload);
        req.end();

    }else{
        callback('Given parameters are missing or invalid');
    }
};

//Export
module.exports = helpers;