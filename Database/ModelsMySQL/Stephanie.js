/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Estelar', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        maintenance: DataTypes.BOOLEAN,
        maintenance_reason: DataTypes.STRING, 
    });
};