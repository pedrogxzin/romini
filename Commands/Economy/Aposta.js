const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'bet',
    aliases: ['coinflip', 'apostar', 'bet'],
    description: 'Aposte Estrelas com outro usuário.',
    cooldown: 1900,
    usage: '<usuário> <valor>',
    run: async (client, message, args) => {
        const User = await client.util.FindUser(args[0], client, message, false)
        const AuthorData = await client.mysql.findUser(message.author.id, true)
        const Value = args[1] === "half" ? Number(AuthorData.money) / 2 : (args[1] === "all" || args[1] === "*" ? Number(AuthorData.money) : Math.floor(unabbreviate(args[1])))
        let Finished = false, confirms = []

        // const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)

        // if (Cooldowns.daily > Date.now()) {
        //     return client.sendReply(message, {
        //         content: `Você precisa resgatar o daily para poder utilizar esse comando!`,
        //         ephemeral: true
        //     })
        // }

        if (!User || User.id == message.author.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para apostar.`
        })

        if (User.bot && User.id != client.user.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, você não pode apostar com esse tipo de aplicação!`
        })

        if (isNaN(Value) || Value < 10 || Value > 1_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **10 Flocos** para apostar.`
        })

        let sorte;
        if (['0', '0'].includes(message.author.id)) sorte = 5.0;
        else if (['0'].includes(User.id)) sorte = 0.25;
        else sorte = 0.5;

        const UserData = await client.mysql.findUser(User.id, true)

        const Animals = await getAnimals(AuthorData, UserData)
        const Premium = {
            author: await client.mysql.findUserPremium(message.author.id),
            user: await client.mysql.findUserPremium(User.id)
        }

        if (AuthorData.money < Value) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, você não possui Estrelas suficientes... Para realizar a aposta, ${message.author} você precisa ter uma quantia maior ou igual a ${client.config.emojis.money} **${Value.toLocaleString()} Flocos**!`
        })

        if (UserData.money < Value) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, o usuário não possui Estrelas suficientes... Para realizar a aposta, ${User} precisa ter uma quantia maior ou igual a ${client.config.emojis.money} **${Value.toLocaleString()} Flocos**!`
        })

        if (User.id === client.user.id) confirms.push(client.user.id)

        const Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel(`Aceitar (${confirms.length}/2)`)
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
            )

        const Message = await client.sendReply(message, {
            content: `${User.toString()}, ${message.author.toString()} Quer fazer uma aposta com você valendo **${Value.toLocaleString()}** Flocos!\nPara confirmar a aposta, os dois devem clicar em ✅\nSe ${Animals[message.author.id]} vencer, ${message.author.toString()} ganha **${Premium.author ? Value.toLocaleString() : parseInt((Value / 100) * 95).toLocaleString()} Flocos**\nSe ${Animals[User.id]} vencer, ${User.toString()} ganha **${Premium.user ? Value.toLocaleString() : parseInt((Value / 100) * 95).toLocaleString()} Flocos**\n${Premium.user && Premium.author ? '_(Como ambos tem vip está aposta não terá taxa)_' : !Premium.user && !Premium.author ? `_(Como ambos não tem vip 5% do dinheiro apostado foi taxado)_` : (Premium.user && !Premium.author ? `_(Como ${message.author.toString()} não tem vip 5 % do dinheiro apostado foi taxado)_` : `_(Como ${User.toString()} não tem vip 5 % do dinheiro apostado foi taxado)_`)}`,
            components: [Row]
        })

        const collector = new InteractionCollector(client, { message: Message, time: 5 * 60 * 1000, filter: f => f.user.id === message.author.id || f.user.id === User.id });

        collector.on('collect', async (button) => {
            if (Finished) return;
            await button.deferUpdate()

            if (button.customId === 'accept') {
                // const Cooldowns = await client.mysql.getCooldowns(button.user.id, true)

                // if (Cooldowns.daily > Date.now()) {
                //     return client.sendReply(button, {
                //         content: `Você precisa resgatar o daily para poder utilizar esse comando!`,
                //         ephemeral: true
                //     })
                // }
                if (confirms.includes(button.user.id)) confirms = confirms.filter(x => x !== button.user.id)
                else confirms.push(button.user.id)
            }

            Message.components[0].components[0].data.label = `Aceitar (${confirms.length}/2)`
            await Message.edit({ components: Message.components })

            if (button.customId === 'accept' && confirms.includes(User.id) && confirms.includes(message.author.id)) {
                Finished = true
                const AuthorDataVerification = await client.mysql.findUser(message.author.id, true)
                const UserDataVerification = await client.mysql.findUser(User.id, true)

                if (AuthorDataVerification.money < Value || AuthorDataVerification?.ban_is) return;
                if (UserDataVerification.money < Value || UserDataVerification?.ban_is) return;

                const Winner = [User.id, message.author.id][Math.floor(Math.random() * [User.id, message.author.id].length)],
                    Loser = [User.id, message.author.id].filter(x => x != Winner)[0]

                client.mysql.updateUserMoney(Loser, -Value)
                client.mysql.updateUserMoney(Winner, Winner == message.author.id ? (Premium.author ? Value : parseInt((Value / 100) * 95)) : (Premium.user ? Value : parseInt((Value / 100) * 95)))
                await client.mysql.transactions.create({
                    source: 4,
                    received_by: Winner,
                    given_by: Loser,
                    given_by_tag: await client.users.fetch(Loser).then(x => x.tag),
                    received_by_tag: await client.users.fetch(Winner).then(x => x.tag),
                    given_at: Date.now(),
                    amount: Value
                })

                Message.components[0].components[0].data.disabled = true
                Message.components[0].components[1].data.disabled = true
                await Message.edit({ components: Message.components })

                client.sendReply(Message, {
                    content: `${Winner == message.author.id ? Animals[message.author.id] : Animals[User.id]} **Venceu a aposta**! \n👏 Parabéns <@${Winner}>, você ganhou **${(Winner == message.author.id ? Premium.author ? Value : parseInt((Value / 100) * 95) : Premium.user ? Value : parseInt((Value / 100) * 95)).toLocaleString()} Flocos** financiados por <@${Loser}>.`
                })

                collector.stop()
            } else if (button.customId === 'cancel' && button.user.id === message.author.id) {
                Message.components[0].components[0].data.disabled = true
                Message.components[0].components[1].data.disabled = true
                Message.components[0].components[1].data.label = 'Cancelado'
                await Message.edit({ components: Message.components })
            }
        })

        async function getAnimals(data1, data2) {
            let is_premium = await client.mysql.findUserPremium(data1.id)
            let is_premium_2 = await client.mysql.findUserPremium(data2.id)

            const animals = ['🐵', '🦁', '🐯', '🐱', '🐶', '🐺', '🐻', '🐨', '🐼', '🐹', '🐭', '🐰', '🦊', '🦝', '🐮', '🐷', '🐗', '🦓', '🦄', '🐴', '🐲', '🦎', '🐉', '🦖', '🦕', '🐢', '🐊', '🐍', '🐸', '🐇', '🐁', '🐀', '🐈', '🐩', '🐕', '🦮', '🐕‍🦺', '🐖', '🐎', '🐄', '🐂', '🐃', '🐏', '🐑', '🐐', '🦌', '🦙', '🦥', '🦘', '🐘', '🦏', '🦛', '🦒', '🐆', '🐅', '🦍', '🦧', '🐪', '🐫', '🐿️', '🦨', '🦡', '🦔', '🦦', '🦇', '🐦', '🐓', '🐔'];

            return {
                [data1.id]: is_premium && data1.emoji != null ? data1.emoji : animals[Math.floor(Math.random() * animals.length)],
                [data2.id]: is_premium_2 && data2.emoji != null ? data2.emoji : animals[Math.floor(Math.random() * animals.length)]
            }
        }
    }
}