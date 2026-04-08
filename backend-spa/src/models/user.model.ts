import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class User extends Model {}

User.init(
{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  role: {
    type: DataTypes.STRING,
    allowNull: false
  },

  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  phone: {
    type: DataTypes.STRING
  },

  birth_date: {
    type: DataTypes.DATE
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  token: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  date_expiration: {
    type: DataTypes.DATE,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

},
{
  sequelize,
  tableName: "users",
  timestamps: false
}
);