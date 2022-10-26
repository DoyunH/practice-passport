const { sequelize } = require("./models/index");

const driver = async () => {
  try {
    await sequelize.sync();
    console.log("DB 연결 성공");
  } catch (error) {
    console.error(error);
  }
};

driver();
