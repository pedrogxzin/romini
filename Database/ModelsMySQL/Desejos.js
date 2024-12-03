/** 
 * @param {import('sequelize').Sequelize} sequelize
 *  @param {import('sequelize').DataTypes} DataTypes
*/
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('PoçoDosDesejos', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        channels: DataTypes.TEXT,
    });
}