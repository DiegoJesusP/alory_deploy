import { Appointment } from "../../models/appointment.model";
import { Client } from "../../models/client.model";
import { User } from "../../models/user.model";
import { Service } from "../../models/service.model";
import { Op } from "sequelize";

type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface AppointmentPayload {
  client_id?: number;
  service_id?: number;
  employee_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  status?: AppointmentStatus;
}

const appointmentInclude = [
  { model: Client },
  { model: User },
  { model: Service },
];

const getEmployeeByUsername = async (username?: string) => {
  if (!username) return null;

  return User.findOne({
    where: {
      username,
      is_active: true,
    },
  });
};

const getDateAndTimeFromAppointment = (appointmentDateValue: Date | string) => {
  const dateValue = new Date(appointmentDateValue);

  if (Number.isNaN(dateValue.getTime())) {
    throw new Error("Fecha de cita invalida");
  }

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  const hour = String(dateValue.getHours()).padStart(2, "0");
  const minutes = String(dateValue.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minutes}`,
  };
};

const parseAppointmentDateTime = (date?: string, time?: string) => {
  if (!date) {
    throw new Error("La fecha es obligatoria");
  }

  if (!time) {
    throw new Error("La hora es obligatoria");
  }

  const safeTime = time.length === 5 ? `${time}:00` : time;
  const appointmentDate = new Date(`${date}T${safeTime}`);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Fecha u hora invalida");
  }

  appointmentDate.setSeconds(0, 0);
  return appointmentDate;
};

const resolveEmployeeId = async (
  payloadEmployeeId: number | undefined,
  role: string,
  username?: string
) => {
  const actorEmployee = await getEmployeeByUsername(username);

  if (role === "EMPLOYEE") {
    if (!actorEmployee) {
      throw new Error("No se pudo resolver el empleado autenticado");
    }

    if (payloadEmployeeId && payloadEmployeeId !== actorEmployee.getDataValue("id")) {
      throw new Error("No puedes asignar una cita a otro empleado");
    }

    return actorEmployee.getDataValue("id") as number;
  }

  if (!payloadEmployeeId) {
    throw new Error("El empleado asignado es obligatorio");
  }

  return payloadEmployeeId;
};

const ensureEntities = async (clientId: number, serviceId: number, employeeId: number) => {
  const [client, service, employee] = await Promise.all([
    Client.findOne({ where: { id: clientId, is_active: true } }),
    Service.findOne({ where: { id: serviceId, is_active: true } }),
    User.findOne({ where: { id: employeeId, is_active: true, role: "EMPLOYEE" } }),
  ]);

  if (!client) {
    throw new Error("El cliente seleccionado no existe o esta inactivo");
  }

  if (!service) {
    throw new Error("El servicio seleccionado no existe o esta inactivo");
  }

  if (!employee) {
    throw new Error("El empleado asignado no existe o esta inactivo");
  }
};

const ensureSlotAvailability = async (
  employeeId: number,
  appointmentDate: Date,
  appointmentIdToIgnore?: number
) => {
  const conflict = await Appointment.findOne({
    where: {
      employee_id: employeeId,
      appointment_date: appointmentDate,
      status: "SCHEDULED",
      ...(appointmentIdToIgnore ? { id: { [Op.ne]: appointmentIdToIgnore } } : {}),
    },
  });

  if (conflict) {
    throw new Error("No se puede agendar en un horario ocupado");
  }
};

const findAppointmentWithRelations = async (id: number) => {
  return Appointment.findByPk(id, {
    include: appointmentInclude,
  });
};

export const getAppointments = async (role: string, username?: string) => {
  if (role === "EMPLOYEE") {
    const employee = await getEmployeeByUsername(username);

    if (!employee) {
      throw new Error("No se pudo resolver el empleado autenticado");
    }

    return Appointment.findAll({
      where: {
        employee_id: employee.getDataValue("id") as number,
      },
      order: [["appointment_date", "ASC"]],
      include: appointmentInclude,
    });
  }

  return Appointment.findAll({
    order: [["appointment_date", "ASC"]],
    include: appointmentInclude,
  });
};

export const createAppointment = async (
  payload: AppointmentPayload,
  role: string,
  username?: string
) => {
  if (!payload.client_id) {
    throw new Error("El cliente es obligatorio");
  }

  if (!payload.service_id) {
    throw new Error("El servicio es obligatorio");
  }

  const employeeId = await resolveEmployeeId(payload.employee_id, role, username);
  const appointmentDate = parseAppointmentDateTime(payload.appointment_date, payload.appointment_time);

  await ensureEntities(payload.client_id, payload.service_id, employeeId);
  await ensureSlotAvailability(employeeId, appointmentDate);

  const appointment = await Appointment.create({
    client_id: payload.client_id,
    service_id: payload.service_id,
    employee_id: employeeId,
    appointment_date: appointmentDate,
    notes: payload.notes?.trim() || null,
    status: "SCHEDULED",
  });

  return findAppointmentWithRelations(appointment.getDataValue("id") as number);
};

export const updateAppointment = async (
  id: number,
  payload: AppointmentPayload,
  role: string,
  username?: string
) => {
  const appointment = await Appointment.findByPk(id);

  if (!appointment) {
    throw new Error("La cita no existe");
  }

  const currentEmployeeId = appointment.getDataValue("employee_id") as number;

  if (role === "EMPLOYEE") {
    const employee = await getEmployeeByUsername(username);

    if (!employee) {
      throw new Error("No se pudo resolver el empleado autenticado");
    }

    if ((employee.getDataValue("id") as number) !== currentEmployeeId) {
      throw new Error("No tienes permisos para modificar esta cita");
    }
  }

  const currentDateValue = appointment.getDataValue("appointment_date") as Date | string;
  const currentDateTime = getDateAndTimeFromAppointment(currentDateValue);

  const nextClientId = payload.client_id ?? (appointment.getDataValue("client_id") as number);
  const nextServiceId = payload.service_id ?? (appointment.getDataValue("service_id") as number);
  const nextEmployeeId = await resolveEmployeeId(
    payload.employee_id ?? currentEmployeeId,
    role,
    username
  );

  const nextDate = payload.appointment_date ?? currentDateTime.date;
  const nextTime = payload.appointment_time ?? currentDateTime.time;
  const nextAppointmentDate = parseAppointmentDateTime(nextDate, nextTime);

  await ensureEntities(nextClientId, nextServiceId, nextEmployeeId);
  await ensureSlotAvailability(nextEmployeeId, nextAppointmentDate, id);

  await appointment.update({
    client_id: nextClientId,
    service_id: nextServiceId,
    employee_id: nextEmployeeId,
    appointment_date: nextAppointmentDate,
    notes: payload.notes?.trim() ?? appointment.getDataValue("notes"),
  });

  return findAppointmentWithRelations(id);
};

export const cancelAppointment = async (id: number, role: string, username?: string) => {
  const appointment = await Appointment.findByPk(id);

  if (!appointment) {
    throw new Error("La cita no existe");
  }

  if (role === "EMPLOYEE") {
    const employee = await getEmployeeByUsername(username);

    if (!employee) {
      throw new Error("No se pudo resolver el empleado autenticado");
    }

    if ((employee.getDataValue("id") as number) !== (appointment.getDataValue("employee_id") as number)) {
      throw new Error("No tienes permisos para cancelar esta cita");
    }
  }

  await appointment.update({ status: "CANCELLED" });

  return findAppointmentWithRelations(id);
};