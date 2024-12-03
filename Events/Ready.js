const { red: ConsoleColorRed, blue: ConsoleColorBlue, yellow: ConsoleColorYellow, green: ConsoleColorGreen } = require('chalk');
const { ActivityType, EmbedBuilder } = require('discord.js');
const { Op, Sequelize } = require('sequelize')
const cron = require('node-cron');
const ms = require('ms');
const { abbreviate } = require('util-stunks');

const intervalMinutes = 10;
const nextTime = () => ms(`${intervalMinutes - new Date().getMinutes() % intervalMinutes}m`);

module.exports = {
    name: 'ready',
    /** @param {import('../Base/client')} client */
    execute: async (client) => {

        setInterval(async() => {
            const Data = await client.mysql.getRaffleData();
            const raffleWinner = Data.lastWinnerId ? (await client.users.fetch(Data.lastWinnerId))?.user.username : "Não houve"
            client.user.setPresence({
                activities: [{ name: `Drops no meu servidor!`, type: ActivityType.Playing }], status: 'online'
            })
            setTimeout(() => {
                client.user.setPresence({
                    activities: [{ name: `Se torne vip entrando no meu servidor!`, type: ActivityType.Playing }], status: 'online'
                })
            }, 15_000)
        }, 30_000)

        console.log(ConsoleColorGreen('[APLICAÇÃO] ') + 'Aplicação carregada! (' + client.user.tag + ')')

        console.log(ConsoleColorGreen('[APLICAÇÃO] ') + 'Aplicação carregada! (' + client.user.tag + ')')
        console.log(ConsoleColorBlue('[EVENTOS] ') + 'Rifa carregada!')

        // return console.log(await client.mysql.getTicketsData(), (await client.mysql.getStephanieStatus()).maintenance);
        setTimeout(() => setupRaffle(), nextTime());
        async function setupRaffle() {
            // Recarregando próximo sorteio
            setTimeout(() => setupRaffle(), nextTime())

            // Vendo status de manuntenção
            if ((await client.mysql.getStephanieStatus()).maintenance) return;
            
            // Buscando dados do sorteio
            const ticketsData = await client.mysql.getTicketsData();

            // Sorteando usuário
            let users = [];
            
            for (const user of ticketsData.users)
                for (let i = 0; i < user.tickets; i++) 
                    users.push(user.user);
                

            if (!users.length) return startNewRaffle();
            const Winner = await client.users.fetch(users[Math.floor(Math.random() * users.length)])
            
            // Adicionando prêmio
            await addPrize(ticketsData.prize_count);

            // ? SubFunctions 
            async function addPrize(value) {
                // Adicionando dinheiro
                await client.mysql.updateUserMoney(Winner.id, value);

                await client.mysql.transactions.create({
                    source: 6,
                    received_by: Winner.id,
                    given_at: Date.now(),
                    amount: value
                });

                // Ajustando resposta do vencedor
                const WinnerData = await client.mysql.findUser(Winner.id, true);
                const Embed = new EmbedBuilder()
                .setTitle(`🎫 Rifa Premiada!`)
                .setDescription(`${Winner}, Parabéns! Você ganhou a rifa, que sorte hein...! Abaixo estão algumas informações sobre sua vitória nessa rifa.`)
                .setFields([
                    {
                        name: '🎫 Tickets Comprados',
                        value: `Dos ${ticketsData.tickets_count.toLocaleString()} Bilhetes comprados, **${WinnerData.tickets.toLocaleString()}** deles foram seus.`,
                        inline: true
                    },
                    {
                        name: '🍀 Sorte',
                        value: `Sua sorte foi de \`${client.util.Percentage(WinnerData.tickets, ticketsData.tickets_count, 2)}\`!`,
                        inline: true
                    },
                    {
                        name: `${client.config.emojis.money} Valor Ganho`,
                        value: `+ ${client.config.emojis.money} **<:ametista11:1220558109408235702> ${client.util.AbbreviateNumber(ticketsData.prize_count)} Ametistas**.`,
                    }
                ])
                .setColor(client.config.colors.default)                
                .setFooter({ text: Winner.tag, iconURL: Winner.displayAvatarURL() })
                .setTimestamp()

                await client.channels.cache.get("1204575880060469298").send({
                    content: `${Winner}, **sua sorte chegou**!`,
                    embeds: [Embed]
                }).catch(e => { null })

                // Começando nova rifa
                startNewRaffle(Winner.id, ticketsData.prize_count);

                // Enviando respota no log
                const channel = client.channels.cache.get('1236462170846396558') || client.channels.cache.get('1236462170846396558')
                channel?.send(`${Winner.tag} \`(${Winner.id})\` ganhou uma rifa de ${client.config.emojis.money} **${ticketsData.prize_count.toLocaleString()} Estrelas** de ${ticketsData.tickets_count.toLocaleString()} Tickets comprados, onde **${WinnerData.tickets.toLocaleString()}** foram dele(a). A sorte foi de \`${client.util.Percentage(WinnerData.tickets, ticketsData.tickets_count, 2)}\``).catch(() => null);
            }

            async function startNewRaffle(lastWinnerId = null, lastWinnerValue = 0) {
                console.log('começando nova rifa:');
                // Apagando rifas de usuários
                await client.mysql.updateRaffleData({
                    lastWinnerId,
                    lastWinnerValue,
                    endsIn: (Date.now() + nextTime())
                });

                // Apagando rifas
                await client.mysql.users.update({ tickets: 0 }, { where: {} })
                console.log(await client.mysql.getTicketsData());
            }
        }
    }
}