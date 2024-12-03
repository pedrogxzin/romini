const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'pay',
    aliases: ['pagamento', 'pay', 'pix'],
    description: 'Envie algumas Ametistas para um usuário a partir do seu saldo.',
    cooldown: 1900,
    usage: '<usuário> <valor>',
    run: async (client, message, args) => {
        const User = await client.util.FindUser(args[0], client, message, false);
        const AuthorData = await client.mysql.findUser(message.author.id, true);
        const Value = args[1] === "half" ? Number(AuthorData.money) / 2 : (args[1] === "all" || args[1] === "*" ? Number(AuthorData.money) : Math.floor(unabbreviate(args[1])))

        if (!User || User.id == message.author.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, diga-me um usuário válido para enviar o pagamento.`
        })

        if (User.bot && User.id != client.user.id) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, você não pode enviar um pagamento para esse tipo de aplicação!`
        })

        if (isNaN(Value) || Value < 10 || Value > 100_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **10 Flocos** para enviar.`
        })

        if (AuthorData.money < Value) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, você não tem tantos Flocos assim para enviar.`
        })

        const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)
        const CooldownsUser = await client.mysql.getCooldowns(User.id, true)

        if (Cooldowns.daily < Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, você não pode enviar pagamentos pois ainda não coletou sua recompensa diária, use o comando \`odaily\` para coletar.`
        })

        if (CooldownsUser.daily < Date.now() && User.id !== client.user.id) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, esse usuário não pode receber pagamentos pois ainda não coletou sua recompensa diária, use o comando \`odaily\` para coletar.`
        })

        const Message = await client.sendReply(message, {
            content: ` ${client.config.emojis.money} | ${User}, ${message.author} quer lhe enviar ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** em um **pagamento** Que expira em <t:${parseInt((Date.now() + require('ms')('5m')) / 1000)}:R>.\n🤝 | Para aceitar os dois devem confirma em ✅.`
        })
        Message.react('✅')

        const filter = (reaction, user) => reaction.emoji.name === `✅` && [User.id, message.author.id].includes(user.id)
        const Collector = Message.createReactionCollector({
            filter: filter,
            time: require('ms')('5m')
        })

        Collector.on('collect', async (reaction, user) => {
            const Reactions = Message.reactions.cache.get('✅').users.cache.map(x => x.id)
            if (Reactions.includes(User.id) && Reactions.includes(message.author.id)) {
                Collector.stop()
                const AuthorDataVerification = await client.mysql.findUser(message.author.id, true)
                const UserDataVerification = await client.mysql.findUser(User.id, true)

                if (AuthorDataVerification.money < Value || UserDataVerification.ban_is) return;

                client.mysql.updateUserMoney(message.author.id, -Value)
                client.mysql.updateUserMoney(User.id, Value)

                await client.mysql.transactions.create({
                    source: 3,
                    received_by: User.id,
                    given_by: message.author.id,
                    given_by_tag: message.author.tag,
                    received_by_tag: User.tag,
                    given_at: Date.now(),
                    amount: Value
                })

                client.sendReply(Message, {
                    content: `${client.config.emojis.money} ${message.author}, Pagamento Realizado! ${User} Recebeu ${client.config.emojis.money} **${Value.toLocaleString()} Flocos** com sucesso!.`
                })
            }
        })
    }
}