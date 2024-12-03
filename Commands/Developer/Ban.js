module.exports = {
    name: 'ban',
    aliases: [],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false)
        const Reason = args.slice(1).join(' ')

        if (!User) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário para banir.`
        })

        //CANAL FIXO
        await client.mysql.updateUserBan(User.id, true, Date.now(), Reason || 'Nenhuma razão definida.')
        const channel = client.channels.cache.get('1234709625727619092') || client.channels.cache.get('1234709625727619092')
        channel?.send(`${message.author.tag} \`(${message.author.id})\` baniu ${User.tag} (${User.id}) com a razão \`${Reason || 'Razão indefinida.'}\``).catch(() => null);

        const Message = await client.sendReply(message, {
            content: `${User}, foi banido por ${message.author}, com a razão \`${Reason || 'Razão indefinida.'}\`.`
        })
    }
}