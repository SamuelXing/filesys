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
	
	socket.on('data', (data)=>{
		// JSON data to object
		let message = JSON.parse(data);
		switch (message.command)
		{
			case 'LOGIN':
				console.log(data);
				socket.write('got your data');
				break;
			case 'ACCESS':
				console.log(data);
				break;
			case 'DELEGATE':
				console.log(data);
				break;
			case 'SET_PERMISSION':
				console.log(data);
				break;
			case 'LOGOUT':
				console.log(data);
				break;
			default:
				break;
		}
	});
});


server.listen(8000, ()=>{
	console.log('server is listening on 8000...');
});



