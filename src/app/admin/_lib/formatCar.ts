/** Марка/модель: customCar/customLabel или каталог Brand + Model. */
export function formatClientCar(client: {
  customCar?: string | null;
  car?: { model: string; brand?: { name: string } | null } | null;
}): string {
  if (client.customCar?.trim()) return client.customCar.trim();
  if (client.car) {
    const brand = client.car.brand?.name;
    return brand ? `${brand} ${client.car.model}` : client.car.model;
  }
  return "";
}

/** Авто из записи календаря: vehicle визита, иначе профиль клиента. */
export function formatAppointmentCar(appointment: {
  vehicle?: { label?: string | null } | null;
  client: {
    customCar?: string | null;
    car?: { model: string; brand?: { name: string } | null } | null;
  };
}): string {
  if (appointment.vehicle?.label?.trim()) {
    return appointment.vehicle.label.trim();
  }
  return formatClientCar(appointment.client);
}
