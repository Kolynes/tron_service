module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('Addresses', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        privateKey: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          publicKey: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          hex: {
            type: Sequelize.STRING,
            allowNull: false,
          },
        base58: {
            type: Sequelize.STRING,
            allowNull: false,
          },
        createdAt: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
      })
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Addresses');
    }
  };