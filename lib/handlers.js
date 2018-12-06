//These are the request handlers
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config')

//Define handlers
var handlers = {};

//define sample handler
handlers.sample=function(data, callback){
    //callback a http status and payload object
    callback(406, {'name' : 'sample'});
};

handlers.users=function(data, callback){
    var acceptablemethods = ['get','post', 'put', 'delete'];
    if(acceptablemethods.indexOf(data.method)>-1){
        handlers._users[data.method](data, callback);
    }else{
        callback(405);
    }
};

//container for user submethods
handlers._users = {};

//create all the methods

//users post
//required data : firstname, lastname, phone, password, tosAgreement
//optional data : none
handlers._users.post = function(data, callback){
    //check all requiredfield are filled up
    var firstName =     
                    typeof(data.payload.firstName) == 'string' 
                    &&
                    data.payload.firstName.trim().length > 0
                    ?
                    data.payload.firstName.trim()
                    :
                    false;

    var lastName =     
                    typeof(data.payload.lastName) == 'string' 
                    &&
                    data.payload.lastName.trim().length > 0
                    ?
                    data.payload.lastName.trim()
                    :
                    false;
                    
    var phoneNo =     
                    typeof(data.payload.phoneNo) == 'string' 
                    &&
                    data.payload.phoneNo.trim().length == 10
                    ?
                    data.payload.phoneNo.trim()
                    :
                    false;

    var password =     
                    typeof(data.payload.password) == 'string' 
                    &&
                    data.payload.password.trim().length > 0
                    ?
                    data.payload.password.trim()
                    :
                    false;

    var tosAgreement =     
                    typeof(data.payload.tosAgreement) == 'boolean' 
                    &&
                    data.payload.tosAgreement == true
                    ?
                    true
                    :
                    false;

    console.log(firstName , lastName , phoneNo , password , tosAgreement);
    if(firstName && lastName && phoneNo && password && tosAgreement){
        //make sure user does  not exist
        _data.read('users', phoneNo, function(err, data){
            if(err){
                //hash the password
                var hashedpassword = helpers.hash(password);

                if(hashedpassword){
                    
                //create the user object
                    var userobject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phoneNo' : phoneNo,
                        'password' : hashedpassword,
                        'tosAgreement' : true
                    }
                    //persist the user
                    _data.create('users', phoneNo, userobject, function(err){
                        if(err){
                            console.log(err);
                            callback(500, {'Error' : 'Could not create user'});
                        }else{
                            callback(200);
                        }
                    });
                }else{
                    callback(400, {'Error' : 'Could not create users\'s password'});
                }


            }else{
                callback(400, {'Error' : 'User already exists'});
            }
        });
    }else{
        callback(400, {'Error' : 'Missing required Fields'});
    }
};

//users get
handlers._users.get = function(data, callback){

    //require data : phone
    //@TODO : only let authenticated users access their data
    var phoneno = typeof(data.querystringobject.phone) == 'string' &&  data.querystringobject.phone.trim().length==10
        ? data.querystringobject.phone.trim() : false;
    if(phoneno){
        //get the token from header

        var token = typeof(data.header.token)=='string' ? data.header.token : false;
        console.log(token);

        if(token){
            handlers._tokens.verifyToken(token, phoneno, function(isTokenValid){
                if(isTokenValid){
                    console.log(phoneno);
                    _data.read('users', phoneno, function(err, readdata){
                        console.log('2', readdata);
                        if(!err && readdata){
                            //remove the hashed password 
                            delete readdata.password;
                            console.log('2', readdata);
                            callback(200, readdata);
                        }else{
                            callback(404);
                        }
                    });
                }else{
                    callback(403 , {'Error' : 'User not valid 1'});
                }
            });

        }else{
            callback(403, {'Error 2' : 'User not valid '});
        }

    }else{
        callback(400, {'Error 3' : 'missing valid phone number'});
    }

};

//users put
//required pone number
//one of firstname, lastname or password is atleast required
//@TODO - authnticate user and update its object only
handlers._users.put = function(data, callback){
    //check for optional fields
    var firstName =     
                    typeof(data.payload.firstName) == 'string' 
                    &&
                    data.payload.firstName.trim().length > 0
                    ?
                    data.payload.firstName.trim()
                    :
                    false;

    var lastName =     
                    typeof(data.payload.lastName) == 'string' 
                    &&
                    data.payload.lastName.trim().length > 0
                    ?
                    data.payload.lastName.trim()
                    :
                    false;
                    
    var phoneNo =     
                    typeof(data.payload.phoneNo) == 'string' 
                    &&
                    data.payload.phoneNo.trim().length == 10
                    ?
                    data.payload.phoneNo.trim()
                    :
                    false;
    
    var password =     
                    typeof(data.payload.password) == 'string' 
                    &&
                    data.payload.password.trim().length > 0
                    ?
                    data.payload.password.trim()
                    :
                    false;

    if(phoneNo){
        if(firstName || lastName || password){
            
            var token = typeof(data.header.token)=='string'?data.header.token : false;

            if(token){
                handlers._tokens.verifyToken(token, phoneno, function(isTokenValid){
                    if(isTokenValid){
                        _data.read('users', phoneNo, function(err, userdata){
                            if(!err && userdata){
                                if(firstName){
                                    userdata.firstName = firstName;
                                }
                                if(lastName){
                                    userdata.lastName = lastName;
                                }
                                if(password){
                                    userdata.password = helpers.hash(password);
                                }
                                //store the new object
                                _data.update('users', phoneNo, userdata, function(err){
                                    if(!err){
                                        callback(200);
                                    }else{
                                        console.log(err);
                                        callback(500, {'Error' : 'Error updating user'});
                                    }
                                });
                            }else{
                                callback(404, {'Error' : 'user does not exist'});
                            }
                        });            
                    }else{
                        callback(403, {'Error' : 'Token is invalid'});
                    }

                });
            }else{
                callback(403, {'Error' : 'Token is invalid'});
            }
            //read the data
        }else{
            callback(400, {'Error' : 'Either name, lastname or passord has to be present'});
        }
    }else{
        callback(400, {'Error' : 'Required Phone Number is missing'});
    }

};

//users delete
//Required field is phone
//@Only auth user delete their phone.
handlers._users.delete = function(data, callback){
    var phoneno = typeof(data.querystringobject.phone) == 'string' &&  data.querystringobject.phone.trim().length==10
        ? data.querystringobject.phone.trim() : false;
    if(phoneno){
            var token = typeof(data.header.token)=='string'?data.header.token : false;
            if(token){
                handlers._tokens.verifyToken(token, phoneno, function(isTokenValid){
                    if(isTokenValid){
                        console.log(phoneno);
                        _data.delete('users', phoneno, function(err){
                            if(!err){
                                callback(200);
                            }else{
                                callback(500, {'Error' : 'Internal Error'});
                            }
                        });                
                    }else{
                        callback(403, {'Error' : 'Token Not valid'});
                    }
                });
            }else{
                callback(403, {'Error' : 'Missing token'});
            }

    }else{
        callback(400, {'Error' : 'missing valid phone number'});
    }
};

//tokens
handlers.tokens=function(data, callback){
    var acceptablemethods = ['get','post', 'put', 'delete'];
    if(acceptablemethods.indexOf(data.method)>-1){
        handlers._tokens[data.method](data, callback);
    }else{
        callback(405);
    }
};

//container for all token methoda
handlers._tokens = {};

//post
//required data phone and password
//optinal data none
handlers._tokens.post = function(data, callback){
    var phoneNo = typeof(data.payload.phoneNo) == 'string' && data.payload.phoneNo.trim().length == 10?
    data.payload.phoneNo.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0?
    data.payload.password.trim() : false;
    console.log(phoneNo, password);
    if(phoneNo && password){
        _data.read('users', phoneNo, function(err, userdata){
            if(!err){
                //hash sent password and compare it with stored password
                var hashedsentpassword = helpers.hash(password);
                if(hashedsentpassword == userdata.password){
                    //if valid create a new token with random name and set expression date with i hour in future
                    var tokenId = helpers.createrandonstring(20);
                    if(!tokenId){
                        callback(500, {'Error' : 'Error creating new token'});
                    }
                    var expires = Date.now() + 1000*60*60;
                    var tokenObject = {
                        'phone' : phoneNo,
                        'id' : tokenId,
                        'expires' : expires
                    }

                    //store the token
                    _data.create('tokens', tokenId, tokenObject, function(err){
                        if(!err){
                            callback(200, tokenObject);
                        }else{
                            callback(500, {'Error' : 'Could not create new token file'});
                        }
                    });
                }else{
                    callback(400, {'Error' : 'Wrong phone or password'});
                }
            }else{
                callback(400, {'Error' : 'User not found!'});
            }
        });


    }else{
        callback(400, {'Error' : 'Missisng required fields'})
    }

};

//get
//Require data: id
//optional data is none
handlers._tokens.get = function(data, callback){
    var tokenid = typeof(data.querystringobject.tokenid) == 'string' &&  
        data.querystringobject.tokenid.length == 20
        ? data.querystringobject.tokenid.trim() : false;
    if(tokenid){
        _data.read('tokens', tokenid, function(err, readdata){
            if(!err && readdata){
                callback(200, readdata);
            }else{
                callback(404);
            }
        });
    }else{
        callback(400, {'Error' : 'missing valid tokenid'});
    }
};

//put
//mandatory tokenid and extend
handlers._tokens.put = function(data, callback){
    var tokenid = typeof(data.payload.tokenid) == 'string' && data.payload.tokenid.trim().length == 20?
    data.payload.tokenid.trim() : false;

    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true:false;
    console.log(tokenid,  typeof(data.payload.extend));
    if(tokenid && extend==true){
        _data.read('tokens', tokenid, function(err, readdata){
            if(!err && readdata){
                //check if has not already expired
                if(readdata.expires > Date.now()){
                    readdata.expires = Date.now()+1000*60*60;
                    _data.update('tokens', tokenid,readdata, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(500, {'Error' : 'Could not update token'});
                        }
                    });
                }else{
                    callback(400, {'Error' : 'Token has already expired'});
                }
            }else{
                callback(400, {'Error' : 'Token missing!'})
            }
        });
    }else{
        callback(400, {'Error' : 'Required Parameters missing' })
    }


};

//delete
//required data is tokenid 
//optional data is none.
handlers._tokens.delete = function(data, callback){
    console.log(data.querystringobject.tokenid);
    var tokenid = typeof(data.querystringobject.tokenid) == 'string' &&  data.querystringobject.tokenid.trim().length==20
        ? data.querystringobject.tokenid.trim() : false;
    if(tokenid){
        console.log(tokenid);
        _data.delete('tokens', tokenid, function(err){
            if(!err){
                callback(200);
            }else{
                callback(500, {'Error' : 'Internal Error'});
            }
        });
    }else{
        callback(400, {'Error' : 'missing valid tokenid'});
    }

};


//verify if a current token is valid for a user or not
handlers._tokens.verifyToken = function (tokenid, phoneno, callback){
    _data.read('tokens', tokenid, function(err, readData){
        if(!err && readData){
            console.log(readData.phone, phoneno, readData.expires, Date.now() );
            if(readData.phone == phoneno && readData.expires > Date.now()){
                console.log(2);
                callback(true);
            }else{
                console.log(3);
                callback(false);
            }
        }else{
            console.log(4);
            callback(false);
        }
    })
};


//checks
handlers.checks = function(data, callback){
    var acceptablemethods = ['get','post', 'put', 'delete'];
    if(acceptablemethods.indexOf(data.method)>-1){
        handlers._checks[data.method](data, callback);
    }else{
        callback(405);
    }
};


handlers._checks={};

//get
handlers._checks.get = function(data, callback){

};

//put
handlers._checks.put = function(data, callback){
    
};

//delete
handlers._checks.delete = function(data, callback){
    
};

//post  
//required data: protocol, url, method, successcode, timeoutsecs
handlers._checks.post = function(data, callback){
    var protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol)>-1? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length>0? data.payload.url : false;
    var method = typeof(data.payload.method) == 'string' && ['post', 'put', 'get', 'delete'].indexOf(data.payload.method)>-1? data.payload.metod : false;
    var successcodes = typeof(data.payload.successcodes) == 'object' && data.payload.successcodes instanceof Array && data.payload.successcodes.length>0? data.payload.metod : false;
    var timeoutseconds = typeof(data.payload.timeoutseconds) == 'number' && data.payload.timeoutseconds %1 === 0 && data.payload.timeoutseconds >= 1 && data.payload.timeoutseconds <=5? data.payload.timeoutseconds : false;

    if(url, protocol, method, successcodes, timeoutseconds){
        //validate token
        var token = typeof(data.header.token)=='string'?data.header.token:false;
        if(token){
            _data.read('tokens', token, function(err, tokendata){
                if(!err && tokendata){
                    var userphone = tokendata.phone;
                    //look up userdata
                    _data.read('users', userphone, function(err, userdata){
                        if(!err && userdata){
                            var userChecks = typeof(userdata.checks) == 'object' && userdata.checks instanceof Array? userdata.checks : [];
                            //make sure user has less than max checks.
                            console.log('>>>>', userChecks.length,  config.maxchecks);
                            if(userChecks.length < config.maxchecks){
                                var checkid = helpers.createrandonstring(20);
                                var checkobject = {
                                    'id' : checkid,
                                    'protocol' : protocol,
                                    'url' : url,
                                    'method' : method,
                                    'successCodes' : successcodes,
                                    'timeoutseconds' : timeoutseconds,
                                    'phone' : userphone
                                };

                                _data.create('checks', checkid, checkobject, function(err){
                                    if(!err){
                                        userdata.checks = userChecks;
                                        userdata.checks.push(checkid);

                                        //sav updated user data
                                        _data.update('users', userphone, userdata, function(err){
                                            if(err){
                                                callback(500, {'Error' : 'Could bot update user data'});
                                            }else{
                                                callback(200, checkobject);
                                            }
                                        });
                                    }else{
                                        callback(500, {'Error' : 'Internal error to save file'});
                                    }
                                });
                            }else{
                                callback(400, {'Error' : 'No. of checks exceeds'});
                            }
                        }else{
                            callback(403);
                        }
                    });
                }else{
                    callback(403);
                }
            });
        }else{
            callback(400, {'Error' : 'Missing Required token'});
        }
    }else{
        callback(400, {'Error' : 'Missing Required Inputs or invalid'});
    }
};


handlers._checks.get = function(data, callback){

    //require data : phone
    //@TODO : only let authenticated users access their data
    var id = typeof(data.querystringobject.id) == 'string' &&  data.querystringobject.id.trim().length==20
        ? data.querystringobject.id.trim() : false;
    if(id){

        //read the checks
        _data.read('checks', id, function(err, checkdata){
            if(!err && checkdata){
                var token = typeof(data.header.token)=='string' ? data.header.token : false;
                handlers._tokens.verifyToken(token, checkdata.phone, function(isTokenValid){
                    if(isTokenValid){
                        callback(200, checkdata);
                    }else{
                        callback(403);
                    }
                });
                        
            }else{
                callback(400, {'Error' : 'Error - No checks found with this id'});
            }
        });

        //get the token from header

    }else{
        callback(400, {'Error 3' : 'missing required field'});
    }

};



handlers._checks.put = function(data, callback){
    
    var id =     
                    typeof(data.payload.id) == 'string' 
                    &&
                    data.payload.id.trim().length === 20
                    ?
                    data.payload.id.trim()
                    :
                    false;


    var protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol)>-1? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length>0? data.payload.url : false;
    var method = typeof(data.payload.method) == 'string' && ['post', 'put', 'get', 'delete'].indexOf(data.payload.method)>-1? data.payload.metod : false;
    var successcodes = typeof(data.payload.successcodes) == 'object' && data.payload.successcodes instanceof Array && data.payload.successcodes.length>0? data.payload.metod : false;
    var timeoutseconds = typeof(data.payload.timeoutseconds) == 'number' && data.payload.timeoutseconds %1 === 0 && data.payload.timeoutseconds >= 1 && data.payload.timeoutseconds <=5? data.payload.timeoutseconds : false;



    if(id){
        if(protocol || url || method || successcodes || timeoutseconds){
            _data.read('checks', id, function(err, checkdata){
                if(err){
                    callback(400, {'Error' : 'data missing'});
                }else{
                    var token = typeof(data.header.token)=='string' ? data.header.token : false;
                    handlers._tokens.verifyToken(token, checkdata.phone, function(isTokenValid){
                        if(isTokenValid){
                            //update the check where necessary
                            if(protocol){
                                checkdata.protocol = protocol;
                            }
                            if(url){
                                checkdata.url = url;
                            }
                            if(method){
                                checkdata.method = method;
                            }
                            if(successcodes){
                                checkdata.successcodes = successcodes;
                            }
                            if(timeoutseconds){
                                checkdata.timeoutseconds = timeoutseconds;
                            }

                            console.log('>>>>>><<<<<<', id);
                            _data.update('checks', id, checkdata,function(err){
                                if(!err){
                                    callback(200);
                                }else{
                                    callback(500, {'Error' : 'Could nor update check'});
                                }
                            });
                            callback(200, checkdata);
                        }else{
                            callback(403, {'Error' : 'Token not valid!'});
                        }
                    });    
                }
            });
        }else{
            callback(400, {'Error' : 'missing field to update'});
        }
    }else{
        callback(400, {'Error' : 'missing required Field'});
    }

};




handlers.ping=function(data, callback){
    //callback a http status and payload object
    callback(200);
};


//define the fallback handler
handlers.notfound=function(data, callback){
    //callback a http status and no payload object
    callback(404);
}; 

module.exports=handlers;