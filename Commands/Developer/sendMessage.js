const { EmbedBuilder } = require('discord.js')
const { inspect } = require('util')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'send',
    aliases: ["enviar"],
    description: 'Enviar mensagem em um chat',
    cooldown: 1500,
    usage: "<canal> [mensagem]",
    run: async (client, message, args) => {
        // if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const channel = await message.guild.channels.cache.get(args[0])
        args.splice(0, 1)
        await channel.send({
            content: `${args.join(' ')}`
        })
    }
}