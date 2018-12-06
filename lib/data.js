/**
 * used for storing and editing data
 */

 var fs = require('fs');
 var paths = require('path');
 var helpers = require('./helpers');

 //container to be exported
 var lib = {};

//Define the base directory
lib.basedir=paths.join(__dirname, '/../.data/');


//create a file
lib.create = function(dir, filename, data, callback){
    //try to open file for writing
    fs.open(lib.basedir + dir +'\\'+filename+'.json', 'wx', function(err, fileDescriptor){
        console.log(lib.basedir + dir +'\\'+filename+'.json');
        if(!err && fileDescriptor){

            //convet data to string
            var stringdata = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor, stringdata, function(err){
                if(!err){
                    //close
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error closing new file');
                        }
                    })
                }else{
                    callback('Error writing to new file');
                }
            });

        }else{
            callback('could not create file as file may be already existing!')
        }
    });

};


//read a file
lib.read = function(dir, filename, callback){
    fs.readFile(lib.basedir + dir +'\\'+filename+'.json', 'utf-8', function(err, data){
        if(!err && data){
            var parseddata = helpers.parseJsonToObject(data);
            callback(false, parseddata);
        }else{
            callback(err, data);
        }
    });
};


//update a file with new data
lib.update = function(dir, filename, data, callback){
    fs.open(lib.basedir + dir +'\\'+filename+'.json', 'r+', function(err, fileDesc){
        if(!err){
            var stringdata = JSON.stringify(data);

            //Truncate the file
            fs.truncate(fileDesc, function(err){
                if(!err){
                    //write to the file and close it
                    fs.writeFile(fileDesc, stringdata, function(err){
                        if(!err){
                            fs.close(fileDesc, function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing file');
                                }
                            });
                        }else{
                            callback('Error in writing to file');
                        }
                    });
                }else{
                    callback('error truncating file');
                }
            });
        }else{
            callback('could not open file');
        }
    });
};


//Delete a file
lib.delete = function(dir, filename, callback){
    fs.unlink(lib.basedir + dir +'\\'+filename+'.json', function(err){
        if(err){
            callback('Error in deleting file');
        }else{
            callback(false);
        }
    });
};


 //export 
 module.exports=lib;