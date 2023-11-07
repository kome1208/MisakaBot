const { Message } = require('discord.js');
const axios = require('axios');
const tweakSearch = require('../utils/tweakSearch.js');

module.exports = {
	name: 'messageCreate',
    /**
     * 
     * @param {Message} message 
     */
	async execute(message) {
		if (message.content.match(/\[\[([\w\s-]+)]]/)) {
            tweakSearch.run(message);
        }
	}
};