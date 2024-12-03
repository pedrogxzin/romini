const { readdirSync } = require('fs')

const { red: ConsoleColorRed, blue: ConsoleColorBlue, yellow: ConsoleColorYellow, green: ConsoleColorGreen } = require('chalk');

const { abbreviate } = require('util-stunks');



const Events = readdirSync('./Events/')

const CommandsDir = readdirSync('./Commands/')



class Util {

    constructor(client) {

        this.client = client;

    }



    IsModerator(UserId) {

        return Object.values(this.client.config.permissions.moderator).includes(UserId);

    }



    IsDeveloper(UserId) {

        return Object.values(this.client.config.permissions.developer).includes(UserId);

    }



    async FindUser(UserId, Client, Message, ReturnAuthor = false) {
        let user = Message.mentions?.users.first() || Client.users.cache.get(UserId) ||
            Message.guild.members.cache.find(x => x.username?.toLowerCase()?.includes(UserId?.toLowerCase()))

        if (!user) { try { user = await Client.users.fetch(UserId) } catch (e) { } }

        if (!user) {
            if (ReturnAuthor) return Message.author
            else return false
        } else return user
    }



    Percentage(Value, Value2, Precision) {

        if (!Value || !Value2) return '0%'

        if (!Precision || Precision < 2 || isNaN(Precision)) Precision = 2

        return ((Value / Value2) * 100).toFixed(Precision) + "%"

    }



    async LoadCommands() {

        for (const Files of CommandsDir) {

            const Commands = readdirSync(`./Commands/${Files}`)

            for (const Command of Commands) {
                const isDevCommand = Files === "Developer" ? true : false
                const Pull = require(`../Commands/${Files}/${Command}`)
                Pull.isDevCommand = isDevCommand
                if (Pull.name) { this.client.commands.set(Pull.name, Pull) }

                if (Pull.aliases && Array.isArray(Pull.aliases)) Pull.aliases.forEach(x => this.client.aliases.set(x, Pull.name))

            }

        };

        console.log(ConsoleColorGreen('[APLICAÇÃO] ') + 'Comandos carregados!')

    }



    async LoadEvents() {

        for (let File of Events) {

            let Event = require(`../Events/${File}`)

            if (Event.once) this.client.once(Event.name, (...args) => Event.execute(this.client, ...args))

            else this.client.on(Event.name, (...args) => Event.execute(this.client, ...args))

        };



        console.log(ConsoleColorGreen('[APLICAÇÃO] ') + 'Eventos carregados!')

    }



    AbbreviateNumber(number) {
        number = parseInt(number);

        if (number < 1000) return `${number.toLocaleString()}`;
        else return `${number.toLocaleString()} (${abbreviate(number)})`;
    }

}



module.exports = Util;