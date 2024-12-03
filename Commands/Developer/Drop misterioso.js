const Discord = require('discord.js')
const { unabbreviate } = require('util-stunks')

module.exports = {
name: "dropar",
aliases: [""],
description: 'Drope poções no chat',
usage: '<valor>',
cooldown: 100,
run: async (client, message, args) => {
  if(![''].includes(message.author.id)) return
  let valor = Math.floor(unabbreviate(args[0] || 'a'));
  if (!valor || isNaN(valor)) return message.reply(`:x: Você deve inserir um valor para dropar.`)
  valor = parseInt(valor)
  let palavras = ['Reafel feio', 'Ganheiii', 'Pokeii', 'Venha', 'Reafel Gostoso', 'Corre que la vem drop']
  let palavra = palavras[parseInt(Math.random()*palavras.length)]
  const filter = m => m.content.toLowerCase() == `${palavra.toLowerCase()}`
  let arr = []
  const coletor = message.channel.createMessageCollector({ filter, time: 15000 })
  let emb = new Discord.EmbedBuilder()
  .setColor("blue")
  .setTitle('DROP')
  .setDescription(`um presente no chat valento **${valor.toLocaleString('pt')}** poções!\nPara pegar o presente digite **${palavra.toUpperCase()}**`)
  message.channel.send({ embeds: [emb] })
  message.delete()
  coletor.on("collect", async m => {
    if(arr.includes(m.author.id)) return
    arr.push(m.author.id)
  })
  coletor.on('end', async (collected, motivo) => {
    arr = [... new Set(arr)]
    if(arr.length < 1) {
      return message.channel.send('Ninguém participou do drop :cry:')
    }
    let content = []
    for(i = 0; i < arr.length; i++) {
      let user = client.users.cache.get(arr[i])
      content.push(`${user}`)
    }
    message.channel.send(`Participantes:\n${content.slice(0, 50).map((i, index) => `- ${index + 1}. ${i}`).join('\n')}`)
    if(content.length > 50) {
      for(i = 50; i < content.length; i+= +50) {
        message.channel.send(`${content.slice(i, i + 50).map((i, index) => `- ${index + 1}. ${i}`).join('\n')}`)
      }
    }
    setTimeout(async () => {
      let vencedor = arr[parseInt(Math.random()*arr.length)]
      vencedor = client.users.cache.get(vencedor)
      message.channel.send({ content: `${vencedor} Ganhou **${valor.toLocaleString('pt')}** Peixes no drop do Arés!` })
      client.mysql.updateUserMoney(vencedor.id, valor)
      await client.mysql.transactions.create({
          source: 10,
          received_by: vencedor.id,
          given_at: Date.now(),
          amount: valor
      })
    }, 2500)
  })
}
}