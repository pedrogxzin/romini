const { EmbedBuilder } = require('discord.js');
const { unabbreviate, abbreviate } = require('util-stunks');

module.exports = {
    name: 'listcodes',
    aliases: ['listarcodigos'],
    description: 'Lista os codigos que ainda funcionam.',
    cooldown: 0,
    usage: null,
    /** 
     * @param {import('../../Base/client')} client 
     * @param {import('discord.js').Message} message
     * @param {string[] args}
     * */
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;
        const allCodes = await client.mysql.giftCard.findAll()

        await client.sendReply(message, {
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
                    .setTitle('Codigos funcionais:')
                    .setDescription(
                        allCodes.map((code, index) => {
                            const validData = code.dataValues;

                            return `> * **${index+1}º** ⮕ **Código**: \`${validData.code}\` **‖** **Valor**: ${validData.premium} \`(${abbreviate(validData.premium)})\` Estrelas.`
                        }).join('\n') || "Nenhum código disponível"
                    )
            ]
        })
    }
}