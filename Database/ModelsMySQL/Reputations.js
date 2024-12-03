/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Reputations', {
        given_by: DataTypes.STRING,
        received_by: DataTypes.STRING,
        given_at: DataTypes.BIGINT,
        reason: DataTypes.STRING,
    })
}