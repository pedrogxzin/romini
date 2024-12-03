/** 
 * @param {import('sequelize').Sequelize} sequelize
 *  @param {import('sequelize').DataTypes} DataTypes
*/
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('Raffle', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        endsIn: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        lastWinnerId: DataTypes.STRING,
        lastWinnerValue: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    })

    return User
}