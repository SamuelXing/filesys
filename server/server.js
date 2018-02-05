// TODO: server close
// TODO: bug fix,
const tls = require('tls');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const web3 = require('web3');
const contract = require('truffle-contract');
const moment = require('moment')

const options = {
	key: fs.readFileSync('./keystore/server-key.pem'),
	cert: fs.readFileSync('./keystore/server-crt.pem'),
	ca: fs.readFileSync('../CA/ca-crt.pem'),
	requestCert: true,
	rejectUnauthorized: true
};

// load DB data
let dbStore = JSON.parse(fs.readFileSync('./db.dat','utf8'));

// BCK interaction
const provider = new web3.providers.HttpProvider("http://localhost:8545");
const newweb3 = new web3(provider);

const account_address = "0x98fbac836305a4cfad176f9bde7cda332ba16bd2";
const contract_address = "0xcbb9f41c256187f03afc33ac513665e5d650075a";

const sc = new contract(require("./build/contracts/LogContract.json"));

sc.setProvider(provider);

// prepare message
function genMsg(from, type, content)
{
	let reply = {};
	reply.from = from;
	reply.type = type;
	reply.content = content;
	let strReply = JSON.stringify(reply);
	return strReply;
}

function genMsgObj(from, type, content)
{
	let reply = {};
	reply.from = from;
	reply.type = type;
	reply.content = content;
	return reply;
}

// bck interaction related functions
function getContract()
{
	return sc.at(contract_address);
}

async function log2bck(username, content)
{
	try
	{
		let now = moment();
		let formatted = now.format('YY-MM-DD HH:mm:ss');
		let newstr = formatted.split(' ')
		let date = newstr[0];
		let timestamp = newstr[1];
		let instance = await getContract();
		date = newweb3.fromAscii(''+date);
		timestamp = newweb3.fromAscii(''+timestamp);
		username = newweb3.fromAscii(''+username);
		content = newweb3.fromAscii(''+content);
		console.log(formatted+' '+username+' '+content);
		let ret = await instance.addARecord(timestamp, username, content, {from: account_address});
		return ret;
	}
	catch(err)
	{
		console.log(err);
	}
}

// server's main logic
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
				if(!server.tlsSessions) server.tlsSessions = {};
				if(server.tlsSessions[message.username])
				{
					let strReply = genMsg('server', 'LOGIN_REPLY', 'you\'ve already signed in');
					socket.write(strReply);
					break;
				} 
				if(!dbStore[message.username])
				{
					let strReply = genMsg('server', 'LOGIN_REPLY', 'your account does not exist');
					socket.write(strReply);
					break;
				}				
				hash = CryptoJS.SHA256(message.password).toString(CryptoJS.enc.Hex);
				if(hash == dbStore[message.username]){
					server.tlsSessions[message.username] = true;
					let strReply = genMsg('server', 'LOGIN_REPLY', 'successfully signed in');
					// log to bck
					log2bck(message.username, message.command);
					socket.write(strReply);
				}
				else
				{
					let strReply = genMsg('server', 'LOGIN_REPLY', 'wrong password');
					socket.write(strReply);
				}
				break;
			case 'ACCESS':
				// check if valid user
				if(!server.tlsSessions[message.from])
				{
					let strReply = genMsg('server', 'ACCESS_REPLY', 'please sign in first');
					socket.write(strReply);
					break;
				}
				// check if file exist and its permission
				if(dbStore['permission'][message.access] == null)
				{
					let strReply = genMsg('server', 'ACCESS_REPLY', 'file does not exist');
					socket.write(strReply);
					break;
				}
				if(dbStore['permission'][message.access].indexOf(message.from) != -1)
				{
					// read file and send to client
					let msg = genMsgObj('server', 'ACCESS_REPLY', 'contents of '+message.access);
					msg.fileContent = fs.readFileSync('fsstore/'+message.access, 'utf8');
					let msgStr = JSON.stringify(msg);
					log2bck(message.from, message.command);
					socket.write(msgStr);
				}
				else{
					// has no permission to access
					let strReply = genMsg('server', 'ACCESS_REPLY', 'sorry, you\'ve no permission to access');
					socket.write(strReply);
				}
				break;
			case 'DELEGATE':
			{
				let reply = genMsgObj('server', 'SET_PERMISSION_REPLY', '');
				// check if the sender has the permission to delegate
				if(dbStore['permission'][message.access].indexOf(message.from)!=-1)
				{
					dbStore['permission'][message.access].push(message.grant);
					reply.content = 'permission has been granted to '+message.grant;
					strReply = JSON.stringify(reply);
					log2bck(message.username, message.command);
					socket.write(strReply);
				}
				else
				{
					reply.content = 'fail to grant permession';
					strReply = JSON.stringify(reply);
					socket.write(strReply);
				}
				break;
			}
			case 'SET_PERMISSION':
				let reply = genMsgObj('server', 'SET_PERMISSION_REPLY', '');
				if(dbStore['permission'][message.access].length == 0)
				{
					// set permission
					dbStore['permission'][message.access].push(message.from);
					reply.content = 'permission set';
					strReply = JSON.stringify(reply);
					log2bck(message.username, 'SET_P');
					socket.write(strReply);
				}
				else
				{
					reply.content = 'fail to set permission';
					strReply = JSON.stringify(reply);
					socket.write(strReply);
				}
				break;
			case 'LOGOUT':
				// socket.close()
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


server.on('close', ()=>{
	// persist db
	let data = JSON.stringify(dbStore);
	fs.writeFile('db.dat', data, (err)=>{
		if(err)
			console.log(err);
		else
			console.log('DB persisted.\nServer closed.close');
	});
});


