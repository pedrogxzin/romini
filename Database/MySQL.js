const { red: ConsoleColorRed, blue: ConsoleColorBlue, yellow: ConsoleColorYellow, green: ConsoleColorGreen } = require('chalk');
const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const ms = require('ms');

class Database extends Sequelize {

constructor() {
        super({
            logging: false,
            dialect: 'sqlite',
            storage:"./db.sqlite"
        });
        this.authenticate().then(() => console.log(ConsoleColorYellow('[BANDO DE DADOS]') + ' Banco conectado!'));
        this.users = require('./ModelsMySQL/Users')(this, DataTypes);
        this.giftCard = require('./ModelsMySQL/GiftCards')(this, DataTypes);
        this.cooldowns = require('./ModelsMySQL/Cooldowns')(this, DataTypes);
        this.raffle = require('./ModelsMySQL/Raffle')(this, DataTypes);
        this.transactions = require('./ModelsMySQL/Transactions')(this, DataTypes);
        this.reputations = require('./ModelsMySQL/Reputations')(this, DataTypes);
        this.desejos = require('./ModelsMySQL/Desejos')(this, DataTypes);
        this.stephanie = require('./ModelsMySQL/Stephanie')(this, DataTypes);
        this.sync({ alter: true }).then(() => console.log(ConsoleColorYellow('[BANCO DE DADOS]') + ' Banco sincronizado!'));
    }

    async createGiftCard(code, premium) {
        const codeData = await this.giftCard.create({
            code: code,
            premium: premium
        })
        return codeData.dataValues;
    }

    async redeemCode(code) {
        const codeData = await this.giftCard.findOne({
            where: {
                code: code,
            }
        })

        if (!codeData) return false;

        await this.giftCard.destroy({
            where: {
                code: code,
            }
        })

        return codeData.dataValues;
    }

    /** @returns {Promise<UserDatabaseOptions>} */
    async findUser(UserId, ReturnOnlyValues) {
        let Data = await this.users.findOrCreate({
            where: {
                id: UserId
            }
        })

        if (ReturnOnlyValues) return Data[0].dataValues
        else return Data
    }

    /**
     * @param {string} UserId 
     * @param {UserDatabaseOptions} Update 
     */
    async updateUser(UserId, Update) {
        await this.users.update(Update, {
            where: {
                id: UserId
            }
        })
    }

    async updateUserMoney(UserId, Amount) {
        let Data = await this.findUser(UserId, true)

        await this.users.update({
            money: Data.money + Amount
        }, {
            where: {
                id: UserId
            }
        })
    }

    async updateUserPremium(UserId, Time) {
        let Data = await this.findUser(UserId, true)

        if (Data.premium > Date.now()) return this.updateUser(UserId, {
            premium: Data.premium + ms(Time)
        });
        else return this.updateUser(UserId, {
            premium: Date.now() + ms(Time)
        });
    }

    async removeUserPremium(UserId, Time) {
        let Data = await this.findUser(UserId, true);

        if (Data.premium > Date.now()) return this.updateUser(UserId, {
            premium: Data.premium - ms(Time)
        });
        else return this.updateUser(UserId, {
            premium: 0,
        });
    }

    async findUserPremium(UserId, Time = false) {
        let Data = await this.findUser(UserId, true)

        if (Data.premium && Data.premium > Date.now()) return Time ? Data.premium : true;
        else return false;
    }

    async updateUserBan(UserId, Is, DateBan = Date.now(), Reason = 'Nenhuma razão definida.') {
        this.updateUser(UserId, {
            ban_is: Is,
            ban_date: DateBan,
            ban_reason: Reason
        })
    }

    async findUserBan(UserId) {
        let Data = await this.findUser(UserId, true)

        if (Data.ban_is) return true;
        else return false;
    }

    async getCooldowns(UserId, ReturnOnlyValues) {
        let Data = await this.cooldowns.findOrCreate({
            where: {
                id: UserId
            }
        })

        if (ReturnOnlyValues) return Data[0].dataValues
        else return Data
    }

    async updateCooldowns(UserId, Cooldown, Update) {
        await this.cooldowns.update({
            [Cooldown]: Update
        }, {
            where: {
                id: UserId
            }
        })
    }

    async getLotteryData() {
        let Data = await this.lottery.findOrCreate({ where: { id: 1 } })

        return Data[0].dataValues
    }

    async updateUserEmoji(UserId, Emoji) {
        await this.updateUser(UserId, {
            emoji: Emoji
        })
    }

    async findUserEmoji(UserId) {
        let Data = await this.findUser(UserId, true)

        if (Data.emoji) return Data.emoji;
        else return false;
    }

    async updateUserReputation(FromUserId, ToUserId, Reason = null) {
        const Time = Date.now();

        await this.reputations.create({
            given_at: Time,
            given_by: FromUserId,
            received_by: ToUserId,
            reason: Reason,
        });
    }

    async findUserReputation(UserId) {
        const Data = await this.reputations.findAll({
            where: {
                received_by: UserId,
            },
        }).then(x => x.map(y => y.dataValues))
            .catch(() => []);

        return Data;
    }

    async findUsersTopReputation() {
        const Data = await this.reputations.findAll({
            attributes: [['received_by', 'user'], [Sequelize.fn('COUNT', Sequelize.col('received_by')), 'rep_count']],
            group: ['received_by']
        })
            .then(x => { return x.map(y => y.dataValues); })
            .catch((e) => { console.log(e); return []; });

        return Data;
    }


    /** @returns {Promise<RaffleDatabaseOptions>} */

    async getRaffleData() {

        let Data = await this.raffle.findOrCreate({

            where: {

                id: 'raffle'

            }

        });



        return Data[0].dataValues;

    }



    /** @param {RaffleDatabaseOptions} options */

    async updateRaffleData(options) {

        await this.raffle.update(options, {

            where: { id: 'raffle' }

        });

    }

    async getTicketsData() {

        /** @type {{user: string, tickets_count: number}[] } */

        const TicketsData = await this.users.findAll({

            where: {

                tickets: { [Op.gt]: 0 }

            },

            attributes: [['id', 'user'], ['tickets', 'tickets_count']],

            group: ['id']

        }).then(x => x.map(y => y.dataValues));



        const userCount = TicketsData.length;

        const ticketsCount = TicketsData.reduce((i, a) => i + a.tickets_count, 0);

        const users = TicketsData.map(m => ({ user: m.user, tickets: m.tickets_count }));

        return { users_count: userCount, tickets_count: ticketsCount, prize_count: ticketsCount * 500, users };
    }

    async addUserExp(user_id, exp) {
        let user = await this.findUser(user_id, true)
        let experience = user.exp + exp

        if (!user) return;

        while (experience >= 2000) {
            user.level++
            experience -= 2000
        }

        await this.users.update({ level: user.level, exp: experience }, { where: { id: user_id } })

        return {
            level: user.level,
            exp: experience
        }
    }


    /** @param {DesejosDatabaseOptions} options */
    async updateDesejosData(options) {
        if (Array.isArray(options?.channels))
            options.channels = (options.channels.length) ? options.channels.join(',') : '';

        await this.desejos.update(options, {
            where: { id: 'poçodosdesejos' }
        });
    }

    /** @returns {Promise<DesejosDatabaseOptions>} */
    async getDesejosData() {
        let Data = await this.desejos.findOrCreate({
            where: { id: 'poçodosdesejos' }
        });
        Data[0].dataValues.channels = Data[0]?.dataValues.channels?.length ? Data[0].dataValues?.channels?.split(',') : [];

        return Data[0].dataValues;
    }

    /** @param {TransactionDatabaseOptions} options */
    async createNewTransaction(options) {
        this.transactions.create(options);
    }

    /** @returns {Promise<StephanieDatabaseOptions>} */
    async getStephanieData() {
        let Data = await this.stephanie.findOrCreate({
            where: { id: 'stephanie' }
        });

        return Data[0].dataValues;
    }

    /** @returns { Promise<{maintenance: boolean, reason: string}> } */
    async getStephanieStatus() {
        const Data = await this.getStephanieData();
        return { maintenance: Data.maintenance, reason: Data.maintenance_reason };
    }

    /** @param {StephanieDatabaseOptions} options */
    async updateStephanieData(options) {
        await this.stephanie.update(options, {
            where: { id: 'stephanie' }
        });
    }

    async removeMaintenance() {
        await this.updateStephanieData({
            maintenance: false,
            maintenance_reason: undefined,
        });
    }
    async walletForBank(id, amount) {
        await this.updateUserMoney(id, -amount)
        const user = await this.findUser(id, true)

        await this.users.update({
            bank: user.bank + amount
        },
        {
            where: {
                id: id
            }
        })
        return {
            bank: user.bank + amount,
            money: user.money
        }
    }
    async bankForWallet(id, amount, porcentagem) {
        const descounted = amount - (porcentagem / 100) * amount;
        await this.updateUserMoney(id, descounted)
        const user = await this.findUser(id, true)

        await this.users.update({
            bank: user.bank - amount
        },
        {
            where: {
                id: id
            }
        })
        return {
            bank: user.bank - amount,
            money: user.money
        }
    }
}

module.exports = Database;

/** 
 * @typedef UserDatabaseOptions 
 * @type {{id: string, money: number, premium: string, emoji: string, tickets: number, ban_is: boolean, ban_date: number, ban_reason: string, block_reps: boolean}} 
*/

/**
 * @typedef RaffleDatabaseOptions
 * @type {{id: string, endsIn: number, lastWinnerId: string, lastWinnerValue: number}}
*/

/** 
 * @typedef DesejosDatabaseOptions
 * @type {{id: string, channels: string[]}}
*/

/**
 * @typedef TransactionDatabaseOptions
 * @type {{source: number, given_by: string, received_by: string, given_by_tag: string, received_by_tag: string, given_at: number, amount: number}}
 */

/**
 * @typedef StephanieDatabaseOptions
 * @type {{id: string,  maintenance: boolean, maintenance_reason: string }}
 */