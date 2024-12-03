/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        money: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        premium: DataTypes.BIGINT,
        emoji: DataTypes.STRING,
        color: DataTypes.STRING,
        tickets: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        ban_is: DataTypes.BOOLEAN,
        ban_date: DataTypes.BIGINT,
        ban_reason: DataTypes.STRING(1000),
        block_reps: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        level: { type: DataTypes.INTEGER, defaultValue: 0 },
        exp: { type: DataTypes.INTEGER, defaultValue: 0 },
        bank: { type: DataTypes.BIGINT, defaultValue: 0}
    })

    return User;
}