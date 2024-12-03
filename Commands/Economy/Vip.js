const { TimestampStyles, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require("discord.js");
const { relativeTime } = require('util-stunks')

module.exports = {
    name: 'vip',
    description: 'Veja detalhes sobre o seu vip.',
    aliases: ['vip'],
    cooldown: 1200,
    usage: '[usuário]',
    /** @param {import('../../Base/client.js')} client */
    run: async (client, message, args) => {
        const userPremium = await client.mysql.findUserPremium(message.author.id, true);
        let fields = [{ name: '💎 Status' }];

        if (!userPremium) fields[0].value = '> Inativo';
        else {
            fields[0].value = '> Ativo!';
            fields[1] = { name: '🕐 Tempo Restante', value: `> ${relativeTime(userPremium, { display: 3 })}`}
        }

        const Embed = new EmbedBuilder()
            .setTitle('Status Vip')
            .setThumbnail('https://media.discordapp.net/attachments/790249184585318430/1129512016193798285/bs_vipmembro.png')
            .setFields(fields)
            .setColor(client.config.colors.default)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const Button = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setLabel('Benefícios')
                .setCustomId('vip')
                .setEmoji('💎')
                .setStyle(ButtonStyle.Primary));

        const msg = await client.sendReply(message, {
            content: message.author.toString(),
            embeds: [Embed],
            components: [Button],
        });

        // Criando coletor para botões
        const collector = new InteractionCollector(client, { message: msg, time: 5 * 60 * 1000, filter: f => f.user.id === message.author.id });
        collector.on('collect', async button => {
            button.reply({
                content: ` ${button.user}, com o vip você: \n- **Não possui taxas** nas **Apostas**\n- Tem uso do comando **${client.prefix}emoji edit (para personalizar um emoji na ${client.prefix}race)**`,
                ephemeral: true,
                allowedMentions: { parse: [] },
            });
        });

        collector.on('end', (undefined, reason) => {
            if (reason === 'time') msg?.edit({ components: [] }).catch(() => null);
        })
    },
};