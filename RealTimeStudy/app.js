
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  ,fs = require('fs')
  ,async = require('async')
  ,mongo = require('mongodb')
  ,oracledb = require('oracledb')
  ,dbConfig = require('./dbconfig.js');


function Sockets(){
	this.sockets = {};
}

Sockets.prototype.set = function(id, data){
	this.sockets[id] = data;
}

Sockets.prototype.get = function(id, callback){
	if(this.sockets[id] != undefined){
		callback(true, this.sockets[id]);
	}else{
		callback(false, this.sockets[id]);
	}
}

var app = express();
var server = new mongo.Server('localhost',27017,{auto_reconnect : true});
var db = new mongo.Db('mydb',server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);



var server =http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

var line_history = [];
var char_history = [];


var paraIndex = 0;

var s_id ="";
io.sockets.on('connection', function(socket){
	

	
	  //글씨 데이터 초기화
	  for (var i in char_history) {
		 	
	      socket.emit('initP',char_history[i]);
	     
	  }
	   //선 데이터 초기화
	   for (var w in line_history) {
		   
	      socket.emit('draw_line', { line: line_history[w] } );
	   }
	   
	   // add handler for message type "draw_line".
	   socket.on('draw_line', function (data) {
	      // add received line to history
	      line_history.push(data.line);
	      // send line to all clients
	      io.emit('draw_line', { line: data.line });
	   });
	   
	  socket.on('clear',function(data){
		  // alert("@@");
		   line_history = [];
		   char_history = [];
		   io.emit('clear');
		   
	   });
	  
	  // 글씨 쓰기
	  socket.on('printP',function(data){
		  
		  console.log("first"+data.pra[2]);
		   if(data.pra[2]<paraIndex){
			   if(char_history.length==0){
				   char_history.push(data);
			   }
			  console.log("pra"+data.pra[2]+",index"+paraIndex);
		  char_history[data.pra[2]] = data   ;}else{
			  console.log("else"+paraIndex +"data"+data.pra[2]);
			  char_history.push(data);
		  }
		   
		   
		  // pic = data.pra[2];
			socket.broadcast.emit('toAllP',data);
		});
		
		socket.on('savePic',function(data){
			
			socket.broadcast.emit('savePic',data);
		});
		
		// paraCount
		socket.on('paraCount',function(data){
			socket.emit('paraCount',paraIndex);
			console.log("app.on"+paraIndex);
			paraIndex ++;
		});
		
		// drag
		socket.on('image',function(data){
			console.log(data);
			pic = data;
			socket.broadcast.emit('imgDraw',data);
		});
		
		//
		
		socket.on('init',function(data){
		
			var tmp=0;
			
			if(char_history.length!=0){
				
				 for (var i in char_history) {
					 	var j = i;
				      socket.emit('initP',char_history[i]);
				      if(j==char_history.length){
				    	  for (var  w in line_history) {
							  var r = w; 
						      socket.emit('draw_line', { line: line_history[w] } );
						      if(r==line_history.length){
						    	  console.log("end");
						    	  socket.emit('endMsg',"b");
				      }
				     
				}
				 // first send the history to the new client
			
	
             }
				      }
				 }
			});
		
		// 이미지 움직이기
		socket.on('moveImg',function(data){
			socket.broadcast.emit('resetAll',"a");
			var tmp =0;
			if(char_history.length!=0){
				
				 for (var i in char_history) {
					 	
				      io.sockets.emit('initP',char_history[i]);
				      if(i==char_history.length){
				    	  tmp++;
				      }
				     
				}}else{
					
					tmp++;
					
				}
				 // first send the history to the new client
			if(line_history.length!=0){
				   for (var w in line_history) {
					   
					   io.sockets.emit('draw_line', { line: line_history[w] } );
				      if(i==line_history.length){
				    	  tmp++;
				      }
				      
			}}else{
				tmp++;
			}
			
			
			
		     // socket.emit('endMsg',"b");
			
			
			
			 io.sockets.emit('moveImg',data);
			 pic = data;
			
		});
	
	var sockets = new Sockets();
	socket.on('join',function(data){
		socket.join(data);
		sockets.set('room',data);
		s_id = data;
		
		 var cursor = db.collection("study"+s_id).find();
		    db.open(function(err,db){
		    	//채팅 디비에 있는 내용 출력
		       cursor.each(function(err, items){
		             // 마지막에 null도 출력하므로 안해주기위해서
		          if (items !== null) {
		             sockets.get('room',function(error,room){
		           	  io.sockets.in(room).emit('message',items);});
		          }
		       });
		    });

	});
	
	

	
	socket.on('message',function(data){
      sockets.get('room',function(error,room){
    	  io.sockets.in(room).emit('message',data);
    	  
    	  db.open(function(err,db){
              if(!err){
                 // 위젯 컬렉션에 접근 또 는 생성
            	  console.log("db"+s_id);
                 db.collection('study'+s_id,function(err,collection){
                     //채팅 내용 삽입 
                	 collection.insert(data);
                    });
               // });
              }else{
            	  console.log("err");
              }
           });
      }	);	
	});
	
});




