/* (C) 2020 Radical Electronic Systems CC */
'use strict';
const net = require('net');
const logger = require('./logger');
const client = require('./roboxclient');

class RoboXServer {

  constructor (address, port, devices) {
    this.port = port || 7070;
    this.address = address || '127.0.0.1';
    this.clients = [];
    
    for(let r in devices) {
      const d = devices[r];
      let rd = new client(d.tagName, d.ipAddress, d.channels, address);
      rd.start();
      this.clients.push(rd);
    }
  }

  findClient(clientList, ipaddress) {
    for(let c in clientList) {
      let cl = clientList[c];
      if(cl.getIpAddress() == ipaddress) {
        return cl;
      }
    }

    return null;
  }

  defaultResponse(socket) {
    const r = {Status:"OK"};
    const m = JSON.stringify(r);
		socket.write(m);
		socket.end();
  }


  start (callback) {

    var server = this; // we'll use 'this' inside the callback below
    server.connection = net.createServer((socket) => { // old onClientConnected

      //logger.debug(`RoboX-N100 ${socket.remoteAddress} connected.`);
      let cl = this.findClient(this.clients, socket.remoteAddress);

      if(cl != null) {

          // Triggered on message received by this client
          socket.on('data', (data) => {
            let m = data.toString().replace(/[\n\r]*$/, '');
            cl.receiveMessage(m);
            cl.respondStatus(socket);
          });

          // Triggered when this client disconnects
          socket.on('end', () => {
            cl.disconnected();
          });

          // Error handler
          socket.on('error', () => {
            cl.error();
          });

          cl.connected();
      }
      else {
        logger.warn('Device not in DB @' + socket.remoteAddress);
        this.defaultResponse(socket);
      }
    });

    // starting the server
    this.connection.listen(this.port, this.address);
		// setuping the callback of the start function
		if (callback != undefined) {
			this.connection.on('listening', callback);
		}

    logger.info(`RoboX Logger Started @ ${this.address}:${this.port}`);
  }
}

module.exports = RoboXServer;
