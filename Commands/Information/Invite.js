const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: 'invite',
    aliases: ['invite'],
    description: 'Obtenha a velocidade de resposta e latência da aplicação.',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
        const Row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setURL(client.config.links.invitation_url)
                .setStyle(ButtonStyle.Link)
                .setLabel('Me Adicione')
                .setEmoji(client.config.emojis.money),
            new ButtonBuilder()
                .setURL(client.config.links.official_guild)
                .setStyle(ButtonStyle.Link)
                .setLabel('Servidor Oficial')
        );

        // Calcula o número total de membros em todos os servidores
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        client.sendReply(message, {
            components: [Row],
            content: `${message.author.toString()}, para me adicionar no seu servidor, clique no botão abaixo.\n\n` +
                     `**Atualmente Estou em \`${client.guilds.cache.size.toLocaleString('de-DE')} Servidores\` e tenho um total de \`${totalMembers.toLocaleString('de-DE')} Membros\`.**`
        });
    }
}