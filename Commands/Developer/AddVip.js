const { relativeTime } = require('util-stunks');
const ms = require('ms');

module.exports = {
    name: 'addvip',
    aliases: ['add-vip'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false);
        const Time = ms(args[1] || 'a');

        if (!User) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para adicionar o vip.`
        });

        if (isNaN(Time)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um tempo válido para o vip.`
        })
        
        //CANAL FIXO
        await client.mysql.updateUserPremium(User.id, args[1]);
        const channel = client.channels.cache.get('1234709096654176339') || client.channels.cache.get('1234709096654176339')
        channel?.send(`<a:emoji_46:1097928523060105226> | \`${message.author.tag}\` \`(${message.author.id})\` adicionou vip em \`${User.tag}\` \`(${User.id})\` pelo período de **${relativeTime(Date.now() + Time, { display: 2 })}**`).catch(() => null);

        client.sendReply(message, {
            content: `${User}, você recebeu **Vip/Premium** por **${relativeTime(Date.now() + Time, { display: 2 })}**. Aproveite!`
        });
    }
}