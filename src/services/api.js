import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000',
});

const baseURL = 'http://localhost:4000';

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
  updateAttendance: `${baseURL}/studentAttendance/update`,

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

  sendLoginTrack : `${baseURL}/teacher/app/loginTrack`,
  getArrangementClass: teacherId => `${baseURL}/classPeriods/teacher/${teacherId}`,
};

export default apiList;
