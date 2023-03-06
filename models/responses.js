'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Responses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Responses.belongsTo(models.User, {
            foreignKey: 'userId'
        })
    }
  }

  Responses.init({
    date:
        {
            type: DataTypes.DATE,
            validate: {
                isDate: true
          }
        },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
            isInt: true
        }
    },
    response:{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 128]
        }
    }
  }, {
    sequelize,
      paranoid: true,
      timestamps: true,
      modelName: 'Responses',
  });

  return Responses;
};