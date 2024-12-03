module.exports = {
    name: 'messageUpdate',
    execute: (client, old, msg) => {
        if (msg?.author?.bot) return
        if (old?.content == msg?.content) return
        client.emit('messageCreate', msg)
    }
}