const { relativeTime, unabbreviate } = require('util-stunks');
const moment = require('moment');
const ms = require('ms');
const { Op, Sequelize } = require('sequelize');

const intervalMinutes = 15;
const nextTime = () => ms(`${intervalMinutes - new Date().getMinutes() % intervalMinutes}m`);

module.exports = {
    name: 'rifa',
    aliases: ['raffle'],
    description: 'Veja informações da rifa atual ou compre algum bilhete da rifa.',
    cooldown: 1600,
    usage: '[comprar] [quantidade]',
    /**
     * @param {import('../../Base/client')} client
     * @param {import('discord.js').Message} message
     * @param {string[]} args  
     */
    run: async (client, message, args) => {
        const Data = await client.mysql.getRaffleData();
        const EndTime = (Data.endsIn < Date.now()) ? Date.now() + nextTime() : Data.endsIn;
        
        // Se for comprar
        if (['buy', 'comprar'].includes(args[0])) {
            // Buscando dados do usuário
            const UserData = await client.mysql.findUser(message.author.id, true)
            const Amount = Math.floor(unabbreviate(args[1]))
            const Value = Amount * 500;
            
            // Verificações
            if (isNaN(Amount) || Amount < 1 || Amount > 500_000) return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, digite uma quantidade de bilhetes válidas para comprar, acima de **1** e abaixo de **500.000**.`
            });
            
            if (Value > UserData.money) return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, você precisa de mais **${client.util.AbbreviateNumber(Value - UserData.money)} Flocos** para comprar essa quantidade de bilhetes.`
            });

            if (500_000 < (UserData.tickets + Amount) || 500_000 < (UserData.tickets + Amount)) return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, você só pode comprar no minimo **1** e no máximo **500.000** bilhetes por rifa, e atualmente você já comprou **${UserData.tickets.toString()}** rifas.`
            })

            // Adicionando usuário na rifa
            await client.mysql.updateUser(message.author.id, {
                tickets: Amount + UserData.tickets
            });

            await client.mysql.updateUserMoney(message.author.id, -Value)
            await client.mysql.transactions.create({
                source: 6,
                given_by: message.author.id,
                given_by_tag: message.author.tag,
                given_at: Date.now(),
                amount: -Value,
            })

            client.sendReply(message, {
                content: `${message.author}, você comprou **${Amount.toLocaleString()} Bilhetes** por **${client.config.emojis.money} ${Value.toLocaleString()} Ametistas**, o resultado dessa rifa irá sair em **${relativeTime(EndTime, { display: 2 })}**`
            });
        } 
        // Se for ver status da rifa
        else {
            let LastWinner;
            if(Data.lastWinnerId != null) LastWinner = await client.users.fetch(Data.lastWinnerId);
                
            const TicketsData = await client.mysql.getTicketsData();

            client.sendReply(message, {
                content: `💫 ${client.config.text.separator3} ${message.author} **RIFA**\n💵 ${client.config.text.separator3} Prêmio atual: **${client.config.emojis.money} ${TicketsData.prize_count.toLocaleString()} Flocos**` + 
                    `\n🎟️ ${client.config.text.separator3} Bilhetes comprados: **${TicketsData.tickets_count.toLocaleString()}**\n👥 ${client.config.text.separator3} Usuários participando: **${TicketsData.users_count.toLocaleString()}**` + 
                    `\n🎁 ${client.config.text.separator3} Último vencedor: ${LastWinner ? `\`${LastWinner.tag} (${LastWinner.id})\` **(${Data.lastWinnerValue.toLocaleString()} Flocos)**` : '**Não Encontrado**'} ` + 
                    `\n⏰ ${client.config.text.separator3} Resultado será divulgado em: **${relativeTime(EndTime, { display: 2 })}**\n💲 ${client.config.text.separator3} Para participar, compre um bilhete por **500 Flocos** utilizando **${client.prefix}rifa buy**!`
            })
        }
    }
}