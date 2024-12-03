const { abbreviate } = require('util-stunks')

module.exports = {
    name: 'redeem',
    aliases: ['resgatar', 'res'],
    description: 'Resgate o seu Gift Card.',
    cooldown: 1900,
    usage: '<code>',
    /** 
     * @param {import('../../Base/client')} client 
     * @param {import('discord.js').Message} message
     * @param {string[] args}
     * */
    run: async (client, message, args) => {
        if (!args[0]) {
            return await client.sendReply(message, {
                content: "Digite um código válido!"
            })
        }

        const codeData = await client.mysql.redeemCode(args[0])

        if (!codeData)
            return client.sendReply(message, {
                content: 'Esse código não existe!'
            })

        await client.sendReply(message, {
            content: `Parabéns, você resgatou ${codeData.premium} (${abbreviate(codeData.premium)}) Estrelas do código no qual você resgatou!`
        })

        await client.mysql.updateUserMoney(message.author.id, Number(codeData.premium))
        await client.mysql.transactions.create({
            source: 11,
            received_by: message.author.id,
            given_at: Date.now(),
            amount: Number(codeData.premium),
        })
    }
}