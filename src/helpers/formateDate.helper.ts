const addTime = (isoString: Date, timeToAdd: string): Date => {
  const [hours, minutes] = timeToAdd.split(":").map(Number); //? Split "09:30" into [9, 30] and convert to numbers
  const date = new Date(isoString); //? Convert ISO string to Date object

  date.setHours(date.getHours() + hours); //? Add hours
  date.setMinutes(date.getMinutes() + minutes); //? Add minutes

  return date;
};

const addDay = (date: Date, days: number): Date => {
  const newDate = new Date(date); //? Create a copy of the original date
  newDate.setDate(newDate.getDate() + days); //? Add the days
  return newDate;
};

export const formateDate = { addTime, addDay };
