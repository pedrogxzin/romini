const { EmbedBuilder } = require('discord.js')
const { inspect } = require('util')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'addbank',
    aliases: [],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false)
        const user2 = await client.mysql.findUser(args[0], true)
        const Value = Math.floor(unabbreviate(args[1]))

        if (!User) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para enviar as Estrelas.`
        })

        if (isNaN(Value) || Value < 1 || Value > 100_000_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **1 Flocos** para enviar.`
        })

        //CANAL FIXO
        const channel = client.channels.cache.get('1236467164353925181') || client.channels.cache.get('1236467164353925181')
        channel?.send(` ${message.author.tag} \`(${message.author.id})\` enviou ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** para ${User.tag} (${User.id})`).catch(() => null);
        await client.mysql.users.update({
            bank: Value + user2.bank
        }, {
            where: { id: User.id }
        })

        const Message = await client.sendReply(message, {
            content: `${User}, você recebeu ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** de uma intervenção divina.`
        })
    }
}