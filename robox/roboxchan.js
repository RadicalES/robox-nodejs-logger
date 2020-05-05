/* (C) 2020 Radical Electronic Systems CC */
'use strict';

const logger = require('./logger');

class RoboXChannel {

	constructor (parent, name, index,) {
        this.Parent = parent;
		this.Status = "NOTSET";
		this.Name = name;
        this.Index = index;
	}

	setStatus(status) {
        let s = (status > 0) ? "SET" : "CLEARED";
		if(this.Status != s) {
            const m = (this.Parent.getName() + ' - CHAN[' + this.Index + ']: ' + this.Name + ' STATUS CHANGED FROM ' + this.Status + ' TO ' + s);
            logger.info(m);
			this.Status = s;
		}
    }
    
    getStatus() {
        return this.Status;
    }

}
module.exports = RoboXChannel;