const { EmbedBuilder } = require('discord.js')
const { inspect } = require('util')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'setmoney',
    aliases: [],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false)
        const Value = Math.floor(unabbreviate(args[1]))

        if (!User) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para enviar os Flocos.`
        })

        if (isNaN(Value) || Value < 0 || Value > 100_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número maior ou igual a **0 Estrelas** para enviar.`
        })

        //CANAL FIXO
        const channel = client.channels.cache.get('1236469495145693195') || client.channels.cache.get('1236469495145693195')
        channel?.send(`<a:emoji_46:1097928523060105226> | ${message.author.tag} \`(${message.author.id})\` definiu ${client.config.emojis.money} **${Value.toLocaleString()} Estrelas** em ${User.tag} (${User.id})`).catch(() => null);
        
        await client.mysql.users.update({
            money: Value
        }, {
            where: { id: User.id }
        })

        const Message = await client.sendReply(message, {
            content: `${User} definiu seu saldo como ${client.config.emojis.money} **${Value.toLocaleString()} Flocos**.`
        })
    }
}