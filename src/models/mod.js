import { Sequelize, DataTypes, Model } from 'sequelize'

// Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
})

// Links model
class Links extends Model {}
Links.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  longurl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  shorturlid: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { sequelize, modelName: 'links' })

// Users model
class Users extends Model {}
Users.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(300),
    allowNull: false,
    unique: true
  }
}, { sequelize, modelName: 'users' })

export { Links, Users, sequelize }