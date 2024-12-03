const { abbreviate, unabbreviate } = require('util-stunks');
const { Op } = require('sequelize');
const moment = require('moment');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
moment.locale('pt-br')

module.exports = {
    name: 'transações',
    aliases: ['tr', 'transactions'],
    description: 'Verifique suas tranasações ou as de outro usuário.',
    cooldown: 2500,
    usage: '[página] | [usuário] [página]',
    run: async (client, message, args) => {        
        // Ajustando página e usuário
        let Page, User;

        if (args[0]) {
            if (args[0].length >= 16) User = await client.util.FindUser(args[0].replace(/[<!@>]+/g, ''), client, message, true);

            else {
                User = message.author;
                Page = checkPage(args[0]);
            }

            if (args[1]) Page = checkPage(args[1]);
            else Page = checkPage();
        }

        else {
            User = message.author;
            Page = checkPage();
        }

        // Buscando páginas
        let Transactions = [], TransactionInPage = [];
        const TransactionsPerPage = 10;

        const Data = await client.mysql.transactions.findAll({
            where: {
                [Op.or]: {
                    received_by: User.id,
                    given_by: User.id
                }
            },
            order: [['given_at', 'DESC']],
        }).then(x => x.map(y => y.dataValues))

        // Ajustando textos
        for (let i of Data) 
            Transactions.push(transformTransactionToText(i, User))

        const MaxPages = Math.ceil(Transactions.length / TransactionsPerPage);

        Transactions.forEach((text, index) => {
            if (index % TransactionsPerPage === 0) TransactionInPage.push([]);
            TransactionInPage[TransactionInPage.length - 1].push(text);
        });

        // Configurando resposta
        const Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Secondary),
                    
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Secondary)
            );

        if (Page <= 0) Page = MaxPages;
        if (Page > MaxPages) Page = MaxPages;

        const Embed = new EmbedBuilder()
            .setTitle(`Transações de ${User.username} - (${Page}/${MaxPages})`)
            .setDescription(TransactionInPage[Page - 1].join('\n') || 'Nenhuma transação')
            .setColor(client.config.colors.default)
            .setFooter({
                text: `Total de ${Transactions.length.toLocaleString()} transações - ` + message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()

        const Message = await client.sendReply(message, {
            content: message.author.toString(),
            embeds: [Embed],
            components: [Row]
        });

        // Coletando clicks
        let Filter = interaction => interaction.user.id == message.author.id;
        let Collector = Message.createMessageComponentCollector({
            Filter,
            time: 5 * 60 * 1000,
        });

        Collector.on('collect', async (i) => {
            await i.deferUpdate().catch(() => null)
            const { customId: id } = i;

            // Atualizando página
            if (id === 'back') Page--;
            else Page++;

            if (Page <= 0) Page = MaxPages;
            if (Page > MaxPages) Page = 1;

            // Enviando resposta
            let Embed = Message.embeds[0].data
            Embed.title = `Transações de ${User.username} - (${Page}/${(MaxPages)})`
            Embed.description = TransactionInPage[Page - 1].join('\n') || 'Nenhuma Transação aqui!'

            Message.edit({
                embeds: Message.embeds,
            })
        })
    }
}

function checkPage(Page) {
    if (!Page) return 1;
    if (Page > 1000 || Page < 1 || isNaN(parseInt(Page))) Page = 1;

    return Page;
}

function transformTransactionToText(Data, User) {
    if (Data.source === 1) 
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos na recompensa diária`
    
    else if (Data.source === 2) 
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos na recompensa semanal`

    else if (Data.source === 3)
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.received_by === User.id ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos ${Data.received_by === User.id ? 'de' : 'para'} \`${Data.received_by == User.id ? Data.given_by_tag : Data.received_by_tag}\` \`(${Data.received_by == User.id ? Data.given_by : Data.received_by})\``

    else if (Data.source === 4) 
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.received_by === User.id ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos apostando com \`${Data.received_by == User.id ? Data.given_by_tag : Data.received_by_tag}\` \`(${Data.received_by == User.id ? Data.given_by : Data.received_by})\``

    else if (Data.source === 5)
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString().replace('-', '')} Flocos ${Data.amount > 0 ? 'na' : 'para'} race `

    else if (Data.source === 6)
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.received_by === User.id ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString().replace('-', '')} Flocos ${Data.given_by === User.id ? 'para' : 'da'} rifa`

    else if (Data.source === 7)
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos trabalhando`

    else if (Data.source === 8) 
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.received_by === User.id ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos ${Data.received_by === User.id ? 'de' : 'para'} um patrocínio${Data.given_by == User.id ? '' : ` por \`${Data.given_by_tag}\` \`(${Data.given_by})\``}`

    else if (Data.source === 9) 
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos ${Data.amount > 0 ? 'do' : 'para o'} Poço`;
    else if (Data.source === 10) 
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos ${Data.amount > 0 ? 'do' : 'para o'} Compra no Shop`;
    else if (Data.source === 11)
        return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos ${Data.amount > 0 ? 'do' : 'para o'} Resgate de giftcard`;
    
    else return `\`${getDateWithoutTime(Data.given_at)}\` ${Data.amount > 0 ? ':coin: Recebeu' : ':coin: Enviou'} ${Data.amount.toLocaleString()} Flocos de uma transação desconhecida`
}

function getDateWithoutTime(Date) {
    return `[${moment(Date).format('LL')} ${moment(Date).format('LTS')}]`;
}