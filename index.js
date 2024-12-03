const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config: ConfigDotenv } = require('dotenv');
const { red: ConsoleColorRed, blue: ConsoleColorBlue, yellow: ConsoleColorYellow, green: ConsoleColorGreen } = require('chalk');
const { MercadoPagoConfig, Payment } = require('mercadopago')

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ]
});

const ClientMP = new MercadoPagoConfig({ accessToken: "APP_USR-1360331041562101-080921-9cec6b412807d95072e330eeab9df733-46783107", options: 
{ timeout: 5000, idempotencyKey: 'abc' }
})

client.prefix = 'r';
client.commands = new Collection();
client.aliases = new Collection();
client.cooldown = new Collection();
client.carry = new Collection();
client.mp = new Payment(ClientMP)

client.mysql = new (require('./Database/MySQL'))()
client.util = new (require('./Base/ClientUtils'))(client)
client.config = require('./Base/Config.json')

ConfigDotenv()

client.util.LoadCommands()
client.util.LoadEvents()
client.login(process.env.CLIENT_TOKEN);

client.sendReply = async (Message, Data) => {
    try {
        const BotMessage = await Message.reply(Data)
        return BotMessage
    }
    catch (e) {
        const BotMessage = await Message.channel?.send(Data)
        return BotMessage
    }
}

process.on('uncaughtException', e => {
    console.log(ConsoleColorRed('[ERRO] '), e)
})

process.on('unhandledRejection', e => {
    console.log(ConsoleColorRed('[ERRO] '), e)
})

module.exports = client;