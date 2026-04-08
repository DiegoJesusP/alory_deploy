import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Service extends Model {}

Service.init(
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

  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT
  },

  image: {
    type: DataTypes.TEXT('long')
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
  tableName: "services",
  timestamps: false
}
);