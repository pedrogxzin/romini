const { Client, Collection } = require('discord.js');

class client extends Client {
    construct() {
        this.prefix = 'o';
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldown = new Collection();

        this.mysql = new (require('../Database/MySQL'))();
        this.util = new (require('../Base/ClientUtils'))();
        this.config = require('../Base/Config.json');
    }

    /** 
     * @param {import('discord.js').Message} Message 
     * @param {import('discord.js').MessageCreateOptions} Data */
    async sendReply(Message, Data) {
        try {
            return await Message.reply(Data);
        }
        catch (e) {
            return await Message.channel?.send(Data);
        }
    }
}
module.exports = new client();