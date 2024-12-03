const { EmbedBuilder } = require("discord.js");
const { readdirSync } = require("fs");

const Folders = {
    Economy: {
        name: 'Economia'
    },
    Information: {
        name: 'Utilidades'
    },
    Premium: {
        name: 'Premium'
    }
}

module.exports = {
    name: 'help',
    aliases: ['help', 'ajuda', 'comandos'],
    description: 'Obtenha a velocidade de respota e latência da aplicação.',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
        let Dir = readdirSync("./Commands/"),
            Fields = [],
            cmdSize = 0;

        Dir.forEach((Folder) => {
            if (Folder === "Developer") return;

            const Commands = readdirSync(`./Commands/${Folder}/`)

            const List = Commands.map((cmd) => {
                const Name = cmd.split(".")[0]
                const Command = require(`../../Commands/${Folder}/${Name}`)
                cmdSize++;
                return {
                    name: Command?.name || "Comando Desconhecido"
                }
            })

            Fields.push({
                name: Folders[Folder].name,
                value: List.map(Command => `\`o${Command.name}\``).join(", "),
                inline: false
            })
        })

        const Embed = new EmbedBuilder()

            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setColor(client.config.colors.default)
            .setTimestamp()

            .setTitle(`Painel de Ajuda`)
            .setDescription(`Olá, ${message.author}! Esse é o meu painel de ajuda, abaixo está a lista de todos os meus comandos! Atualmente tenho ${cmdSize} comandos disponíveis .\nLembre-se, meu prefixo nesse servidor é \`o\`!`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFields(Fields)

        client.sendReply(message, {
            embeds: [Embed],
            content: message.author.toString()
        })
    }
}