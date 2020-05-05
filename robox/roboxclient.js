/* (C) 2020 Radical Electronic Systems CC */
'use strict';

const net = require('net');
const logger = require('./logger');
const channel = require('./roboxchan');

class RoboXClient {

	constructor (name, ipaddress, channels, server) {
		this.DeviceOnline = false;
		this.DeviceStatus = "BOOTING";
		this.Name = name;
		this.IpAddress = ipaddress;
		this.Channels = channels;
		this.Timer = null;
		this.ScheduleTime = 4000;
		this.ServerIp = server;
		this.Channels = [];

		for(let c in channels) {
			const ch = channels[c];
      		let chd = new channel(this, ch.tagName, ch.index);
      		this.Channels.push(chd);
		}
	}

	start() {
		logger.info(this.Name + " Starting @ IP: " + this.IpAddress);
		this.scheduleSubscription(4000);
	}

	scheduleSubscription(time) {
		this.ScheduleTime = time;
		this.Timer = setTimeout( () => {
			this.subscribe();	
		}, time);
	}

	setOnline(status) {
		if(this.DeviceOnline != status) {
			if(this.DeviceOnline === true) {
				logger.info(this.Name + ' is OFFLINE');
			}
			else {
				logger.info(this.Name + ' is ONLINE');
			}
			this.DeviceOnline = status;
		}

	}

	setStatus(status) {
		if(this.DeviceStatus != status) {
			logger.info(this.Name + ' STATUS: ' + status);
			this.DeviceStatus = status;
		}
	}

	setChannels(value) {
		for(let c in this.Channels) {
		  let cl = this.Channels[c];
		  let v = value & (1 << c);
		  cl.setStatus(v);
		}
	  }

	subscribe() {
		let c = new net.Socket();
		
		c.connect(7070, this.IpAddress, () => {
			this.ScheduleTime = 4000;
			const o = { 
				subscribeDigitalPort: { 
					IpAddress: this.ServerIp,
					IpPort:7070,
					ListenPort:0,
					ListenType:"OPTO",
					SendPort:0,
					SendType:"OPTO"
				}
			}

			this.setOnline(true);
			const m = JSON.stringify(o);
			c.write(m);
		});

		c.on('data', (data) => {
			const r = JSON.parse(data);
			if('Status' in r) {
				this.setStatus(r.Status);
			}
			else {
				this.setStatus("MISSING");
			}
			
			c.destroy(); // kill client after server's response
		});

		c.on('close', () => {
			//console.log('RBX CLT ' + this.Name + ' disconnected');
			this.scheduleSubscription(this.ScheduleTime);
		});

		c.on('error', () => {
			this.setStatus("OFFLINE");
			this.setOnline(false);
			// delay reconnect on dead connections
			this.ScheduleTime = 20000;
		});
	}

	connected() {
		//console.log(`${this.Name} connected.`);
		logger.debug(this.Name + ' connected');
		this.setOnline(true);
	}

	disconnected() {
		logger.debug(this.Name + ' disconnected');
	}

	error() {
		//console.log(`${this.Name} network error.`);
		logger.error(this.Name + '  network error occured');
	}

	getIpAddress() {
		return this.IpAddress;
	}

	getName() {
		return this.Name;
	}

	transmitMessage(socket, result) {
		// make sure the socket is valid
		if(socket) {
			const m = JSON.stringify(result);
			socket.write(m);
			socket.end();
		}
	}

	respondStatus(socket) {
		this.transmitMessage(socket, {Status:"OK"});
	}

	receiveMessage (message) {
		let m = JSON.parse(message);

		if("eventDigitalPort" in m) {
			let e = m["eventDigitalPort"];		
			this.setChannels(e.Value);
		}
		else {
			logger.warn(this.Name + ' - Unknown message :' + message)
		}

	}

	

}
module.exports = RoboXClient;
