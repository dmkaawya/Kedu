// Generate unique IDs for students and teachers
export const generateStudentId = (schoolId) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${schoolId}-STU-${timestamp}${random}`;
};

export const generateTeacherId = (schoolId) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${schoolId}-TCH-${timestamp}${random}`;
};
