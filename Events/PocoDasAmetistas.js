const Discord = require('discord.js')
const { EmbedBuilder, MessageCollector } = Discord;
const ms = require('ms');

const words = ['CAVAR', 'ESCAVAR', 'PEGAR', 'PARTICIPAR', 'AMETISTA', 'STEPHANIE', 'DISCORD', 'GANHEI', 'SOCORRO', 'DESEJOS'];
const winnerLimitPerChannel = 3;
const intervalMinutes = 1000;
const timeToRespond = ms('30s');

const inflaçao = { min: 100_000, max: 1_000_000 };

const nextTime = () => ms(`${intervalMinutes - new Date().getMinutes() % intervalMinutes}m`);
const getRandomWord = () => words[~~(Math.random() * words.length)];
const getRandomMoney = () => Math.floor(Math.random() * (inflaçao.max - inflaçao.min)) + inflaçao.min;

module.exports = {
    name: 'ready',
    /** @param {import('../Base/client')} client */
    execute: async (client) => {
        // setTimeout(() => setupDesejos(), nextTime());

        // async function setupDesejos() {
        //     // Recarregando
        //     setTimeout(() => setupDesejos(), nextTime());

        //     // Se estiver desativado
        //     const status = await client.mysql.getStephanieStatus();
        //     if (status.maintenance) return;

        //     // Buscando canais
        //     const PoçoChannels = client.config.channels.channel_event_send_1hour

        //     const wordChannels = [];

        //     for (const channelId of PoçoChannels) {
        //         /** @type {{ channel: string, word: string, users: Discord.User[], rejectedUsers: Discord.User[] }[]}} */

        //         const channel = await client.channels.fetch(channelId).catch(() => null);
        //         if (!channel) continue;

        //         if (!wordChannels.find(f => f.channel === channel.id)) wordChannels.push({
        //             channel: channel.id,
        //             word: getRandomWord(),
        //             users: [],
        //             rejectedUsers: [],
        //         });

        //         const channelData = wordChannels.find(f => f.channel === channelId);

        //         const embedRes = new EmbedBuilder()

        //             .setTitle(`POÇO DE AMETISTAS`)
        //             .setDescription(`Um poço cheio de ametistas foi encontrado, para resgatar o Poço cheio de Ametistas basta digitar a Palavra abaixo\n**${channelData.word}\`**`)
        //             .setThumbnail(channel.guild.iconURL({ format: 'png', dynamic: true }))
        //             .setColor(client.config.colors.default)
        //             .setFooter({ text: 'Poço das Ametistas', iconURL: channel.guild.iconURL() })
        //             .setTimestamp();

        //         const msg = await channel.send({
        //             embeds: [embedRes],
        //         }).catch(() => null);

        //         const collector = new MessageCollector(channel, {
        //             filter: f => f.content.toLowerCase() === channelData.word.toLowerCase(), time: timeToRespond
        //         })

        //         collector.on('collect', (message) => {
        //             if (channelData.users.some(s => s.id === message.author.id)) return;
        //             if (message.author.bot) return;

        //             channelData.users.push(message.author);

        //         });

        //         collector.on('end', async (undefined, reason) => {
        //             if (reason !== 'time') return msg?.delete().catch(() => null);
        //             if (!channelData.users?.length) return msg.delete().catch(() => null);
        //             const prize = getRandomMoney();

        //             let users = [];

        //             while (users.length < 3) {
        //                 const numeroAleatorio = Math.floor(Math.random() * channelData.users.length);
        //                 const usuarioAleatorio = channelData.users[numeroAleatorio].id;

        //                 if (!users.includes(usuarioAleatorio)) {
        //                     users.push(usuarioAleatorio);
        //                 }
        //             }
        //             for (const user_id of users) {
        //                 client.mysql.updateUserMoney(user_id, prize);

        //                 client.mysql.createNewTransaction({
        //                     source: 9,
        //                     given_at: Date.now(),
        //                     received_by: user_id,
        //                     amount: prize,
        //                 });
        //             }

        //             await msg.channel.send({ content: `:tada: **Ganhadores** | Poço das ametistas | **${client.config.emojis.money} ${client.util.AbbreviateNumber(prize)} Ametistas**\n${users.map(m => `<:ametista_1:1099854127045025823> | ${m}`).join('\n')}` });
        //         });
        //     }
        // }
    }
}