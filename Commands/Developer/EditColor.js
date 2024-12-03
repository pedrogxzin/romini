module.exports = {
    name: 'editcolor',
    aliases: ['ec'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: '<cor>',
    /** 
     * @param {import('../../Base/client')} client 
     * @param {import('discord.js').Message} message
     * @param {string[] args}
     * */
    run: async (client, message, args) => {
        let user = await client.util.FindUser(args[0], client, message, true)

        if (!Object.values(client.config.permissions.developer).includes(message.author.id)) return;
        if (!args[1]) return client.sendReply(message, {
            content: `${client.config.emojis.error} | ${message.author}, que cor deseja definir na fonte do perfil?`
        })

        let color = /^#[0-9A-F]{6}$/i.test(args[1])

        if (!color) return client.sendReply(message, {
            content: `${client.config.emojis.error} | ${message.author}, essa não é uma cor válida!`
        })

        client.mysql.updateUser(user.id, { color: args[1] });

        return client.sendReply(message, {
            content: message.author.toString() + `, eu defini a cor da fonte do perfil de ${user.toString()} como \`${args[1]}\`!`
        });
    }
}