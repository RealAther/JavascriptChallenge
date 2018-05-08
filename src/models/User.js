function defineModel(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      email: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      timestamps: true,
    },
  )
  return User
}

module.exports = defineModel
