/**
 * Create and expor config variable.
 */

 //Container for all environs.
 var environments = {};

 //staging (default)
 environments.staging = {
    'httpport' : 3000,
    'httpsport' : 3001,
    'envName' : 'staging',
    'hashingsecret' : 'thisisasecret',
    'maxchecks' : 5,
    'twilio' : {
        'accountSid' : 'AC5724e182119b4a820d2565a17b71102b',
        'authToken' : '3f41babcc952ebf0d772a6ef3efaa54d',
        'phone' : '+919902490160'
        }
 };

 //production
 environments.production = {
    'httpport' : 5001,
    'httpsport' : 5002,
    'envName' : 'production',
    'hashingsecret' : 'thisisaprodsecret',
    'maxchecks' : 5,
    'twilio' : {
        'accountSid' : 'AC5724e182119b4a820d2565a17b71102b',
        'authToken' : '3f41babcc952ebf0d772a6ef3efaa54d',
        'phone' : '+919902490160'
        }
 };

 //determine which was exported
 var currentEnvironment = typeof(process.env.NODE_ENV)=='string' ? process.env.NODE_ENV.toLowerCase() : '';


 //current env is set to one of the env set.
 var envToExport = typeof (environments[currentEnvironment])== 'object' ? environments[currentEnvironment] : environments.staging;
 
//

 //export the module
 module.exports = envToExport;