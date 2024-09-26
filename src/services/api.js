//const baseURL = 'http://192.168.191.165:8080';
const baseURL = "https://cograd-erp-backend.onrender.com";

const apiList = {
  login: `${baseURL}/api/teacher/app/login`,
  getTeacherById: teacherId => `${baseURL}/api/teacher/getTeacherById/${teacherId}`,
  getNotifications: teacherId =>
    `${baseURL}/api/notifications/teacher/${teacherId}`,
  getAnnouncements: `${baseURL}/api/announcements`,

  getClassList: schoolId => `${baseURL}/api/class/get/${schoolId}`,
  checkClassTeacher: teacherId => `${baseURL}/api/classTeacher/check/${teacherId}`,
  getAllStudentByClass: className =>
    `${baseURL}/api/student/studentList/${className}`,

  takeAttendance: `${baseURL}/api/studentAttendance/mark`,
  updateAttendance: date=> `${baseURL}/api/studentAttendance/update/${date}`,
  fetchStudentAttendanceByDateAndId: (studentId, date)=>`${baseURL}/api/studentAttendance/${studentId}/${date}`,

  updateFeedbackToPast:(studentId,teacherId)=>`${baseURL}/api/performance/feedback/${studentId}/${teacherId}`,
  createCall: `${baseURL}/api/performance/calls`,
  getCalls: (studentId,teacherId) => `${baseURL}/api/performance/calls/${studentId}/${teacherId}`,

  getClassPeriodByTeacher: (teacherId,today) =>`${baseURL}/api/classPeriods/getAll/${teacherId}?date=${today}`,
  updatePeriods: periodId => `${baseURL}/api/classPeriods/${periodId}`,
  getTasksByPeriods: periodId => `${baseURL}/api/tasks/task/${periodId}`,
  updateTask: taskId => `${baseURL}/api/tasks/task/${taskId}`,
  updatePeriods: periodId => `${baseURL}/api/classPeriods/${periodId}`,

  sendLoginTrack : `${baseURL}/api/teacher/app/loginTrack`,
  sendLogoutTrack : `${baseURL}/api/teacher/app/logoutTrack`,
  getArrangementClass: teacherId => `${baseURL}/api/classPeriods/arrangement/${teacherId}`,
  getSubjectName: subjectId => `${baseURL}/api/subject/${subjectId}`,
  getClassName: classId => `${baseURL}/api/class/classDetail/${classId}`,

  getTimetableByTeacher: teacherId => `${baseURL}/api/classPeriods/timetable/teacher/${teacherId}`,
  getUnresolvedComplaints: teacherId => `${baseURL}/api/complains/referredComplaints/${teacherId}`,
  resolveComplaint: `${baseURL}/api/complains/resolve`,

  calculateAttendanceMonthly: `${baseURL}/api/teacherAttendance/calculate`,
};

export default apiList;
