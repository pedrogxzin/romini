const { EmbedBuilder } = require('discord.js')
const { inspect } = require('util')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'removemoney',
    aliases: [],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false)
        const Value = Math.floor(unabbreviate(args[1]))

        if (!User || User.id == message.author.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para remover as Estrelas.`
        })

        if (isNaN(Value) || Value < 1 || Value > 100_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **1 Flocos** para remover.`
        })
        
        //CANAL FIXO
        const channel = client.channels.cache.get('1236468805127897148') || client.channels.cache.get('1236468805127897148')
        channel?.send(`<a:emoji_46:1097928523060105226> | ${message.author.tag} \`(${message.author.id})\` removeu ${client.config.emojis.money} **${Value.toLocaleString()} Estrelaa** de ${User.tag} (${User.id})`).catch(() => null);
        await client.mysql.updateUserMoney(User.id, -Value)

        const Message = await client.sendReply(message, {
            content: `${User}, você teve ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** removidos por uma intervenção divina.`
        })
    }
}