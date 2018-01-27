const tls = require('tls');
const fs = require('fs');

const options = {
	key: fs.readFileSync('./keystore/server-key.pem'),
	cert: fs.readFileSync('./keystore/server-crt.pem'),
	ca: fs.readFileSync('../CA/ca-crt.pem'),
	requestCert: true,
	rejectUnauthorized: true
};

const tlsSessionStore = {};

const server= tls.createServer(options, (socket)=>{
	console.log('server connected', socket.authorized ? 'authorized' : 'unauthorized');
	socket.on('error', (error)=>{
		console.log(error);
	});
	
	socket.setEncoding('utf8');
	//socket.pipe(process.stdout);
	//socket.pipe(socket);
	
	socket.on('data', (data)=>{
		// JSON data to object
		let message = JSON.parse(data);
		switch (message.command)
		{
			case 'LOGIN':
				console.log(message.username);
				break;
			case 'ACCESS':
				break;
			case 'DELEGATE':
				break;
			case 'SET_PERMISSION':
				break;
			default:
				break;
		}
	});
});


server.listen(8000, ()=>{
	console.log('server is listening on 8000...');
});



