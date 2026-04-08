import { Client } from "./client.model";
import { User } from "./user.model";
import { Service } from "./service.model";
import { Appointment } from "./appointment.model";
import { RefreshToken } from "./refresh-token.model";

export const initModels = () => {

  User.hasMany(RefreshToken, { foreignKey: "user_id" });
  RefreshToken.belongsTo(User, { foreignKey: "user_id" });

  Client.hasMany(Appointment, {
    foreignKey: "client_id"
  });

  Appointment.belongsTo(Client, {
    foreignKey: "client_id"
  });

  User.hasMany(Appointment, {
    foreignKey: "employee_id"
  });

  Appointment.belongsTo(User, {
    foreignKey: "employee_id"
  });

  Service.hasMany(Appointment, {
    foreignKey: "service_id"
  });

  Appointment.belongsTo(Service, {
    foreignKey: "service_id"
  });

};