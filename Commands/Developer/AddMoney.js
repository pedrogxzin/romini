const { EmbedBuilder } = require('discord.js')
const { inspect } = require('util')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'addmoney',
    aliases: [],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false)
        const Value = Math.floor(unabbreviate(args[1]))

        if (!User) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para enviar as Estrelas.`
        })

        if (isNaN(Value) || Value < 1 || Value > 100_000_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **1 Flocos** para enviar.`
        })

        //CANAL FIXO
        const channel = client.channels.cache.get('1234705284442624117') || client.channels.cache.get('1234705284442624117')
        channel?.send(`<:emoji_197:1153145337419141211> | ${message.author.tag} \`(${message.author.id})\` enviou ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** para ${User.tag} (${User.id})`).catch(() => null);
        await client.mysql.updateUserMoney(User.id, Value)

        const Message = await client.sendReply(message, {
            content: `${User}, você recebeu ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** de uma intervenção divina.`
        })
    }
}