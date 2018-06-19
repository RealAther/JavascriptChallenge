function defineModel(sequelize, DataTypes) {
  const Post = sequelize.define(
    'Post',
    {
      id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      author_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      content: DataTypes.STRING,
    },
    {
      timestamps: true,
    },
  )
  // TODO: When associations are setup, remove author_id
  return Post
}

module.exports = defineModel
