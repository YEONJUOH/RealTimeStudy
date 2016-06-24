/*
 * GET home page.
 */
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('../dbconfig.js');
var http = require('http');
var cb2=null;



var doconnect = function(cb){
	   oracledb.getConnection({
	      user : dbConfig.user,
	      password : dbConfig.password,
	      connectString : dbConfig.connectString
	   }, cb);
	};

var dorelease = function(conn) {
	conn.release(function(err) {
		if (err) {
			console.error(err.message);
		}
	});
};




var dojsonqueryU = function(conn,u_id ,s_id,cb) {
	
	console.log(u_id);
	conn.execute("SELECT * from users where u_id=" +u_id, {}, {
		outFormat : oracledb.OBJECT
	}, function(err, result) {
		if (err) {
			return cb(null, conn);
		} else {
			// just show
			var js2 = JSON.stringify(result.rows[0]);
			var u_obj = JSON.parse(js2);
			
	         
			
			// first
			// record
			//console.log('json: ', js2);
			return cb(null,conn, u_obj,s_id);
		}
	});

};

//오라클에서 값 가져오기
var dojsonqueryS = function(conn,u_obj ,s_id,cb) {

	console.log("study"+s_id);
conn.execute("SELECT * from study where s_id=" + s_id, {}, {
      outFormat : oracledb.OBJECT
   }, function(err, result) {
      if (err) {
    	  return cb(null, conn,s_id,u_obj);
      } else {
         // just show
         var js2 = JSON.stringify(result.rows[0]);
         
         // first
         // record
         
         var s_obj = JSON.parse(js2);
         
        
         //return cb(null, conn);
         return cb(null, conn,s_obj,u_obj);
      }
   });
};





exports.index = function(req, res) {
	var study_obj=null;
	var user_obj =null;
 	
	async.waterfall([ doconnect,function(conn,cb){ cb(null,conn,req.param('u_id'),req.param('s_id')) },dojsonqueryU,dojsonqueryS, ], function(err, conn,s_obj,u_obj) {
		if (err) {
			console.error("In waterfall error cb: ==>", err, "<==");
		}
		if (conn,s_obj,u_obj){
			
		        var audio ="memOpen("+s_obj.S_ID+")";
				  // localStorage can be used
				study_obj = s_obj;
				user_obj = u_obj;
				if(s_obj.S_LEADER_ID==u_obj.U_ID){
					audio="leaderOpen("+s_obj.S_ID+")";
				}
				
				res.render('template',{s_obj:study_obj,u_obj:user_obj,audio_order:audio});
				
			
			//console.log("sessionCheck"+localStorage.getItem("lastname"));
			dorelease(conn)};
	});

	
};
