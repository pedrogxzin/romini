const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, InteractionCollector } = require('discord.js')
const { unabbreviate } = require('util-stunks')
const ms = require('ms');
const abbreviate = require('util-stunks');

module.exports = {
    name: 'sortear',
    aliases: ['sorteio', 'giveaway'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: '<quantidade> <tempo> [ganhadores]',
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const Value = Math.floor(unabbreviate(args[0]))
        const Time = ms(args[1] || '2m')
        let Winners = parseInt(args[2]), Users = [];

        if (!Winners || isNaN(Winners) || Winners > 1000 || Winners < 2) Winners = 1

        if ((isNaN(Value) || Value < 1 || Value > 100_000_000_000_000_000.0)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **1 Flocos** iniciar um sorteio.`
        })

        if (isNaN(Time)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um tempo válido para o Drop.`
        })
        
        //CANAL FIXO
        const channel = client.channels.cache.get('1263107957839888415') || client.channels.cache.get('1263107957839888415')
        channel?.send(`${message.author.tag} \`(${message.author.id})\` criou um sorteio no valor de ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** Com a duração \`${ms(Time)}\`, e ${Winners} ganhadores neste sorteio`).catch(() => null);

        const Embed = new EmbedBuilder()

            .setColor(client.config.colors.default)
            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()

            .setTitle(`**🎉 Sorteio**`)
            .setDescription(`Para participar deste sorteio clique no botão abaixo!`)
            .setFields([
				{
					name: '⭐ Valor',
					value: ( ' **' + Value.toLocaleString('pt') + '** Flocos'),
				},
                {
                    name: '<:confirmar:1153147776763428894> Ganhadores',
                    value: `${Winners}`,
                },
                {
                    name: '⏰ Tempo para finalizar:',
                    value: `<t:${parseInt((Date.now() + Time) / 1000)}:R>`,
                },
				{
					name: 'Ganhador(es)',
					value: 'Ninguém, ainda.',
				}
            ])

        const Button = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setLabel('Participantes')
                .setEmoji('🎉')
                .setCustomId('g-join')
                .setStyle(ButtonStyle.Primary));

        const Message = await message.channel.send({
            embeds: [Embed],
            components: [Button],
        })

        const filter = f => f.customId === 'g-join';
        const Collector = new InteractionCollector(client, { filter, time: Time, message: Message });

        Collector.on('collect', async (button) => {
            if (Users.includes(button.user.id)) return button.reply({ content: `${client.config.emojis.error} ${button.user}, você já está participando do sorteio.`, ephemeral: true, allowedMentions: { parse: [] } });
            
            const Cooldowns = await client.mysql.getCooldowns(button.user.id, true);
            if (Cooldowns.daily < Date.now()) return button.reply({
                content: `${client.config.emojis.clock} ${button.user}, você não pode participar do sorteio pois ainda não coletou sua recompensa diária, use o comando \`odaily\` para coletar.`,
                ephemeral: true,
                allowedMentions: { parse: [] },
            });

            Users.push(button.user.id);
            
            const EditedButton = button.message.components[0].components[0].data;
            EditedButton.label = `Participantes (${Users.length})`;
            const EditedRow = new ActionRowBuilder().setComponents(new ButtonBuilder(EditedButton));

            button.update({ components: [EditedRow] }).catch(() => {})
        });

        Collector.on('end', async (undefined, reason) => {
            if (reason !== 'time') return;
            if (Users.length < 1) {
                Message.edit({ components: [] });
                return message.reply(`${client.config.emojis.error} ${message.author}, não tinham participantes o suficiente nesse drop.`)
            }

            if (Winners > Users.length) Winners = Users.length;
            let WinnerList = [];

            for (i = 0; i < Winners; i++) {
                let user = Users[parseInt(Math.random() * Users.length)]
                WinnerList.push(user)
                Users = Users.filter(x => x != user)
            }

            for (let i of WinnerList) 
                client.mysql.updateUserMoney(i, Value)
            
            let EmbedFields = Message.embeds[0].data;
            EmbedFields.fields[2] = { name: `Ganhadores`, value: `${WinnerList.map(u => ` <@${u}>`).join(',')}` }

            Message?.edit({ embeds: [EmbedFields], components: [] }).catch(() => null);
            Message?.reply({
                content: `🎟️ | Esse sorteio Obteve **${Winners} Ganhadores!**\n 🎉 | Parabéns ${WinnerList.length > 1 ? 'aos ganhadores' : 'ao ganhador'} do sorteio | **${Value.toLocaleString()} Flocos**\n${WinnerList.map(m => ` <@${m}>`).join('\n')}`,
            })
        })
    }
}