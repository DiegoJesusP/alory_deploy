import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Product extends Model {}

Product.init(
{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },

  cost: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  minimum_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

},
{
  sequelize,
  tableName: "products",
  timestamps: false
}
);