export default (Sequelize, DataTypes) => {
  const Address = Sequelize.define('Address', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    privateKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    base58: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('NOW')
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('NOW')
    },
  }, {});

  return Address;
};
