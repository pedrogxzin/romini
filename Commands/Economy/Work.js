const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { abbreviate, relativeTime } = require('util-stunks')
const moment = require('moment')

moment.locale('pt-br')

module.exports = {
    name: 'work',
    aliases: ['job', 'work'],
    description: 'Faça um trabalho voluntário para receber algumas recompensas por isso.',
    cooldown: 1500,
    usage: null,
    run: async (client, message, args) => {
        const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)

        const Value = Math.floor(Math.random() * 7_000) + 500
        const NextPrize = Date.now() + require('ms')('20m')
        const PremiumBonus = await client.mysql.findUserPremium(message.author.id)

        if (Cooldowns.work > Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, espere \`${relativeTime(Cooldowns.work, { displayAtMax: 2 })}\` para poder utilizar esse comando novamente.`
        })

        const Embed = new EmbedBuilder()

            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setColor(client.config.colors.default)
            .setTimestamp()

            .setTitle(`Trabalho`)
            .setDescription(`${message.author}, Você trabalhou e ganhou ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** por isso.`)
            .setThumbnail(client.config.images.chest)

            .setFields([
                {
                    name: 'Bônus Vip',
                    value: `+ ${client.config.emojis.money} **${PremiumBonus === true ? Value.toLocaleString() : 0} Flocos**`,
                    inline: true
                },
                {
                    name: 'Próximo Trabalho',
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
                    .setEmoji(client.config.emojis.key)
                    .setLabel('Concluído!')
            )

        client.mysql.updateCooldowns(message.author.id, 'work', NextPrize)
        client.mysql.updateUserMoney(message.author.id, PremiumBonus ? Value * 2 : Value)
        await client.mysql.transactions.create({
            source: 7,
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