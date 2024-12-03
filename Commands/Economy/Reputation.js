const { EmbedBuilder } = require("discord.js");
const { relativeTime } = require('util-stunks');
const ms = require("ms");

module.exports = {
    name: 'reputation',
    aliases: ['rep', 'reputação'],
    description: 'Envie reputações para seus amigos.',
    cooldown: 1200,
    usage: '<usuário> [motivo]',
    /** @param {import('../../Base/client')} client */
    run: async (client, message, args) => {
        // Verificando cooldown
        const Cooldown = await client.mysql.getCooldowns(message.author.id, true);
        if (Cooldown.rep > Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, espere \`${relativeTime(Cooldown.rep, { display: 2 })}\` para dar reputações novamente.`
        })

        // Verificando usuário
        const User = await client.util.FindUser(args[0], client, message, false);
        const Reason = args[1];

        if (!User || User.id === message.author.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, selecione um usuário válido para dar a reputação!`,
        });

        if (User.bot) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, você não pode enviar reputações para esse tipo de aplicação!`
        })

        if ((await client.mysql.findUser(User.id, true)).block_reps) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, este usuário não deseja receber reputações.`
        })

        // Atualizando reputações
        await client.mysql.updateCooldowns(message.author.id, 'rep', (Date.now() + ms('30m')));
        await client.mysql.updateUserReputation(message.author.id, User.id, Reason);
        const userReps = (await client.mysql.findUserReputation(User.id)).length;
        
        // Respondendo
        const Embed = new EmbedBuilder()
            .setTitle('Nova Reputação')
            .setDescription(`**${message.author.username}** deu uma reputação para ${User}. Agora ${User} possui **${userReps.toLocaleString('pt')} Reputa${userReps > 1 ? 'ções' : 'ção'}**`)
            .setColor(client.config.colors.default)
            .setThumbnail(User.displayAvatarURL({ format: 'png', dynamic: true }))
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        client.sendReply(message, {
            content: `${message.author} - ${User}`,
            embeds: [Embed],
        });
    }
}