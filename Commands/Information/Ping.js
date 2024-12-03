module.exports = {
    name: 'ping',
    aliases: ['latência', 'latency'],
    description: 'Obtenha a velocidade de respota e latência da aplicação.',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
        const InitialDate = Date.now()
        const Query = await client.mysql.users.findAll()
        const DateAfterQuery = Date.now()

        message.channel.send({
            content: '**Calculando...**'
        }).then(x => {
            setTimeout(() => {
                x.edit({
                    content: `${message.author}\n>>> ${client.config.emojis.ping} | Aplicação: \`${client.ws.ping}ms\`\n${client.config.emojis.leaf} | Banco de Dados: \`${DateAfterQuery - InitialDate}ms\`\n`
                }).catch(e => { })
            }, 1_000)
        })
    }
}