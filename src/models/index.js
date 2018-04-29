import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import configManifest from '../../config/config.json'

const env = process.env.NODE_ENV || 'development'
const config = configManifest[env]
const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

fs
  .readdirSync(__dirname)
  .filter(file => file !== '.js' && file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
