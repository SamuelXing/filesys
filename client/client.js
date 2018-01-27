const tls = require('tls');
const fs = require('fs');
const readline = require('readline');


const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});

// hidding password
function hidden(query, callback) {
	let stdin = process.openStdin();
  process.stdin.on("data", function(char) {
		char = char + "";
		switch (char) 
		{
			case "\n":
			case "\r":
			case "\u0004":
				stdin.pause();
				break;
			default:
				process.stdout.write("\033[2K\033[200D" + query + Array(rl.line.length+1).join("*"));
				break;
		}
	});
		
	rl.question(query, function(value) {
		rl.history = rl.history.slice(1);
		callback(value);
	});
}

// tls connection options
const options = {
	ca: fs.readFileSync('../CA/ca-crt.pem'),
	key: fs.readFileSync('./keystore/client1-key.pem'),
	cert: fs.readFileSync('./keystore/client1-crt.pem'),
	host: 'localhost',
	port: 8000,
	rejectUnauthorized: true,
	requestCert: true
};

// socket 
const socket = tls.connect(options, ()=>{
	console.log('client connected', socket.authorized ? 'authorized': 'unauthorized');
	console.log(socket.getCipher());

	//user login
	rl.question('Username: ', function(username){
		hidden('password: ', function(password){
			let message = {
				command: 'LOGIN',
				username: username,
				password: password
			};
			let data = JSON.stringify(message);
			socket.write(data);
		});
	  
		process.stdin.resume();
		
		rl.question('after: ', function(data){
			console.log(data);
		})
	});

});

socket.setEncoding('utf8');

socket.on('data', (data)=>{
				
});

socket.on('error', (error)=>{
	console.log(error);
});

socket.on('end', (data)=>{
	console.log('Socket end event');
});


