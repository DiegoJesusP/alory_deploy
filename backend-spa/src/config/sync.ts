import { sequelize } from "./database";
import { initModels } from "../models";
import { User } from "../models/user.model";
import { hashPassword } from "../security/bcrypt";

export const syncDatabase = async () => {

  try{

    await sequelize.authenticate();
    console.log("Base de datos conectada");

    initModels();

    await sequelize.sync({alter: true});

    console.log("Modelos sincronizados");

    await seedAdmin();

  }catch(error){

    console.error("Error conectando BD",error);

  }

};

const seedAdmin = async () => {
  const existing = await User.findOne({ where: { role: "ADMIN" } });
  if (existing) return;

  const hashed = await hashPassword("Admin123!");
  await User.create({
    role: "ADMIN",
    full_name: "Administrador",
    username: "admin",
    password: hashed,
    email: "admin@spa.com",
    is_active: true
  });

  console.log("Admin inicial creado: username=admin / password=Admin123!");
};