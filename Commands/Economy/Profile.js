const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js')
const { abbreviate } = require('util-stunks')

const { createCanvas, loadImage, registerFont } = require("canvas")
const { fillTextWithTwemoji } = require("node-canvas-with-twemoji-and-discord-emoji")

registerFont('./Base/Fonts/font.ttf', { family: 'Frutiger' })

module.exports = {
    name: 'perfil',
    aliases: ['profile'],
    description: 'Veja o seu perfil ou o de outro usuário.',
    cooldown: 2500,
    usage: '[usuário]',
    run: async (client, message, args) => {
        try {
            const user = await client.util.FindUser(args[0], client, message, true)
            const data = await client.mysql.findUser(user.id, true)
            const layout = await loadImage("./Base/Images/profile.png");

            let image = createCanvas(1280, 960),
                ctx = image.getContext("2d")

            ctx.fillStyle = data.color || '#FFFFFF';

            class Profile {
                constructor(user) {
                    this.user = user;
                }

                async drawAvatar() {
                    let avatarCanvas = createCanvas(345, 345);
                    let avatarCtx = avatarCanvas.getContext("2d");
                    let userImage = await loadImage(this.user.displayAvatarURL({ size: 2048, extension: 'png' }).replace('.gif', '.png').replace('a_', ''));

                    avatarCtx.beginPath();
                    avatarCtx.arc(170, 170, 170, 0, Math.PI * 2, true);
                    avatarCtx.closePath();
                    avatarCtx.clip();
                    avatarCtx.drawImage(userImage, 0, 0, 345, 345);
                    ctx.drawImage(avatarCanvas, 90, 212);
                }

                async drawUsername() {
                    ctx.font = '80px Frutiger'
                    await fillTextWithTwemoji(ctx, this.user.username, 460, 480);
                }

                async drawMoney() {
                    ctx.font = '40px Frutiger'
                    ctx.fillText(`${abbreviate(Number(data.money), { display: 1 })}`, 990, 790)
                }

                async drawLevel() {
                    ctx.font = '39px Frutiger'
                    ctx.fillText(`Level: ${data.level}`, 590, 685)
                }

                async drawExp() {
                    ctx.font = '40px Frutiger'
                    ctx.fillText(`${abbreviate(Number(data.exp), { display: 1 })}/2.0K`, 990, 685)
                }

                async drawReps() {
                    let reps = await client.mysql.findUserReputation(user.id)

                    ctx.font = '40px Frutiger'
                    ctx.fillText(`${reps.length.toLocaleString()} Reps`, 590, 790)
                }
            }

            ctx.drawImage(layout, 0, 0);

            const pr = new Profile(user)

            await pr.drawAvatar();
            await pr.drawUsername();
            await pr.drawMoney();
            await pr.drawLevel();
            await pr.drawExp();
            await pr.drawReps();

            let attach = new AttachmentBuilder(image.toBuffer(), 'profile.png')

            message.reply({
                files: [attach],
                content: message.author.toString()
            })

        } catch (err) {
            console.log(err)
            message.reply({
                content: `❌ ${message.author.toString()}, ocorreu um erro, tente novamente mais tarde!`
            })
        }
    }
}