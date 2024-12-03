/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('Transactions', {
        source: DataTypes.INTEGER,
        given_by: DataTypes.STRING,
        received_by: DataTypes.STRING,
        given_by_tag: DataTypes.STRING,
        received_by_tag: DataTypes.STRING,
        given_at: DataTypes.BIGINT,
        amount: DataTypes.BIGINT,
    })
    return Transactions;
}