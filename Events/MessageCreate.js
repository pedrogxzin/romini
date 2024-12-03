const moment = require('moment');
const { relativeTime } = require('util-stunks');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, PermissionFlagsBits } = require("discord.js")

moment.locale('pt-br');

module.exports = {
    name: 'messageCreate',
    /** @param {import('../Base/client.js')} client */
    execute: async (client, message) => {
        // Retornos
        if (message.author?.bot || message.channel?.type == "DM") return;
        if ([`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(message.content)) return message.reply(`${client.config.emojis.money} ${message.author}, **Olá**! Eu sou o **${client.user.username}**, meu prefixo atual nesse servidor é \`${client.prefix}\`, use o comando \`${client.prefix}ajuda\` para obter mais ajuda.`);
        if (!message.content?.toLowerCase().startsWith(client.prefix.toLowerCase())) return;

        // Ajustando conteúdo da mensagem
        let args = message?.content.slice(client.prefix.length).trim().split(/ +/g);
        let cmd = args.shift().toLowerCase();
        if (!cmd.length) return;

        // Buscando comando
        let command = client.commands.has(cmd) ? client.commands.get(cmd) : client.commands.get(client.aliases.get(cmd));
        if (!command) return;
        if(command.isDevCommand && !message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        // Verificando status
        const status = await client.mysql.getStephanieStatus();
        if (status.maintenance && !client.util.IsDeveloper(message.author.id) && !client.util.IsModerator(message.author.id)) {
            const reasonText = status.reason || 'Nova Atualização';

            // return client.sendReply(message, {
            //     content: `( <:mod:1150494616605429970> ) Meu sistema foi **temporariamente** desligado pelos Meus **administradores** para \`${reasonText}\`. Volte novamente mais Tarde.`,
            // });
        }

        // Esperar 10 dias para usar o bot
        if ((Date.now() - message.author.createdTimestamp) <= 864000000)
            return client.sendReply(message, { content: `${client.config.emojis.error} ${message.author}, você precisa estar no Discord a mais de **10** dias para poder utilizar meus comandos.` });

        // Verificando Cooldown
        let CommandCooldown;
        if (!client.util.IsDeveloper(message.author.id)) CommandCooldown = await commandCooldown(client, message);
        if (CommandCooldown) return client.sendReply(message, { content: CommandCooldown });

        // Verificando banimento
        let userData = await client.mysql.findUser(message.author.id, true);
        if (userData.ban_is == true)
            return client.sendReply(message, { content: `${client.config.emojis.error} ${message.author}, você está banido(a) por \`${userData.ban_reason}\` e por isso não pode usar meus comandos! *(banido(a) em ${moment(userData.ban_date).format('LLLL')} \`(há ${relativeTime(userData.ban_date, { removeMs: true, displayAtMax: 2 }) ? relativeTime(userData.ban_date, { removeMs: true, displayAtMax: 2 }) : 'alguns milissegundos'})\`)*` });

        // verificando vip
        if (command.premium && userData.premium < Date.now()) {
            const InviteButton = new ActionRowBuilder().setComponents(
                new ButtonBuilder()
                    .setLabel('Entrar no Servidor')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/gtJcmHWkju'));

            const Embed = new EmbedBuilder()
                .setTitle('Comando Premium')
                .setDescription(`${client.config.emojis.error} ${message.author}, você encontrou um **Comando Premium**, porém você não possui vip. \nEntre no meu servidor oficial para saber como desbloquear este comando!`)
                .setColor(client.config.colors.default)
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return client.sendReply(message, {
                content: message.author.toString(),
                embeds: [Embed],
                components: [InviteButton],
            })
        }

        // Edicionando xp
        await client.mysql.addUserExp(message.author.id, genNumber(10, 80))

        // Executando comando
        try {
            console.log(`${command.name} - ${message.author.username} (${message.author.id}) - ${message.guild.name} (${message.guild.id})`);
            await command.run(client, message, args);
        }
        catch (e) {
            console.error('An error has occurred ', e);
        }
    },
};

function genNumber(min, max) {
    let amount = Math.floor(Math.random() * (max - min)) + min
    return amount;
}

async function commandCooldown(client, message) {
    const cooldown = client.cooldown.get(message.author.id);

    if (cooldown?.command?.time >= Date.now()) {
        client.cooldown.set(message.author.id, {
            command: {
                warns: cooldown?.command?.warns ? cooldown?.command?.warns + 1 : 1,
                time: cooldown?.command?.warns > 0 ? cooldown?.command?.time + 5_000 : cooldown?.command?.time,
            },
        });

        if (cooldown?.command?.warns >= 10) {
            await client.mysql.updateUserBan(
                message.author.id,
                true,
                Date.now(),
                'Banido por enviar comandos rápido demais em um curto período de tempo. (Você pode pedir para retirar a punição em até 24 horas após o banimento.)'
            );
            await client.channels.cache
                .get('1236470178213265509')
                .send(
                    `${client.user.tag} \`(${client.user.id})\` baniu ${message.author.tag} (${message.author.id}) com a razão \Banido por enviar comandos rápido demais em um curto período de tempo. (Você pode pedir para retirar a punição em até 24 horas após o banimento.)'\``
                );

            client.cooldown.set(message.author.id, {
                command: {
                    warns: 0,
                    time: Date.now(),
                },
            });
        } else {
            const left = relativeTime(cooldown?.command?.time, { removeMs: true, displayAtMax: 1 });
            const warn = cooldown?.command?.warns;

            return `${client.config.emojis.error} ${message.author}, aguarde \**${left ? left : 'alguns milissegundos'}\** antes de usar outro comando. \`(${warn + 1}/10)\``;
        }
    } else if (Math.floor(Math.random() * 100) < 65) {
        client.cooldown.set(message.author.id, { command: { warns: 0, time: Date.now() + 4_000 } });
    }
    return false;
}

