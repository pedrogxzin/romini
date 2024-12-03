const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User } = require('discord.js')
const { unabbreviate } = require('util-stunks')
const ms = require('ms')

module.exports = {
    name: 'drop',
    aliases: ['dropar', 'giveaway'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const Value = Math.floor(unabbreviate(args[0]))
        const Time = ms(args[1] || '2m')
        let Winners = parseInt(args[2]), Users = []

        if (!Winners || isNaN(Winners) || Winners > 15 || Winners < 2) Winners = 1

        if ((isNaN(Value) || Value < 1 || Value > 1_000_000_000)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **1 quartzo** iniciar um sorteio.`
        })

        if (isNaN(Time)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um tempo válido para o sorteio.`
        })
        
        //CANAL FIXO
        await client.channels.cache.get('1263107957839888415').send(`${message.author.tag} \`(${message.author.id})\` criou um sorteio no valor de ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** com \`${ms(Time)}\` de duração e ${Winners} ganhadores neste drop`)

        const Embed = new EmbedBuilder()

            .setColor(client.config.colors.default)
            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()

            .setTitle(`Sorteio`)
            .setDescription(`Um novo drop foi iniciado, parar entrar nele clique na reação abaixo para participar.`)

            .setFields([
                {
                    name: 'Valor',
                    value: (client.config.emojis.money + ' **' + Value.toLocaleString('pt') + '** Flocos'),
                    inline: true
                },
                {
                    name: 'Ganhadores',
                    value: `${Winners}`,
                    inline: true
                },
                {
                    name: 'Finaliza em',
                    value: `<t:${parseInt((Date.now() + Time) / 1000)}:R>`,
                    inline: true
                },
                {
                    name: 'Ganhador(es)',
                    value: `Ninguém, ainda.`,
                    inline: false
                }
            ])

        const Message = await message.channel.send({
            embeds: [Embed]
        })
        Message.react('🎉')

        const filter = (reaction, user) => ['🎉'].includes(reaction.emoji.name) && !user.bot
        const Collector = Message.createReactionCollector({
            filter: filter,
            time: Time
        })

        Collector.on('collect', async (reaction, user) => {
            try {
                if (Users.includes(user.id)) return;
                Users.push(user.id)
            } catch (e) {
                console.log(e)
            }
        })

        Collector.on('end', async () => {
            if (Users.length < 1) return message.reply(`${client.config.emojis.error} ${message.author}, não tinham participantes o suficiente nesse sorteio.`)
            if (Winners > Users.length) Winners = Users.length

            let WinnerList = []

            for (i = 0; i < Winners; i++) {
                let user = Users[parseInt(Math.random() * Users.length)]
                WinnerList.push(user)
                Users = Users.filter(x => x != user)
            }

            for (let i of WinnerList) {
                client.mysql.updateUserMoney(i, Value)
            }

            let EmbedFields = Message.embeds[0].data

            EmbedFields.fields[3] = { name: `Ganhadores`, value: `${WinnerList.map(u => `<@${u}>`).join(', ')}`, inline: false }

            Message?.edit({ embeds: [EmbedFields] })
            Message?.reply({
                content: `${WinnerList.map(u => `<@${u}>`).join(', ')} **parabéns**! ${WinnerList.length > 1 ? 'vocês ganharam' : 'você ganhou'} ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** nesse sorteio!`
            })
        })
    }
}