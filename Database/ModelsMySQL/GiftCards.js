/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    const GiftCard = sequelize.define('GiftCard', {
        code: DataTypes.STRING,
        premium: DataTypes.BIGINT
    });

    return GiftCard
}