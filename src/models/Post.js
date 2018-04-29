function defineModel(sequelize, DataTypes) {
  const Post = sequelize.define(
    'Post',
    {
      id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      content: DataTypes.STRING,
    },
    {
      timestamps: true,
    },
  )
  return Post
}

module.exports = defineModel
