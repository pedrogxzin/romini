const { EmbedBuilder } = require("discord.js");
const { relativeTime } = require('util-stunks');
const ms = require("ms");

module.exports = {
    name: 'brep',
    aliases: ['bloquearrep', 'bloquearreps', 'blockreps', 'blockrep'],
    description: 'Bloqueie/Desbloqueie os recebimentos de reputações.',
    cooldown: 1200,
    usage: '',
    /** @param {import('../../Base/client')} client */
    run: async (client, message, args) => {
        const statusRep = await client.mysql.findUser(message.author.id, true);

        // Se for desbloquear
        if (statusRep.block_reps) {
            await client.mysql.updateUser(message.author.id, { block_reps: false });
            client.sendReply(message, { content: `${client.config.emojis.success} ${message.author}, suas reputações foram abertas, agora você poderá receber reputações de outros usuários pelo comando \`${client.prefix}rep\`` });
        } 
        
        // Se for bloquear
        else {
            await client.mysql.updateUser(message.author.id, { block_reps: true });
            client.sendReply(message, { content: `${client.config.emojis.success} ${message.author}, suas reputações foram congeladas, agora não poderão te enviar reputações com o \`${client.prefix}rep\`` });
        }
    },
};