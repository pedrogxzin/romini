const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js')
const { abbreviate } = require('util-stunks')

const { createCanvas, loadImage, registerFont } = require("canvas")
const { fillTextWithTwemoji } = require("node-canvas-with-twemoji-and-discord-emoji")

registerFont('./Base/Fonts/font.ttf', { family: 'Frutiger' })
module.exports = {
    name: 'atm',
    aliases: ['atm', 'bal', 'moedas'],
    description: 'Verifique seu saldo atual de moedas ou o de outro usuário.',
    cooldown: 1500,
    usage: '[usuário]',
    run: async (client, message, args) => {
        const User = await client.util.FindUser(args[0], client, message, true)
        const Data = await client.mysql.findUser(User.id, true)
        const UserLeadeboard = await client.mysql.users.findAll({
            order: [['money', 'DESC']],
            attributes: ['id', 'money']
        }).then(x => x.map(y => y.dataValues))
        const Position = parseInt(UserLeadeboard.findIndex(x => x.id === User.id) + 1)

        const CompactNumber = Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(Data.money);

        client.sendReply(message, {
            content: `${message.author} ${User.id == message.author.id ? 'Você' : User.toString()} possui **${Data.money.toLocaleString()} Flocos** \`(${CompactNumber})\`! Você está em **#${Position} lugar** no ranking! veja outros ostentadores em otop`
        })

        // try {
        //     const user = await client.util.FindUser(args[0], client, message, true)
        //     const data = await client.mysql.findUser(user.id, true)
        //     const layout = await loadImage("./Base/Images/atm.png");

        //     let image = createCanvas(1280, 640),
        //         ctx = image.getContext("2d")

        //     ctx.fillStyle = data.color || '#FFFFFF';

        //     class Atm {
        //         constructor(user) {
        //             this.user = user;
        //         }

        //         async drawAvatar() {
        //             let avatarCanvas = createCanvas(345, 345);
        //             let avatarCtx = avatarCanvas.getContext("2d");
        //             let userImage = await loadImage(this.user.displayAvatarURL({ size: 2048, extension: 'png' }).replace('.gif', '.png').replace('a_', ''));

        //             avatarCtx.beginPath();
        //             avatarCtx.arc(170, 170, 170, 0, Math.PI * 2, true);
        //             avatarCtx.closePath();
        //             avatarCtx.clip();
        //             avatarCtx.drawImage(userImage, 0, 0, 345, 345);
        //             ctx.drawImage(avatarCanvas, 59, 154);
        //         }

        //         async drawMoney() {
        //             ctx.font = '36px Frutiger'
        //             ctx.fillText(`${Number(data.money).toLocaleString()} (${abbreviate(Number(data.money) , { display: 1 })}) Ametistas`, 580, 414)
        //         }

        //         async drawUsername() {
        //             ctx.font = '45px Frutiger'
        //             ctx.textAlign = 'center'
        //             await fillTextWithTwemoji(ctx, this.user.username, 830, 234);
        //         }
        //     }

        //     ctx.drawImage(layout, 0, 0);

        //     const pr = new Atm(user)

        //     await pr.drawAvatar();
        //     await pr.drawMoney();
        //     await pr.drawUsername();

        //     let attach = new AttachmentBuilder(image.toBuffer(), 'atm.png')

        //     message.reply({
        //         files: [attach],
        //         content: message.author.toString()
        //     })
        // } catch (err) {
        //     console.log(err)
        //     message.reply({
        //         content: `❌ ${message.author.toString()}, ocorreu um erro, tente novamente mais tarde!`
        //     })
        // }
    }
}