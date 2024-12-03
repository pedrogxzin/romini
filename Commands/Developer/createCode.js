const { unabbreviate } = require('util-stunks');

module.exports = {
    name: 'createcode',
    aliases: ['criarcodigo'],
    description: 'Cria um codigo para resgate.',
    cooldown: 0,
    usage: '<code> <valor>',
    /** 
     * @param {import('../../Base/client')} client 
     * @param {import('discord.js').Message} message
     * @param {string[] args}
     * */
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;
        if (!args[1])
            return await client.sendReply(message, {
                content: "Digite um valor de prêmio válido."
            })
        let premium;
        try {
            premium = Number(unabbreviate(args[1]))
        } catch (e) {
            return await client.sendReply(message, {
                content: "Digite um valor de prêmio válido."
            })
        }
        if (!args[0]) {
            return await client.sendReply(message, {
                content: "Digite um código válido."
            })
        }
        await message.delete()
        await client.mysql.createGiftCard(args[0], premium)
        return await client.sendReply(message, {
            content: "Código criado!"
        })
    }
}