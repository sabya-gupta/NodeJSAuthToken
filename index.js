/*
* Primary file for API
*
*/
//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecode = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

helpers.sendTwilioSMS('9972182517', 'Hello!', function(err){
    console.log('this is the error', err);
});

//var _data = require('./lib/data');

//@TODO delete this
// _data.delete('test', 'newFile', function(err){
//     console.log('This was the error ', err);    
// });
// _data.create('test', 'newFile',{'dhur' : 'chai'}, function(err){
//     console.log('This was the error ', err);    
// });

//instantiate http server
var httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);
});

//instantiate https server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res);
});


//Start the server.
httpServer.listen(config.httpport, function(){
    console.log("The server is listening on port ", config.httpport);
});

//Start the server.
httpsServer.listen(config.httpsport, function(){
    console.log("The server is listening on port ", config.httpsport);
});



//All the server logic.
//Unified server
var unifiedServer = function(req, res){

    //parse url
    var parsedUrl = url.parse(req.url, true);

    //get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as object
    var queryStringobject = parsedUrl.query;
    
    //get the http method
    var method = req.method.toLocaleLowerCase();

    //Get the Headers as an object
    var headers = req.headers;

    //get the payloads if present
    var decoder = new StringDecode('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();


      //Choose the handler or choose not found
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
        router[trimmedPath] : handlers.notfound;
        
      //Construct data object
      var data ={
        'trimmedpath' : trimmedPath,
        'querystringobject': queryStringobject,
        'method' : method,
        'header' : headers,
        'payload' : helpers.parseJsonToObject(buffer)
      };

      //Route the data to the chosen handler
      chosenHandler(data, function(statuscode, payload){
        //use the status code called back by the handler or use 200
        statuscode = typeof(statuscode) == 'number'? statuscode : 200;


        //use the payload called back by the handler or default it to an emplty object
        payload = typeof(payload) == 'object' ? payload : {};

        //Convert the payload to String
        var payloadString = JSON.stringify(payload);

        //send the response
        res.setHeader('Content-Type', 'application/json');
        console.log(headers.token, (!headers.token));
        if(headers.token){
           //res.setHeader('token', headers.token.value);
        }
        res.writeHead(statuscode);

        res.end(payloadString);
        console.log('Returning this response ', statuscode ,payloadString);
    });

      //Log the request path
        
    });
};


//We are defining a request router
var router = {
    'sample' : handlers.sample,
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};