const { TimestampStyles, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector, User } = require("discord.js");

const { relativeTime } = require('util-stunks');

const abbreviate = require("util-stunks");



module.exports = {

    name: 'rank',

    description: 'Veja a lista dos que mais receberam reputações.',

    aliases: ['rank'],

    cooldown: 1200,

    usage: '[usuário]',



    /** @param {import('../../Base/client.js')} client */

    run: async (client, message, args) => {

        if (!['rep', 'reps'].includes(args[0])) return;



        // Buscando usuario

        const user = await client.util.FindUser(args[1], client, message, true);

        const UsersLeaderboardData = await client.mysql.findUsersTopReputation();



        if (!UsersLeaderboardData.length) return client.sendReply(message, {

            content: `${client.config.emojis.error} ${message.author}, nenhum usuário recebeu reputações ainda... Que tal ser o primeiro? Para dar uma reputação, use o comando \`${client.prefix}rep\``,

        });



        // Ajustando variável

        const FirstUsersLeaderboard = UsersLeaderboardData.sort((a, b) => b?.rep_count - a?.rep_count);

        const UsersLeaderboard = [];

        for (const UserData of FirstUsersLeaderboard)

            UsersLeaderboard.push({ user: await client.users.fetch(UserData.user).catch(() => 'Desconhecido'), rep_count: UserData.rep_count });



        UsersLeaderboard.length = (UsersLeaderboard.length > 10) ? 10 : UsersLeaderboard.length;



        const Embed = new EmbedBuilder()

            .setTitle('Rank Reps')

            .setDescription(UsersLeaderboard.map((userData, Rank) => `\`${(Rank + 1).toLocaleString()}º\` **${userData.user?.tag}** - ( ${(userData.rep_count)} Rep${userData.rep_count !== 1 ? 's' : ''} )\n\`ID: ${userData.user?.id}\``).join('\n\n'))

            .setColor(client.config.colors.default)

            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })

            .setTimestamp();



        client.sendReply(message, {

            content: message.author.toString(),

            embeds: [Embed],

        });

    },

};