import React, { useState, useReducer, useMemo } from 'react';
import { Calendar, Users, FileSpreadsheet, BookOpen, UserCheck, UserX, UserMinus, GraduationCap } from 'lucide-react';
import * as XLSX from 'xlsx';

const DUMMY_STUDENTS = [
  { id: 1, student_name: "Aarav Sharma", age: 20, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 3 },
  { id: 2, student_name: "Isha Verma", age: 19, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 2 },
  { id: 3, student_name: "Rohan Gupta", age: 21, class_name: "English", instructor_name: "Ms. Kapoor", meetings: 4 },
  { id: 4, student_name: "Priya Nair", age: 18, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 1 },
  { id: 5, student_name: "Karan Patel", age: 22, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 3 },
  { id: 6, student_name: "Neha Singh", age: 19, class_name: "English", instructor_name: "Ms. Kapoor", meetings: 2 },
  { id: 7, student_name: "Vikram Menon", age: 20, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 5 },
  { id: 8, student_name: "Ananya Reddy", age: 18, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 2 },
  { id: 9, student_name: "Siddharth Joshi", age: 23, class_name: "English", instructor_name: "Ms. Kapoor", meetings: 3 },
  { id: 10, student_name: "Meera Iyer", age: 19, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 1 },
  { id: 11, student_name: "Arjun Desai", age: 21, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 4 },
  { id: 12, student_name: "Pooja Bansal", age: 20, class_name: "English", instructor_name: "Ms. Kapoor", meetings: 2 },
  { id: 13, student_name: "Dev Chawla", age: 22, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 3 },
  { id: 14, student_name: "Riya Malhotra", age: 18, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 1 },
  { id: 15, student_name: "Aditya Kulkarni", age: 24, class_name: "English", instructor_name: "Ms. Kapoor", meetings: 2 },
  { id: 16, student_name: "Manish Sinha", age: 19, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 4 },
  { id: 17, student_name: "Shruti Agarwal", age: 21, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 3 },
  { id: 18, student_name: "Lakshmi Krishnan", age: 20, class_name: "English", instructor_name: "Ms. Kapoor", meetings: 1 },
  { id: 19, student_name: "Rahul Bhatia", age: 23, class_name: "Math", instructor_name: "Dr. Mehta", meetings: 2 },
  { id: 20, student_name: "Tanvi Choudhary", age: 25, class_name: "Science", instructor_name: "Prof. Raghavan", meetings: 5 }
];


const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late'];
const CLASSES = ['Math', 'Science', 'English'];
const INSTRUCTORS = ['Dr. Smith', 'Prof. Anderson', 'Ms. Davis'];

// Utility functions
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const generateCalendarDays = (daysAhead = 30) => {
  const today = new Date();
  const days = [];
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};

const isToday = (date) => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

// Scheduling algorithm
const scheduleMeetings = (selectedDates, students) => {
  if (selectedDates.length === 0) return {};
  
  // Sort students by number of meetings (descending) for priority scheduling
  const sortedStudents = [...students].sort((a, b) => b.meetings - a.meetings);
  
  const meetings = {};
  let studentIndex = 0;
  const totalSelectedDates = selectedDates.length;
  
  // Calculate meetings per day based on total students and selected dates
  const totalStudents = students.length;
  const meetingsPerDay = Math.ceil(totalStudents / totalSelectedDates);
  
  selectedDates.forEach((dateStr) => {
    meetings[dateStr] = [];
    
    // Assign meetings for this date
    for (let i = 0; i < meetingsPerDay && studentIndex < sortedStudents.length; i++) {
      const student = sortedStudents[studentIndex];
      const meetingId = `${dateStr}-${student.id}`;
      const meetingLink = `https://meet.example.com/${meetingId}`;
      const randomAttendance = getRandomAttendance();
      
      meetings[dateStr].push({
        id: meetingId,
        student: student,
        meetingLink: meetingLink,
        attendance: randomAttendance
      });
      
      studentIndex++;
    }
  });
  
  return meetings;
};

const getRandomAttendance = () => {
  return ATTENDANCE_STATUSES[Math.floor(Math.random() * ATTENDANCE_STATUSES.length)];
};

// Excel export function
const exportToExcel = (meetings, summary) => {
  const wb = XLSX.utils.book_new();
  
  // Create Overview Sheet
  const overviewData = [
    ['Date', 'Total Meetings', 'Present', 'Absent', 'Late', 'Math', 'Science', 'English', 'Dr. Smith', 'Prof. Anderson', 'Ms. Davis'],
    ...Object.entries(summary.dateSummary).map(([date, data]) => [
      date,
      data.total,
      data.present,
      data.absent,
      data.late,
      data.classes.Math || 0,
      data.classes.Science || 0,
      data.classes.English || 0,
      data.instructors['Dr. Smith'] || 0,
      data.instructors['Prof. Anderson'] || 0,
      data.instructors['Ms. Davis'] || 0
    ])
  ];
  
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, overviewWS, 'Overview');
  
  // Create Date-wise Sheets
  Object.entries(meetings).forEach(([date, dayMeetings]) => {
    const dateData = [
      ['Student Name', 'Age', 'Class Name', 'Instructor Name', 'Required Meetings', 'Meeting Link', 'Attendance'],
      ...dayMeetings.map(meeting => [
        meeting.student.student_name,
        meeting.student.age,
        meeting.student.class_name,
        meeting.student.instructor_name,
        meeting.student.meetings,
        meeting.meetingLink,
        meeting.attendance
      ])
    ];
    
    const dateWS = XLSX.utils.aoa_to_sheet(dateData);
    XLSX.utils.book_append_sheet(wb, dateWS, date);
  });
  
  XLSX.writeFile(wb, 'meeting-schedule.xlsx');
};

// State management
const initialState = {
  selectedDates: [],
  meetings: {},
  currentView: 'calendar'
};

const schedulerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_DATES':
      return { ...state, selectedDates: action.payload };
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'UPDATE_ATTENDANCE':
      const updatedMeetings = { ...state.meetings };
      if (updatedMeetings[action.payload.date]) {
        const meeting = updatedMeetings[action.payload.date].find(
          m => m.id === action.payload.meetingId
        );
        if (meeting) {
          meeting.attendance = action.payload.status;
        }
      }
      return { ...state, meetings: updatedMeetings };
    default:
      return state;
  }
};

// Calendar View Component
const CalendarView = ({ state, dispatch }) => {
  const calendarDays = generateCalendarDays();
  
  const toggleDate = (date) => {
    const dateStr = formatDate(date);
    const newSelectedDates = state.selectedDates.includes(dateStr)
      ? state.selectedDates.filter(d => d !== dateStr)
      : [...state.selectedDates, dateStr].sort();
    
    dispatch({ type: 'SET_SELECTED_DATES', payload: newSelectedDates });
  };

  const generateSchedule = () => {
    const meetings = scheduleMeetings(state.selectedDates, DUMMY_STUDENTS);
    dispatch({ type: 'SET_MEETINGS', payload: meetings });
    dispatch({ type: 'SET_VIEW', payload: 'overview' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Meeting Dates</h2>
        <p className="text-gray-600">Click on dates to select them for scheduling meetings</p>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 max-w-4xl mx-auto">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const dateStr = formatDate(date);
          const isSelected = state.selectedDates.includes(dateStr);
          const isTodayDate = isToday(date);
          
          return (
            <div
              key={index}
              onClick={() => toggleDate(date)}
              className={`
                p-3 text-center cursor-pointer rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }
                ${isTodayDate ? 'ring-2 ring-orange-400' : ''}
              `}
            >
              <div className="font-semibold">{date.getDate()}</div>
              <div className="text-xs opacity-75">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Action Section */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Selected Dates: {state.selectedDates.length}
        </p>
        
        {state.selectedDates.length > 0 && (
          <button
            onClick={generateSchedule}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center mx-auto gap-2"
          >
            <Users size={20} />
            Generate Meeting Schedule
          </button>
        )}
      </div>
    </div>
  );
};

// Overview Page Component
const OverviewPage = ({ state, dispatch, summary }) => {
  const { meetings } = state;

  const handleExportToExcel = () => {
    exportToExcel(meetings, summary);
  };

  const updateAttendance = (date, meetingId, status) => {
    dispatch({
      type: 'UPDATE_ATTENDANCE',
      payload: { date, meetingId, status }
    });
  };

  const getClassBadgeStyle = (className) => {
    switch (className) {
      case 'Math':
        return 'bg-blue-100 text-blue-800';
      case 'Science':
        return 'bg-green-100 text-green-800';
      case 'English':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStyle = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Meeting Schedule Overview</h2>
        <p className="text-gray-600">Comprehensive view of all scheduled meetings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Meetings</p>
              <p className="text-3xl font-bold">
                {Object.values(meetings).reduce((sum, day) => sum + day.length, 0)}
              </p>
            </div>
            <Users size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Present</p>
              <p className="text-3xl font-bold">
                {Object.values(meetings).reduce((sum, day) => 
                  sum + day.filter(m => m.attendance === 'Present').length, 0
                )}
              </p>
            </div>
            <UserCheck size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Absent</p>
              <p className="text-3xl font-bold">
                {Object.values(meetings).reduce((sum, day) => 
                  sum + day.filter(m => m.attendance === 'Absent').length, 0
                )}
              </p>
            </div>
            <UserX size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Late</p>
              <p className="text-3xl font-bold">
                {Object.values(meetings).reduce((sum, day) => 
                  sum + day.filter(m => m.attendance === 'Late').length, 0
                )}
              </p>
            </div>
            <UserMinus size={32} />
          </div>
        </div>
      </div>

      {/* Class & Instructor Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={24} />
            Class Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.classSummary).map(([className, count]) => (
              <div key={className} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{className}</span>
                <span className="text-2xl font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap size={24} />
            Instructor Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.instructorSummary).map(([instructorName, count]) => (
              <div key={instructorName} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{instructorName}</span>
                <span className="text-2xl font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Daily Schedule</h3>
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet size={20} />
            Export to Excel
          </button>
        </div>

        {Object.entries(meetings).map(([date, dayMeetings]) => (
          <div key={date} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{date}</h4>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Total: {dayMeetings.length}</span>
                <span className="text-green-600">
                  Present: {dayMeetings.filter(m => m.attendance === 'Present').length}
                </span>
                <span className="text-red-600">
                  Absent: {dayMeetings.filter(m => m.attendance === 'Absent').length}
                </span>
                <span className="text-yellow-600">
                  Late: {dayMeetings.filter(m => m.attendance === 'Late').length}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Student Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Age</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Class Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Instructor Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Required Meetings</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Meeting Link</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {dayMeetings.map((meeting, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-800">
                        {meeting.student.student_name}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {meeting.student.age}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassBadgeStyle(meeting.student.class_name)}`}>
                          {meeting.student.class_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {meeting.student.instructor_name}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {meeting.student.meetings}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <a
                          href={meeting.meetingLink}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Meeting
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={meeting.attendance}
                          onChange={(e) => updateAttendance(date, meeting.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 ${getAttendanceStyle(meeting.attendance)}`}
                        >
                          {ATTENDANCE_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom hook for state management
const useScheduler = () => {
  const [state, dispatch] = useReducer(schedulerReducer, initialState);
  
  const summary = useMemo(() => {
    const classSummary = {};
    const dateSummary = {};
    const instructorSummary = {};
    
    Object.entries(state.meetings).forEach(([date, dayMeetings]) => {
      dateSummary[date] = {
        total: dayMeetings.length,
        present: dayMeetings.filter(m => m.attendance === 'Present').length,
        absent: dayMeetings.filter(m => m.attendance === 'Absent').length,
        late: dayMeetings.filter(m => m.attendance === 'Late').length,
        classes: {},
        instructors: {}
      };
      
      dayMeetings.forEach(meeting => {
        const className = meeting.student.class_name;
        const instructorName = meeting.student.instructor_name;
        
        // Class summary
        if (!classSummary[className]) {
          classSummary[className] = 0;
        }
        classSummary[className]++;
        
        if (!dateSummary[date].classes[className]) {
          dateSummary[date].classes[className] = 0;
        }
        dateSummary[date].classes[className]++;
        
        // Instructor summary
        if (!instructorSummary[instructorName]) {
          instructorSummary[instructorName] = 0;
        }
        instructorSummary[instructorName]++;
        
        if (!dateSummary[date].instructors[instructorName]) {
          dateSummary[date].instructors[instructorName] = 0;
        }
        dateSummary[date].instructors[instructorName]++;
      });
    });
    
    return { classSummary, dateSummary, instructorSummary };
  }, [state.meetings]);
  
  return { state, dispatch, summary };
};

// Main App Component
const MeetingScheduler = () => {
  const { state, dispatch, summary } = useScheduler();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Calendar className="text-blue-600" size={40} />
            Dynamic Class Meeting Scheduler
          </h1>
          <p className="text-gray-600 text-lg">Schedule and manage student meetings with intelligent prioritization</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-lg">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'calendar' })}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                state.currentView === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Calendar size={20} className="inline mr-2" />
              Calendar
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'overview' })}
              disabled={Object.keys(state.meetings).length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                state.currentView === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : Object.keys(state.meetings).length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Users size={20} className="inline mr-2" />
              Overview
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {state.currentView === 'calendar' ? (
            <CalendarView state={state} dispatch={dispatch} />
          ) : (
            <OverviewPage state={state} dispatch={dispatch} summary={summary} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Built with React.js • Priority scheduling based on required meetings • Excel export with SheetJS</p>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;