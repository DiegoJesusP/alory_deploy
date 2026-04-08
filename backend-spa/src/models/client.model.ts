import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Client extends Model {}

Client.init(
{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING
  },

  phone: {
    type: DataTypes.STRING
  },

  birth_date: {
    type: DataTypes.DATE
  },

  allergies: {
    type: DataTypes.TEXT
  },

  preferences: {
    type: DataTypes.TEXT
  },

  clinical_data: {
    type: DataTypes.TEXT
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
  tableName: "clients",
  timestamps: false
}
);