// ORM with id, username, password

module.exports = (sequelize, DataTypes) => {
  const newUser = sequelize.define("new_user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return newUser;
};
