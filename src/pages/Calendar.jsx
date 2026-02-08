import React, { useState, useEffect } from 'react';

const Calendar = () => {
  // State for calendar management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: 'Foundation Work', date: '2023-11-05', type: 'construction', project: 'downtown-plaza' },
    { id: 2, title: 'Client Meeting', date: '2023-11-08', type: 'meeting', project: 'residential-complex' },
    { id: 3, title: 'Design Deadline', date: '2023-11-12', type: 'deadline', project: 'highway-bridge' },
    { id: 4, title: 'Safety Inspection', date: '2023-11-15', type: 'inspection', project: 'office-renovation' },
    { id: 5, title: 'Roofing Work', date: '2023-11-18', type: 'construction', project: 'downtown-plaza' },
    { id: 6, title: 'Progress Review', date: '2023-11-22', type: 'meeting', project: 'residential-complex' },
    { id: 7, title: 'Electrical Installation', date: '2023-11-25', type: 'construction', project: 'highway-bridge' },
    { id: 8, title: 'Final Inspection', date: '2023-11-30', type: 'inspection', project: 'office-renovation' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'construction',
    project: '',
    description: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Project options
  const projectOptions = [
    { value: '', label: 'Select a project' },
    { value: 'downtown-plaza', label: 'Downtown Plaza' },
    { value: 'residential-complex', label: 'Residential Complex' },
    { value: 'highway-bridge', label: 'Highway Bridge' },
    { value: 'office-renovation', label: 'Office Renovation' }
  ];

  // Event type options
  const eventTypeOptions = [
    { value: 'construction', label: 'Construction' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'inspection', label: 'Inspection' }
  ];

  // Format date for input fields
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle modal actions
  const openModal = () => {
    setNewEvent({
      title: '',
      date: formatDateForInput(new Date()),
      time: '',
      type: 'construction',
      project: '',
      description: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new event object
    const eventToAdd = {
      ...newEvent,
      id: events.length + 1
    };
    
    // Add to events array
    setEvents([...events, eventToAdd]);
    
    // Close modal and reset form
    setShowModal(false);
    
    // Show notification
    setNotification({ show: true, message: 'Event added successfully!' });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = formatDateForInput(date);
    return events.filter(event => event.date === dateStr);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date)
      });
    }
    
    // Add current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday,
        events: getEventsForDate(date)
      });
    }
    
    // Add next month's leading days
    const totalCells = 42; // 6 rows * 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date)
      });
    }
    
    return days;
  };

  // Get month name
  const getMonthName = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // Get event class based on type
  const getEventClass = (type) => {
    return `event-${type}`;
  };

  // Get event style based on type
  const getEventStyle = (type) => {
    const baseStyle = {
      fontSize: '12px',
      padding: '4px 6px',
      marginBottom: '4px',
      borderRadius: '4px',
      cursor: 'pointer',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
    
    switch(type) {
      case 'construction':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          borderLeft: '3px solid #f59e0b'
        };
      case 'meeting':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          borderLeft: '3px solid #3b82f6'
        };
      case 'deadline':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderLeft: '3px solid #ef4444'
        };
      case 'inspection':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          borderLeft: '3px solid #10b981'
        };
      default:
        return baseStyle;
    }
  };

  // Get legend color style
  const getLegendColorStyle = (type) => {
    switch(type) {
      case 'construction':
        return { backgroundColor: '#f59e0b' };
      case 'meeting':
        return { backgroundColor: '#3b82f6' };
      case 'deadline':
        return { backgroundColor: '#ef4444' };
      case 'inspection':
        return { backgroundColor: '#10b981' };
      default:
        return { backgroundColor: '#000' };
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const days = generateCalendarDays();
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>{getMonthName()}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={prevMonth}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={goToToday}
            >
              Today
            </button>
            <button 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={nextMonth}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>Month</button>
            <button style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>Week</button>
            <button style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>Day</button>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)'
        }}>
          {dayHeaders.map(day => (
            <div key={day} style={{
              padding: '15px 5px',
              textAlign: 'center',
              fontWeight: '600',
              color: '#64748b',
              borderBottom: '1px solid #e2e8f0'
            }}>{day}</div>
          ))}
          
          {days.map((day, index) => (
            <div 
              key={index} 
              style={{
                minHeight: '120px',
                padding: '10px',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
                position: 'relative',
                transition: 'all 0.2s ease',
                backgroundColor: !day.isCurrentMonth ? '#f8fafc' : (day.isToday ? 'rgba(59, 130, 246, 0.05)' : '#ffffff'),
                color: !day.isCurrentMonth ? '#64748b' : '#1e293b'
              }}
            >
              <div style={{
                fontWeight: '600',
                marginBottom: '8px',
                backgroundColor: day.isToday ? '#1e40af' : 'transparent',
                color: day.isToday ? '#ffffff' : 'inherit',
                borderRadius: '50%',
                width: day.isToday ? '28px' : 'auto',
                height: day.isToday ? '28px' : 'auto',
                display: day.isToday ? 'flex' : 'block',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{day.day}</div>
              {day.events.map(event => (
                <div 
                  key={event.id} 
                  style={getEventStyle(event.type)}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '15px 20px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', ...getLegendColorStyle('construction') }}></div>
            <span>Construction</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', ...getLegendColorStyle('meeting') }}></div>
            <span>Meeting</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', ...getLegendColorStyle('deadline') }}></div>
            <span>Deadline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', ...getLegendColorStyle('inspection') }}></div>
            <span>Inspection</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#1e293b', lineHeight: '1.6' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>Project Calendar</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{
            padding: '10px 20px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#1e293b'
          }}>
            <i className="fas fa-filter"></i>
            Filter
          </button>
          <button style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1e40af',
            color: '#ffffff'
          }} onClick={openModal}>
            <i className="fas fa-plus"></i>
            Add Event
          </button>
        </div>
      </div>
      
      {renderCalendar()}
      
      {/* Event Modal */}
      {showModal && (
        <div style={{
          display: 'flex',
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: '1000',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Add New Event</h3>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#64748b',
                cursor: 'pointer'
              }} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }} htmlFor="title">Event Title</label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }} htmlFor="date">Date</label>
                    <input
                      type="date"
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      id="date"
                      name="date"
                      value={newEvent.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }} htmlFor="time">Time</label>
                    <input
                      type="time"
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      id="time"
                      name="time"
                      value={newEvent.time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }} htmlFor="type">Event Type</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    id="type"
                    name="type"
                    value={newEvent.type}
                    onChange={handleInputChange}
                  >
                    {eventTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }} htmlFor="project">Related Project</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    id="project"
                    name="project"
                    value={newEvent.project}
                    onChange={handleInputChange}
                  >
                    {projectOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }} htmlFor="description">Description</label>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter event description"
                  ></textarea>
                </div>
              </form>
            </div>
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button style={{
                padding: '10px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }} onClick={closeModal}>Cancel</button>
              <button style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1e40af',
                color: '#ffffff'
              }} onClick={handleSubmit}>Save Event</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: '2000'
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Calendar;