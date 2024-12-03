module.exports = {
    name: 'on',
    aliases: ['off'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: '<quantidade> <tempo> [ganhadores]',
    /** 
     * @param {import('../../Base/client')} client 
     * @param {import('discord.js').Message} message
     * @param {string[] args}
     * */
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.developer).includes(message.author.id)) return;
        const command = message.content.split(' ')[0].substring(1); 
        console.log(command);   
        if (command === 'on') {
            await client.mysql.removeMaintenance();

            client.sendReply(message, { content: `${client.config.emojis.success} ${message.author}, meu status de manuntenção foi removido com sucesso, agora estou operando normalmente` });
        }
        else {
            await client.mysql.updateStephanieData({
                maintenance: true,
                maintenance_reason: args.join(' '),
            });

            const reasonText = args[0] ? ` pelo motivo: **${args.join(' ')}** ` : '';
            client.sendReply(message, { content:  `${client.config.emojis.success} ${message.author}, entrei no modo de manuntenção${reasonText}, espero que o problema encontrado não seja grave.` });
        }
    },
};