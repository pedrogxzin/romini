const { relativeTime } = require('util-stunks');
const ms = require('ms');

module.exports = {
    name: 'removevip',
    aliases: ['remover-vip'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    /** @param {import('../../Base/client')} client */
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.moderator).includes(message.author.id)) return;

        const User = await client.util.FindUser(args[0], client, message, false);
        const Time = ms(args[1] || 'a');

        if (!User) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para remover tempo de vip.`
        });

        if (isNaN(Time)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um tempo válido para ser removido.`
        })
        
        //CANAL FIXO
        await client.mysql.removeUserPremium(User.id, args[1]);
        const UserData = await client.mysql.findUser(User.id, true);
        const leftText = (UserData.premium > Date.now()) ? relativeTime(UserData.premium) : 'Nulo (Vip Removido)';

        const channel = client.channels.cache.get('1236469073487986751') || client.channels.cache.get('1236469073487986751')
        channel?.send(`<a:emoji_46:1097928523060105226> | \`${message.author.tag}\` \`(${message.author.id})\` removeu tempo de vip de \`${User.tag}\` \`(${User.id})\`, pelo período de **${relativeTime(Date.now() - Time, { display: 2 })}**.\nAgora, o tempo restante de vip é **${leftText}**`).catch(() => null);

        client.sendReply(message, {
            content: `${User}, foi removido tempo de seu ** Vip/Premium** por **${relativeTime(Date.now() - Time, { display: 2 })}**. Agora seu tempo de vip restante é **${leftText}**`
        });
    }
}