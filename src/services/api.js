//const baseURL = 'http://192.168.243.165:8080';
const baseURL = "https://cograd-erp-backend.onrender.com";

const apiList = {
  login: `${baseURL}/teacher/app/login`,
  getTeacherById: teacherId => `${baseURL}/teacher/getTeacherById/${teacherId}`,
  getNotifications: teacherId =>
    `${baseURL}/notifications/teacher/${teacherId}`,
  getAnnouncements: teacherId =>
    `${baseURL}/announcements/teacher/${teacherId}`,

  getClassList: schoolId => `${baseURL}/class/get/${schoolId}`,
  checkClassTeacher: teacherId => `${baseURL}/classTeacher/check/${teacherId}`,
  getAllStudentByClass: className =>
    `${baseURL}/student/studentList/${className}`,

  takeAttendance: `${baseURL}/studentAttendance/mark`,
  updateAttendance: date=> `${baseURL}/studentAttendance/update/${date}`,
  fetchStudentAttendanceByDateAndId: (studentId, date)=>`${baseURL}/studentAttendance/${studentId}/${date}`,

  getPastFeedback: studentId =>
    `${baseURL}/performance/feedback/past/${studentId}`,
  getUpcomingFeedback: studentId =>
    `${baseURL}/performance/feedback/upcoming/${studentId}`,
  getPastFeedback: (feedbackId, studentId) =>
    `${baseURL}/performance/feedback/${feedbackId}/${studentId}`,
  createCall: `${baseURL}/performance/calls`,
  getCalls: studentId => `${baseURL}/performance/calls/${studentId}`,

  getClassPeriodByTeacher: teacherId =>
    `${baseURL}/classPeriods/getAll/${teacherId}`,
  updatePeriods: periodId => `${baseURL}/classPeriods/${periodId}`,
  getTasksByPeriods: periodId => `${baseURL}/tasks/task/${periodId}`,
  updateTask: taskId => `${baseURL}/tasks/task/${taskId}`,
  updatePeriods: periodId => `${baseURL}/classPeriods/${periodId}`,

  sendLoginTrack : `${baseURL}/teacher/app/loginTrack`,
  getArrangementClass: teacherId => `${baseURL}/classPeriods/arrangement/${teacherId}`,
  getSubjectName: subjectId => `${baseURL}/subject/${subjectId}`,
  getClassName: classId => `${baseURL}/class/classDetail/${classId}`
};

export default apiList;
