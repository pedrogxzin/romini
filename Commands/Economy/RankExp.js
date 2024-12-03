const { TimestampStyles, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector, User } = require("discord.js");
const { relativeTime } = require('util-stunks');
const { abbreviate } = require("util-stunks");

module.exports = {
    name: 'topxp',
    description: 'Veja a lista dos que mais receberam reputações.',
    aliases: ['xptop', 'exprank', 'xplb'],
    cooldown: 1200,
    usage: '[usuário]',
    run: async (client, message, args) => {
        let users_leaderboard = await client.mysql.users.findAll({
            order: [['level', 'DESC']],
            attributes: ['id', 'level', 'exp']
        }).then(x => x.map(y => y.dataValues))

        let description = []

        await Promise.all(
            users_leaderboard.slice(0, 10).map(async (i, x) => {
                try {
                    let user = await client.users.fetch(i.id)
                    description.push(`> **${x + 1}°** - \`${user.tag}\` - **Nível: ${i.level.toLocaleString('pt')} \`[${abbreviate(i.exp, { display: 1 })}/2.0K]\`** `)
                } catch (e) {
                    console.log(e)
                }
            })
        )

        const embed = new EmbedBuilder()

            .setColor(client.config.colors.default)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()

            .setDescription(description.join('\n'))
            .setTitle(`✨ Placar de Experiência`)

        message.reply({
            embeds: [embed],
            content: message.author.toString()
        })
    }
};