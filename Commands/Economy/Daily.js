const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { abbreviate, relativeTime } = require('util-stunks')
const moment = require('moment')

moment.locale('pt-br')

module.exports = {
    name: 'daily',
    aliases: ['resgatar', 'recompensa', 'daily', 'diario'],
    description: 'Resgate sua recompensa diária e ganhe algumas Ametistas.',
    cooldown: 86400,
    usage: null,
    run: async (client, message, args) => {
        const Data = await client.mysql.findUser(message.author.id, true)
        const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)

        const Value = Math.floor(Math.random() * 4_000) + 2_000
        const NextPrize = new Date().setHours(24, 0, 0, 0)
        const PremiumBonus = await client.mysql.findUserPremium(message.author.id)

        if (Cooldowns.daily > Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, espere \`${relativeTime(Cooldowns.daily, { displayAtMax: 2 })}\` para poder utilizar esse comando novamente.`
        })

        const Embed = new EmbedBuilder()

            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setColor(client.config.colors.default)
            .setTimestamp()

            .setTitle(`Recompensa Diária`)
            .setDescription(`${message.author}, obrigado por coletar seu báu de presente diário! Você ganhou ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** nesse baú.`)

            .setFields([
                {
                    name: 'Bônus Vip',
                    value: `+ ${client.config.emojis.money} **${PremiumBonus === true ? Value.toLocaleString() : 0} Flocos**`,
                    inline: true
                },
                {
                    name: 'Próximo Baú',
                    value: `${moment(NextPrize).format('LLLL')}`,
                    inline: true
                }
            ])

        const Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('daily-claimed-' + message.author.id + '-' + Date.now())
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel('Sucesso!')
            )

        client.mysql.updateCooldowns(message.author.id, 'daily', NextPrize);
        client.mysql.updateUserMoney(message.author.id, PremiumBonus ? Value * 2 : Value)
        await client.mysql.transactions.create({
            source: 1,
            received_by: message.author.id,
            given_at: Date.now(),
            amount: PremiumBonus ? Value * 2 : Value,
        })

        client.sendReply(message, {
            content: message.author.toString(),
            embeds: [Embed],
            components: [Row]
        })
    }
}