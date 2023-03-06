'use strict';
const {
  Model
} = require('sequelize');
const {maxAge} = require("express-session/session/cookie");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        User.hasMany(sequelize.models.Responses, {
            foreignKey: 'userId'
    })
    }
  }
//add validation to each field
  User.init({
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 32],
            is: ["^[a-z]+$",'i']
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 32],
          is: ["^[a-z]+$",'i']        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 32],
          notEmpty: true,
          isEmail: true
          }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        // validate: {
        //     len: [3,32]
        // }
    },
  }, {
    sequelize,
    modelName: 'User',
    });
    return User;
};
