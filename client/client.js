const tls = require('tls');
const fs = require('fs');
const readlineSync = require('readline-sync');

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

	// login
	let username = readlineSync.question('Username: ');
	let password = readlineSync.question('Password: ', {
  	hideEchoBack: true // The typed text on screen is hidden by `*` (default). 
	});
  let message = {
        	command: 'LOGIN',
          username: username,
          password: password
  };
  let data = JSON.stringify(message);
  socket.write(data);

	console.log('\nPlease enter a command:\na, Access File\nb, Set Permission\nc, Delegate Access\nd, Logout\n\n');
	// command prompt
  const stdin = process.openStdin();
	console.log('=====================');

  stdin.addListener("data", function(command) {
    		command = command.toString().trim();
        switch(command){
            case 'a':
                message = {};
                message.command = 'ACCESS';
                message.from = username;
                message.access = 'f1.txt';
                data = JSON.stringify(message);
								console.log('=====================');
                socket.write(data);
                break;
            case 'b':
                message = {};
                message.command = 'SET_PERMISSION';
                message.from = username;
                message.access = 'f1.txt';
                data = JSON.stringify(message);
								console.log('=====================');
                console.log('command > ');
                socket.write(data);
                break;
            case 'c':
                message = {};
                message.command = 'DELEGATE';
                message.from = username;
								message.access = 'f1.txt';
                message.grant = 'userB';
                data = JSON.stringify(message);
								console.log('=====================');
                console.log('command > ');
                socket.write(data);
                break;
            case 'd':
                message = {}
                message.command = 'LOGOUT';
                message.who = username;
                data = JSON.stringify(message);
								console.log('=====================');
                console.log('command > ');
                socket.write(data);
                break;
            default:
                console.log("Invalid input, please retry.");
								console.log('=====================');
                break;
        }
	});
});

socket.setEncoding('utf8');

socket.on('data', (data)=>{
	let reply = JSON.parse(data);
	switch (reply.type)
	{
		case 'LOGIN_REPLY':
		case 'SET_PERMISSION_REPLY':
			console.log(reply.content);
			break;
		case 'ACCESS_REPLY':
			if(reply.fileContent == null)
			{
				console.log(reply.content);
				break;
			}
			else
			{
				console.log(reply.content);
				console.log(reply.fileContent);
				break;
			}
			break;
		default:
			console.log('got some dummy messages');
			break;
	}
});

socket.on('error', (error)=>{
	console.log(error);
});

socket.on('end', (data)=>{
	console.log('Socket end event');
});


