/**
 * http://usejsdoc.org/
 */

/*$(function(){
	
	$('#exit_img').click(function(){
	    alert("헬로~~"); });)*/


$(function () {
	
	var socket = io.connect(); 
	var name = $('#u_name').val();
	var s_id = $('#s_id').val();
	var u_id = $('#u_id').val();
	
	socket.emit('join',s_id);
	
	$('button').click(function(){
		//var u_name = getUser().U_NAME;
		socket.emit('message',{
			name:'#{u_obj.U_NAME}',
			message:$('#chat_input').val(),
			date:new Date().toUTCString(),
			u_id:u_id
			
		});
	});
	
	
	
	
	socket.on('message',function(data){
		
      var align="";
      var data_msg = "chat_span";
      if(data.u_id == u_id){
    	  align="style=text-align:right;";
    	  data_msg="chat_span_self";
      }
      
      
		
		var output ="";
	    output+= '<div class="chat_block">';
	    output+='<p class="u_nick" '+align+'>' + data.name +'</p>';
	    output+='<p '+align+'><span class='+data_msg+'>'+ data.message+'</span></p>';
	  
	    output+='<p class="date_p" '+align+'>'+ data.date +'</p>';
	    output+= '</div>';
	   
	    $('#chat_con').append(output);
	      var pos = $('.chat_block:last').offset();
		  var height = $('.chat_block:last').height();
		  $('#chat_con').scrollTop($('#chat_con').scrollTop()+pos.top);
	});
	
	$('#chat_input').keydown(function() {
		  if(event.keyCode == 13)
		     {
			  var date = new Date();
			  var date_Str = date.getHours()+"시 "+date.getMinutes()+"분";
			  socket.emit('message',{
					name:name,
					message:$('#chat_input').val(),
					date:date_Str,
					u_id:u_id
					
				});
			  
			   $('#chat_input').val('');
	
		     }
	});
	
	$('#chat_div').hide();
 	$('#exit_img').click(function(){
 	
 		$('#chat_div').hide();
 	
 	})
 	

 	$('#chat_btn').click(function(){
 		$('#chat_div').show();
 	});

})

