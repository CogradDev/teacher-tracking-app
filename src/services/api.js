//const baseURL = 'http://192.168.191.165:8080';
const baseURL = "https://cograd-erp-backend.onrender.com";

const apiList = {
  login: `${baseURL}/teacher/app/login`,
  getTeacherById: teacherId => `${baseURL}/teacher/getTeacherById/${teacherId}`,
  getNotifications: teacherId =>
    `${baseURL}/notifications/teacher/${teacherId}`,
  getAnnouncements: `${baseURL}/announcements`,

  getClassList: schoolId => `${baseURL}/class/get/${schoolId}`,
  checkClassTeacher: teacherId => `${baseURL}/classTeacher/check/${teacherId}`,
  getAllStudentByClass: className =>
    `${baseURL}/student/studentList/${className}`,

  takeAttendance: `${baseURL}/studentAttendance/mark`,
  updateAttendance: date=> `${baseURL}/studentAttendance/update/${date}`,
  fetchStudentAttendanceByDateAndId: (studentId, date)=>`${baseURL}/studentAttendance/${studentId}/${date}`,

  updateFeedbackToPast:(studentId,teacherId)=>`${baseURL}/performance/feedback/${studentId}/${teacherId}`,
  createCall: `${baseURL}/performance/calls`,
  getCalls: (studentId,teacherId) => `${baseURL}/performance/calls/${studentId}/${teacherId}`,

  getClassPeriodByTeacher: (teacherId,today) =>`${baseURL}/classPeriods/getAll/${teacherId}?date=${today}`,
  updatePeriods: periodId => `${baseURL}/classPeriods/${periodId}`,
  getTasksByPeriods: periodId => `${baseURL}/tasks/task/${periodId}`,
  updateTask: taskId => `${baseURL}/tasks/task/${taskId}`,
  updatePeriods: periodId => `${baseURL}/classPeriods/${periodId}`,

  sendLoginTrack : `${baseURL}/teacher/app/loginTrack`,
  sendLogoutTrack : `${baseURL}/teacher/app/logoutTrack`,
  getArrangementClass: teacherId => `${baseURL}/classPeriods/arrangement/${teacherId}`,
  getSubjectName: subjectId => `${baseURL}/subject/${subjectId}`,
  getClassName: classId => `${baseURL}/class/classDetail/${classId}`,

  getTimetableByTeacher: teacherId => `${baseURL}/classPeriods/timetable/teacher/${teacherId}`,
  getUnresolvedComplaints: teacherId => `${baseURL}/complains/referredComplaints/${teacherId}`,
  resolveComplaint: `${baseURL}/complains/resolve`,

  calculateAttendanceMonthly: `${baseURL}/teacherAttendance/calculate`,
};

export default apiList;
