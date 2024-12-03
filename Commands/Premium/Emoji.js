const { EmbedBuilder } = require('discord.js');
const nodeEmoji = require('node-emoji');

module.exports = {
    name: 'emoji',
    aliases: ['emoji'],
    description: `Customize seu emoji favorito para rinhas\``,
    cooldown: 1200,
    premium: true,
    usage: 'edit <emoji> | remover',
    run: async (client, message, args) => {
        // Se for editar
        if (['edit', 'editar'].includes(args[0])) {

            // Se não tiver valor
            if (!args[1]) return client.sendReply(message, {
                content: `${client.config.emojis.error} | ${message.author}, digite o emoji que deseja personalizar nas rinhas do \`${client.prefix}race\`.`
            })

            // Buscando emoji
            const emoji = findEmoji(message, args[1]);
            if (!emoji) return client.sendReply(message, {
                content: `${client.config.emojis.error} | ${message.author}, o emoji enviado não existe ou não foi encontrado no servidor.\nDica: se o emoji estiver no seu servidor, use este comando nele`
            })

            // Adicionando na database
            client.mysql.updateUserEmoji(message.author.id, emoji);
            
            const Embed = new EmbedBuilder()
                .setTitle(`**Emoji Personalizado**`)
                .setDescription(`${message.author}, seu emoji foi personalizado para ${emoji}!\nAgora, ao participar de uma rinha em \`${client.prefix}race\` seu emoji será este.`)        
                .setColor(client.config.colors.default)
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return client.sendReply(message, {
                content: message.author.toString(),
                embeds: [Embed],
            });
        }

        else if (['remove', 'remover'].includes(args[0])) {
            // Buscando emoji
            const emojiDb = await client.mysql.findUserEmoji(message.author.id);
            console.log(emojiDb);

            if (!emojiDb) return client.sendReply(message, {
                content: `${client.config.emojis.error} | ${message.author}, você não possui um emoji personalizado ainda! para criar um, use \`${client.prefix}emoji edit <emoji>\``,
            })

            // Apagando da database
            await client.mysql.updateUserEmoji(message.author.id, null);

            const Embed = new EmbedBuilder()
            .setTitle(`**Emoji Removido**`)
            .setDescription(`${message.author}, seu emoji personalizado foi removido com sucesso!`)
            .setColor(client.config.colors.default)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

            return client.sendReply(message, {
                content: message.author.toString(),
                embeds: [Embed],
            });
        }

        // Se não houver argumentos
        else return client.sendReply(message, {
            content: `${client.config.emojis.error} | ${message.author}, para adicionar um emoji personalizado para as rinhas do \`${client.prefix}race\`, use \`${client.prefix}emoji edit <emoji>\`.\nPara remover o emoji personalizado, use \`${client.prefix}emoji remover\`.`
        })
        // vip (updateUserPremium)
    }
}

// Função para buscar emoji
function findEmoji(message, textConvert) {
    textConvert = textConvert.split(' ')[0];
    let emoji;
    
    if (textConvert.startsWith('<') && textConvert.endsWith('>')) emoji = message.guild.emojis.cache.get((textConvert.split(':')[2].replace('>', '')));
    else if (!isNaN(Math.floor(textConvert))) emoji = message.guild.emojis.cache.get(textConvert);
    else emoji = message.guild.emojis.cache.find(f => f.name === textConvert);
    
    if (!emoji) emoji = nodeEmoji.get(textConvert);
    if (emoji?.id) emoji = emoji.toString();
    if (typeof emoji === 'string' && emoji.startsWith(':')) emoji = undefined;
    
    return emoji;
}