import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Appointment extends Model {}

Appointment.init(
{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  appointment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("SCHEDULED", "COMPLETED", "CANCELLED"),
    defaultValue: "SCHEDULED"
  },

  notes: {
    type: DataTypes.TEXT
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

},
{
  sequelize,
  tableName: "appointments",
  timestamps: false
}
);