const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionCollector } = require('discord.js');
const { unabbreviate } = require('util-stunks');
const abbreviate = require('util-stunks');

module.exports = {
    name: 'patrocinar',
    aliases: ['pt'],
    description: 'Patrocine Dollars em um servidor.',
    cooldown: 1500,
    usage: '<quantidade>',
    run: async (client, message, args) => {
        // Configurando valor enviado
        const Value = Math.floor(unabbreviate(args[0]));

        if (isNaN(Value) || Value < 10 || Value > 100_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor de **10 Flocos** ou mais para enviar.`
        })

        if ((await userHasMoney(message.author.id, Value)) === false) return;

        // Verificando daily
        const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)
        if (Cooldowns.daily < Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, você não pode criar um patrocínio pois ainda não coletou sua recompensa diária, use o comando \`odaily\` para coletar.`
        })
        
        // Alertando
        const Embed = new EmbedBuilder()
        .setTitle('Patrocinar Flocos')
        .setDescription(` ${message.author}, ao patrocinar Flocos, você deve estar ciente de que você terá total responsabilidade pelos Flocos patrocinados e o valor não será devolvido pela Equipe do Opalla.\n\n **${message.author}, deseja patrocinar ${client.config.emojis.money} ${Value.toLocaleString('pt')} Flocos neste canal?**`)

        .setColor(client.config.colors.default)

        .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })

        .setTimestamp();
		
        const ConfirmButtons = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setLabel('Patrocinar')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
                .setCustomId('sponsor-success'),

            new ButtonBuilder()
                .setLabel('Cancelar')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('sponsor-danger'),
        );

        const reply = await client.sendReply(message, {
            content: message.author.toString(),
            embeds: [Embed],
            components: [ConfirmButtons],
        })

        // Coletando "sim" ou "não"
        const replyCollector = new InteractionCollector(client, { filter: f => f.user.id === message.author.id, message: reply, time: 60_000, max: 1 });

        const messageCancel = {
            content: `${client.config.emojis.error} ${message.author}, o patrocício do Flocos foi cancelado.`,
            embeds: [],
            components: [],
        };

        replyCollector.on('collect', async button => {
            if (button.customId === 'sponsor-danger') return button.update(messageCancel);
            if (button.customId !== 'sponsor-success') return;

            // Verificando money
            if ((await userHasMoney(message.author.id, Value)) === false) {
                reply.edit({
                    content: `${client.config.emojis.error} ${message.author}, patrocínio cancelado`,
                    components: [],
                }).catch(() => null);
                return replyCollector.stop();
            }

            // Começando o patrocínio
            reply.delete().catch(() => null);
            replyCollector.stop();
            return startSponsor();
        });

        replyCollector.on('end', (undefined, reason) => {
            if (reason === 'time') return reply.edit(messageCancel).catch(() => null);
        });

        async function startSponsor() {
            // Detalhes da mensagem do patrocínio
            const Embed = new EmbedBuilder()
                .setTitle(`**🎉 Patrocínio**`)
                .setDescription(`Para ter a chance de ganhar, clique no botão abaixo.`)
                .setFields([
					{
                    name: 'Participantes:',
                    value: 'Nenhum ainda',
                    inline: true,
                },
					{
					name: 'Patrocinador',
					value: `${message.author}`,
					},
					{
					name: 'Valor',
					value: `**${Value.toLocaleString('pt')}** Flocos`,
					},
                {
                    name: '⏰ Tempo Restante:',
                    value: `<t:${parseInt((Date.now() + require('ms')('1m')) / 1000)}:R>`,
                    inline: true,
                }
            ])
                .setColor(client.config.colors.default)
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            const JoinButton = new ActionRowBuilder().setComponents(
                new ButtonBuilder()
                    .setLabel('Entradas')
                    .setCustomId('sponsor-join')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Primary));
                    
            const giveawayReply = await client.sendReply(message, {
                embeds: [Embed],
                components: [JoinButton],
            });

            // Criando coletor
            const users = [];
            const collector = new InteractionCollector(client, { message: giveawayReply, time: 60_000 })

            collector.on('collect', async button => {
                // Verificações
                if (users.includes(button.user.id) || button.user.id === message.author.id) return button.reply({
                    content: `${client.config.emojis.error} ${button.user}, você já está participando do patrocínio.`,
                    ephemeral: true,
                    allowedMentions: { parse: [] },
                });

                const Cooldowns = await client.mysql.getCooldowns(button.user.id, true);
                if (Cooldowns.daily < Date.now()) return button.reply({
                    content: `${client.config.emojis.clock} ${button.user}, você não pode participar de um patrocínio pois ainda não coletou sua recompensa diária, use o comando \`odaily\` para coletar.`,
                    ephemeral: true,
                    allowedMentions: { parse: [] },
                });

                // Atualizando embed
                users.push(button.user.id);

                const EditedEmbed = button.message.embeds[0].data;
                EditedEmbed.fields[0].value = (`${users.length}`);
                const EditedButton = button.message.components[0].components[0].data;
                EditedButton.label = `Entradas (${users.length})`;
                const EditedRow = new ActionRowBuilder().setComponents(new ButtonBuilder(EditedButton));

                button.update({ embeds: [EditedEmbed], components: [EditedRow] }).catch(console.log);
            });

            collector.on('end', async (undefined, reason) => {
                if (reason !== 'time') {
                    return giveawayReply.edit({
                        content: `${client.config.emojis.error} ${message.author}, patrocínio cancelado`,
                        components: [],
                    }).catch(() => null);
                }

                if (!users.length){
                    giveawayReply.edit({
                        content: `${client.config.emojis.error} ${message.author}, patrocínio cancelado`,
                        components: [],
                    }).catch(() => null);

                    return client.sendReply(giveawayReply, {
                        content: `${client.config.emojis.error} ${message.author}, infelizmente não houve participantes no patrocínio... nesse caso, eu posso ficar com as Estrelas??`,
                    })
                }
                
                // Verificando usuário
                let reasonError = '';
                const prizeUserId = users[Math.floor(Math.random() * users.length)];
                const prizeUser = await message.guild.members.fetch(prizeUserId).catch(() => { reasonError = 'não foi encontrado no servidor.' });
                
                const UserData = await client.mysql.findUser(prizeUserId, true);
                if (UserData?.ban_is) reasonError = 'está banido de usar meus comandos.';

                // Retornos
                if ((await userHasMoney(message.author.id, Value)) == false) return giveawayReply.edit({
                    content: `${client.config.emojis.error} ${message.author}, patrocínio cancelado`,
                    components: [],
                }).catch(() => null);

                if (reasonError) return client.sendReply(giveawayReply, {
                    content: `${client.config.emojis.error} ${message.author}, o usuário prêmiado <@${prizeUserId}> não pôde receber o prêmio pois ${reasonError}`,
                })
                
                // Alternando valores 
                await client.mysql.updateUserMoney(message.author.id, -Value);
                await client.mysql.updateUserMoney(prizeUser.id, Value);

                await client.mysql.transactions.create({
                    source: 8,
                    received_by: prizeUser.id,
                    given_by: message.author.id,
                    given_by_tag: message.author.tag,
                    received_by_tag: prizeUser.user.tag,
                    given_at: Date.now(),
                    amount: Value,
                });

                const EditedEmbed = giveawayReply.embeds[0].data;
                EditedEmbed.fields[2] = { name: 'Ganhador(a)', value: `:star: ${prizeUser}` }

                giveawayReply.edit({ embeds: [EditedEmbed], components: [] });
                client.sendReply(giveawayReply, {
                    content: `🎉 ${prizeUser}, parabéns! Você ganhou **${client.config.emojis.money} ${Value.toLocaleString('pt')} Flocos** desse patrocínio.`,
                });
            })
        }

        async function userHasMoney(UserId, valueToCompare) {
            const AuthorData = await client.mysql.findUser(UserId, true)
        
            if (AuthorData.money < valueToCompare) {
                client.sendReply(message, {
                    content: `${client.config.emojis.error} ${message.author}, como patrocinador, você não possui essa quantidade de Flocos.`
                })
                return false;
            }
            return true;
        }
    }
}