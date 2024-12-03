const { EmbedBuilder } = require('discord.js')
const { inspect } = require('util')

module.exports = {
    name: 'eval',
    aliases: ['e', 'ev'],
    description: 'Comando não disponível.',
    cooldown: 0,
    usage: null,
    run: async (client, message, args) => {
        if (!Object.values(client.config.permissions.developer).includes(message.author.id)) return;
        if (!args[0]) return client.sendReply(message, '?');

        const code = args.join(' '), time = Date.now();

        try {
            let result = await eval(code), response
            if (typeof result !== 'string') result = inspect(result)
            if (result.length > 3980) response = `\`\`\`js\n${result.slice(0, 3980)} ...\n\`\`\``
            else response = `\`\`\`js\n${result}\n\`\`\``

            const embed = new EmbedBuilder()

                .setTitle(`Código Executado - JavaScript`)
                .setDescription(`${response.replace(client.token, '?')}`)
                .setFooter({ text: `Tempo de Execução: ${Date.now() - time}ms`, iconURL: message.author.displayAvatarURL() })

            client.sendReply(message, {
                embeds: [embed]
            })
        } catch (e) {
            const embed = new EmbedBuilder()

                .setTitle('Código de Síntaxe Incorreta - JavaScript')
                .setDescription('\`\`\`js\n' + e + '\n\`\`\`')
                .setFooter({ text: `Tempo de Execução: ${Date.now() - time}ms`, iconURL: message.author.displayAvatarURL() })

            client.sendReply(message, {
                embeds: [embed]
            })
        }
    }
}