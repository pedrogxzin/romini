const { ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, AttachmentBuilder, User } = require("discord.js");

const { createCanvas, loadImage, registerFont } = require('canvas')


registerFont('./Base/Fonts/Oswald-Regular.ttf', { family: 'oswald' })
const { abbreviate, relativeTime } = require('util-stunks')

module.exports = {
    name: 'placar',
    aliases: ['top', 'rank', 'leaderboard', 'lb'],
    description: 'Veja o placar dos usuários mais ricos.',
    cooldown: 1900,
    usage: '<usuário> <valor>',
    run: async (client, message, args) => {
        try {

            let Page = parseInt(args[0])

            if (isNaN(Page)) Page = 0

            if (Page > 5 || Page < 1) Page = 0

            else Page = parseInt((Page - 1) * 5)

            const UsersLeaderboard = await client.mysql.users.findAll({

                order: [['money', 'DESC']],

                attributes: ['id', 'money']

            }).then(x => x.map(y => y.dataValues).slice(Page, Page + 5))

            let Image = createCanvas(800, 600), Ctx = Image.getContext("2d")

            Ctx.save()
    
            let guildIcon = await loadImage(message.guild.iconURL({ size: 2048, extension: 'png' }) || client.user.displayAvatarURL({ size: 2048, extension: 'png' }))

            Ctx.drawImage(guildIcon, 500, 0, 300, 100);

            Ctx.restore()


            for (let i = 0; i < UsersLeaderboard.length; i++) {
                
                if(i==0) {
                    let y = 90
                    let User = await client.users.fetch(UsersLeaderboard[i].id)
    
                    Ctx.save()
    
                    let avatar = await loadImage(User.displayAvatarURL({ size: 2048, extension: 'png' }))
    
                    Ctx.drawImage(avatar, 0, y, 286, 98);
    
                    Ctx.restore()
                } else if(i==1) {
                    let y = (90 + (98))
                    let User = await client.users.fetch(UsersLeaderboard[i].id)
    
                    Ctx.save()
    
                    let avatar = await loadImage(User.displayAvatarURL({ size: 2048, extension: 'png' }))
    
                    Ctx.drawImage(avatar, 0, y, 286, 103);
    
                    Ctx.restore()
                } else if(i==2) {
                    let y = (90 + (100 * 2))
                    let User = await client.users.fetch(UsersLeaderboard[i].id)
    
                    Ctx.save()
    
                    let avatar = await loadImage(User.displayAvatarURL({ size: 2048, extension: 'png' }))
    
                    Ctx.drawImage(avatar, 0, y, 286, 105);
    
                    Ctx.restore()
                } else if(i==3) {
                    let y = (90 + (101 * 3))
                    let User = await client.users.fetch(UsersLeaderboard[i].id)
    
                    Ctx.save()
    
                    let avatar = await loadImage(User.displayAvatarURL({ size: 2048, extension: 'png' }))
    
                    Ctx.drawImage(avatar, 0, y, 286, 100);
    
                    Ctx.restore()
                } else if(i==4) {
                    let y = (90 + (100 * 4))
                    let User = await client.users.fetch(UsersLeaderboard[i].id)
    
                    Ctx.save()
    
                    let avatar = await loadImage(User.displayAvatarURL({ size: 2048, extension: 'png' }))
    
                    Ctx.drawImage(avatar, 0, y, 286, 100);
    
                    Ctx.restore()
                }

            }

            let layout = await loadImage('./top.png')


            Ctx.drawImage(layout, 0, 0, Image.width, Image.height)

            for (let i = 0; i < UsersLeaderboard.length; i++) {

                let y = 100 * i, x = 300

                let User = await client.users.fetch(UsersLeaderboard[i].id)

                Ctx.save()

                Ctx.font = '35px oswald';

                Ctx.fillStyle = '#FFFFFF';

                Ctx.fillText(`#${i + (Page + 1)} `  +  User.username.split("").slice(0, 20).join(""), x, y + 125)



                Ctx.font = '25px oswald';

                Ctx.fillStyle = '#FFFFFF';

                Ctx.fillText('ID: ' + User.id, x, y + 150)


                const money_text = `${abbreviate(UsersLeaderboard[i].money)} Flocos `
                Ctx.font = money_text.length > 25 ? '25px NexaBlack' : '30px NexaBlack';

                Ctx.fillStyle = '#FFFFFF';

                Ctx.fillText(money_text, x, y + 182)

                Ctx.restore()

            }



            const Attachment = new AttachmentBuilder(Image.toBuffer(), 'leaderboard.png')



            client.sendReply(message, {

                files: [Attachment],

                content: message.author.toString()

            })

        } catch (e) {
            console.log(e)
            client.sendReply(message, {

                content: `${client.config.emojis.error} ${message.author}, ocorreu um erro ao tentar renderizar a imagem.`

            })

        }

    }

}