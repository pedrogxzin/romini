const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, InteractionCollector } = require('discord.js');

module.exports = {
    name: 'lock',
    aliases: ['trancar', 'bloquear', 'unlock'],
    description: 'Tranca ou destranca um canal.',
    cooldown: 1900,
    usage: '<canal>',
    run: async (client, message, args) => {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        if (!channel) {
            return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, por favor mencione um canal válido para trancar ou destrancar.`
            });
        }

        // Verifica se o membro tem a permissão de gerenciar canais
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, você precisa da permissão **Gerenciar Canais** para usar esse comando.`
            });
        }

        // Verifica se o canal está trancado ou destrancado
        const isLocked = channel.permissionOverwrites.cache.some(
            (overwrite) => overwrite.id === message.guild.roles.everyone.id && overwrite.deny.has(PermissionsBitField.Flags.SendMessages)
        );

        const action = isLocked ? 'destrancar' : 'trancar';

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel(`Confirmar (${action})`)
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
            );

        const msg = await client.sendReply(message, {
            content: `${message.author.toString()}, você está prestes a ${action} o canal ${channel.toString()}. Para confirmar, clique em ✅. Para cancelar, clique em ❌.`,
            components: [row]
        });

        const collector = new InteractionCollector(client, {
            message: msg,
            time: 5 * 60 * 1000,
            filter: (interaction) => interaction.user.id === message.author.id
        });

        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.customId === 'confirm') {
                if (action === 'trancar') {
                    await channel.permissionOverwrites.edit(message.guild.roles.everyone.id, { SendMessages: false });
                    await client.sendReply(msg, {
                        content: `${channel.toString()} foi **trancado** com sucesso.`
                    });
                } else {
                    await channel.permissionOverwrites.edit(message.guild.roles.everyone.id, { SendMessages: true });
                    await client.sendReply(msg, {
                        content: `${channel.toString()} foi **destrancado** com sucesso.`
                    });
                }

                // Desativa os botões após a ação ser confirmada
                row.components.forEach(component => component.setDisabled(true));
                await msg.edit({ components: [row] });
                collector.stop();
            } else if (interaction.customId === 'cancel') {
                // Desativa os botões e altera o rótulo do botão de cancelar
                row.components.forEach(component => component.setDisabled(true));
                row.components[1].setLabel('Cancelado');
                await msg.edit({ components: [row] });
                await client.sendReply(msg, {
                    content: `Ação cancelada por ${message.author.toString()}.`
                });
                collector.stop();
            }
        });

        collector.on('end', async () => {
            // Desativa os botões quando o tempo expira
            if (!msg.deleted) {
                row.components.forEach(component => component.setDisabled(true));
                await msg.edit({ components: [row] });
            }
        });
    }
};