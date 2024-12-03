module.exports = {
    name: 'unban',
    aliases: [],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false)

        if (!User || User.id == message.author.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário para desbanir.`
        })

        //CANAL FIXO
        await client.mysql.updateUserBan(User.id, false);
        const channel = client.channels.cache.get('1234709733454250044') || client.channels.cache.get('1234709733454250044')
        channel?.send(`${message.author.tag} \`(${message.author.id})\` desbaniu ${User.tag} (${User.id})`).catch(() => null);

        const Message = await client.sendReply(message, {
            content: `${User}, foi desbanido por ${message.author}.`
        })
    }
}