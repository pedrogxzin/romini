const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, InteractionCollector, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js')
const { abbreviate, unabbreviate } = require('util-stunks')

const { createCanvas, loadImage, registerFont } = require("canvas")
const { fillTextWithTwemoji } = require("node-canvas-with-twemoji-and-discord-emoji")

registerFont('./Base/Fonts/font.ttf', { family: 'Frutiger' })
module.exports = {
    name: 'bank',
    aliases: ['banco'],
    description: 'Veja o painel bancário',
    cooldown: 1500,
    usage: null,
    run: async (client, message, args) => {
        if(args[0]){
            if (args[0] === 'saldo') {
                const user = await client.mysql.findUser(message.author.id, true)
                await message.channel.send({
                    content: `<@${message.author.id}> seu saldo no banco atualmente é de **${user.bank.toLocaleString("pt-br")}** \`(${abbreviate(user.bank)})\` **Flocos**.`
                })
                return;
            }
            else if (args[0].startsWith('d') || args[0].startsWith('s')) {
                const value = args[1]
                let amount;
                const user = await client.mysql.findUser(message.author.id, true)
                if(args[1] !== "half" && args[1] !== "all"){
                    amount = Math.floor(unabbreviate(value))
                    if(isNaN(amount)){
                        return await message.channel.send({ content: `<@${message.author.id}> Valor inválido, tente novamente.`, ephemeral: true })
                    }
                } 
                const money = user.money || 0;
                const bank = user.bank || 0;
    
                if (args[0].startsWith('d')) {
                    amount = value === "half" ? user.money / 2 : (value === "all" ? user.money : amount)
                    if (money < amount) return await message.channel.send({ content: `<@${message.author.id}> não possui esse valor na carteira!` })
                    else {
                        const userAfter = await client.mysql.walletForBank(message.author.id, amount)
                        await message.channel.send({
                            content: `<@${message.author.id}> **depositou** um valor de **${amount.toLocaleString("pt-br")}** \`(${abbreviate(amount)})\` e agora você possui **${userAfter.bank.toLocaleString("pt-br")}** no banco`,
                        })
                    }
                    return;
    
                } else if (args[0].startsWith('s')) {
                    amount = value === "half" ? user.bank / 2 : (value === "all" ? user.bank : amount)
                    let valueGetter = 1.5;
                    
                    if (bank < amount) return await message.channel.send({ content: `<@${message.author.id}> não possui esse valor no banco!` })
                    else {
                        let isVip = await client.mysql.findUserPremium(message.author.id, true)
                        if (isVip) valueGetter = 0.5;
                        if (message.member.roles.cache.has(client.config.cargo_com_desconto)) valueGetter = 0;
                        const userAfter = await client.mysql.bankForWallet(message.author.id, amount, valueGetter)
                        const descounted = amount - (valueGetter / 100) * amount;
                        await message.channel.send({
                            content: `<@${message.author.id}> Você **sacou** um valor de **${descounted.toLocaleString("pt-br")}** \`(Como você ${isVip ? "" : (message.member.roles.cache.has(client.config.cargo_com_desconto) ? "" : "não")} é um usuário Premium houve ${valueGetter}% taxado)\` e agora você possui **${userAfter.bank.toLocaleString("pt-br")}** no banco`
                        })
                    }
                    return;
                }
            }
        }

        const bot_message = await client.sendReply(message, {
            embeds: [
                new EmbedBuilder()
				    .setColor(`#00ff00`)
                    .setTitle(":coin: **Banco de Estrelas**")
                    .setDescription(`### **Utilidades** \n <:seta1:1204910650275532890> Para **depositar Flocos** use: \`obanco depositar <flocos>\` \n <:seta1:1204910650275532890> Para **sacar flocos** use: \`obanco sacar <flocos>\` \n <:seta1:1204910650275532890> Para **verificar seu saldo** use: \`obanco saldo\` `)
                    .setFields([
                        {
                            name: `:coin: **Taxa de serviço**`,
                            value: `<:seta1:1204910650275532890> **Usuários** que **não Possuem vip** Tem \`1.5% de taxa\`. \n<:seta1:1204910650275532890> **Usuários com Vip** têm apenas \`0,5% de taxa\`. \n<:seta1:1204910650275532890> **Usuários** que **Possuem** **Vip Untaxed** tem \`0% de taxa\`.`
                        },
						{   name: `:coin: **Como me tornar Vip Untaxed?**`,
						    value: `<:seta1:1204910650275532890> Basta entrar no meu **Servidor** **[Estelar\](https://discord.gg/zyon)** e conversar com algum adm para **comprar**!`
						}
                    ])
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("deposit")
                        .setLabel("Depositar")
                        .setEmoji("🪙")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("balance")
                        .setLabel("Saldo")
					    .setEmoji("🪙")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("withdraw")
                        .setLabel("Sacar")
                        .setEmoji("🪙")
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        })
        const collector = new InteractionCollector(client, { message: bot_message, time: 2 * 60 * 1000, filter: f => f.user.id === message.author.id });
        collector.on("collect", async collected => {
            switch (collected.customId) {
                case "deposit":
                    const modalDeposit = new ModalBuilder()
                        .setCustomId("deposit-modal")
                        .setTitle("Transação bancária.")
                        .setComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("amount")
                                    .setLabel("Qual o valor que deseja depositar?")
                                    .setRequired(true)
                                    .setPlaceholder("Valor. Ex: 10m")
                                    .setStyle(TextInputStyle.Short)
                            )
                        )
                    collected.showModal(modalDeposit)
                    break;
                case "balance":
                    const user = await client.mysql.findUser(collected.user.id, true)
                    await collected.reply({
                        content: `<@${message.author.id}> seu saldo no banco atualmente é de **${user.bank.toLocaleString("pt-br")}** \`(${abbreviate(user.bank)})\` Flocos.`,
                        ephemeral: true
                    })
                    break;
                case "withdraw":
                    const modalWithdraw = new ModalBuilder()
                        .setCustomId("withdraw-modal")
                        .setTitle("Transação bancária.")
                        .setComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("amount")
                                    .setLabel("Qual o valor que deseja sacar?")
                                    .setRequired(true)
                                    .setPlaceholder("Valor. Ex: 5m")
                                    .setStyle(TextInputStyle.Short)
                            )
                        )
                    collected.showModal(modalWithdraw)
                    break;
            }
            if (collected.isModalSubmit()) {
                const value = collected.fields.getTextInputValue('amount')
                const user = await client.mysql.findUser(message.author.id, true)
                let amount;
                if(args[1] !== "half" && args[1] !== "all"){
                    amount = Math.floor(unabbreviate(value))
                    if(isNaN(amount)){
                        return await message.channel.send({ content: `<@${message.author.id}> Valor inválido, tente novamente.`, ephemeral: true })
                    }
                } 
                const money = user.money || 0;
                const bank = user.bank || 0;
                if (collected.customId === "deposit-modal") {
                    amount = value === "half" ? user.money / 2 : (value === "all" ? user.money : amount)
                    if (money < amount) return await collected.reply({ content: `Você não possui esse valor na carteira!`, ephemeral: true })
                    else {
                        const userAfter = await client.mysql.walletForBank(collected.user.id, amount)
                        await collected.reply({
                            content: `<@${message.author.id}> Você **depositou** um valor de **${amount.toLocaleString("pt-bt")}** \`(${abbreviate(amount)})\` e agora você possui **${userAfter.bank.toLocaleString("pt-br")}** no banco`,
                            ephemeral: true
                        })
                    }
                } else if (collected.customId === "withdraw-modal") {
                    amount = value === "half" ? user.bank / 2 : (value === "all" ? user.bank : amount)
                    let valueGetter = 1.5;
                    const isVip = await client.mysql.findUserPremium(message.author.id, true)
                    if (isVip) valueGetter = 0.5;
                    if (message.member.roles.cache.has(client.config.cargo_com_desconto)) valueGetter = 0;
                    if (bank < amount) return await collected.reply({ content: `Você não possui esse valor no banco!`, ephemeral: true })
                    else {
                        const descounted = amount - (valueGetter / 100) * amount;
                        const userAfter = await client.mysql.bankForWallet(collected.user.id, amount, valueGetter)
                        await collected.reply({
                            content: `<@${message.author.id}> Você **sacou** um valor de **${descounted.toLocaleString("pt-br")}** \`(Como você ${isVip ? "" : (message.member.roles.cache.has(client.config.cargo_com_desconto) ? "" : "não")} é um usuário Premium houve ${valueGetter}% taxado)\` e agora você possui **${userAfter.bank.toLocaleString("pt-br")}** no banco`,
                            ephemeral: true
                        })
                    }
                }
            }
        })
        collector.on("end", async (undefined, reason) => {
            if (reason === "time") await bot_message.delete()
        })
    }
}
