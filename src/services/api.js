const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async login(username, password, role) {
    try {
      const response = await this.request('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      });

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout.php', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async verifyToken() {
    try {
      const response = await this.request('/auth/verify.php', {
        method: 'POST',
      });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  async getMarks(semester = null) {
    const params = semester ? `?semester=${semester}` : '';
    return this.request(`/student/get_marks.php${params}`);
  }

  async getAttendance(semester = null) {
    const params = semester ? `?semester=${semester}` : '';
    return this.request(`/student/get_attendance.php${params}`);
  }

  async getFees() {
    return this.request('/student/get_fees.php');
  }

  async getPayments() {
    return this.request('/student/get_payments.php');
  }

  async getProfile() {
    return this.request('/student/get_profile.php');
  }

  async markAttendance(data) {
    return this.request('/teacher/mark_attendance.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async enterMarks(data) {
    return this.request('/teacher/enter_marks.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMarks(data) {
    return this.request('/teacher/update_marks.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getStudents(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/teacher/get_students.php${query}`);
  }

  async getAttendanceReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/teacher/get_attendance_report.php${query}`);
  }

  async createStudent(studentData) {
    return this.request('/admin/students/create.php', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(studentData) {
    return this.request('/admin/students/update.php', {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(studentId) {
    return this.request('/admin/students/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ student_id: studentId }),
    });
  }

  async listStudents(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/admin/students/list.php${query}`);
  }

  async createTeacher(teacherData) {
    return this.request('/admin/teachers/create.php', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  async updateTeacher(teacherData) {
    return this.request('/admin/teachers/update.php', {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
  }

  async deleteTeacher(teacherId) {
    return this.request('/admin/teachers/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ teacher_id: teacherId }),
    });
  }

  async listTeachers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/admin/teachers/list.php${query}`);
  }

  async createFee(feeData) {
    return this.request('/admin/fees/create.php', {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
  }

  async updateFee(feeData) {
    return this.request('/admin/fees/update.php', {
      method: 'PUT',
      body: JSON.stringify(feeData),
    });
  }

  async deleteFee(feeId) {
    return this.request('/admin/fees/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ fee_id: feeId }),
    });
  }

  async listFees(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/admin/fees/list.php${query}`);
  }

  async processPayment(paymentData) {
    return this.request('/admin/payments/process.php', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async listPayments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/admin/payments/list.php${query}`);
  }

  async createSubject(subjectData) {
    return this.request('/admin/subjects/create.php', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }

  async updateSubject(subjectData) {
    return this.request('/admin/subjects/update.php', {
      method: 'PUT',
      body: JSON.stringify(subjectData),
    });
  }

  async deleteSubject(subjectId) {
    return this.request('/admin/subjects/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ subject_id: subjectId }),
    });
  }

  async listSubjects(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/admin/subjects/list.php${query}`);
  }

  async createNotice(noticeData) {
    return this.request('/admin/notices/create.php', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  }

  async updateNotice(noticeData) {
    return this.request('/admin/notices/update.php', {
      method: 'PUT',
      body: JSON.stringify(noticeData),
    });
  }

  async deleteNotice(noticeId) {
    return this.request('/admin/notices/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ notice_id: noticeId }),
    });
  }

  async getAllNotices() {
    return this.request('/notices/get_all.php');
  }

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`${this.baseURL}/upload/upload_image.php`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  }

  async downloadPDF(endpoint, filename) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        ...this.getAuthHeader(),
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        let errorMessage = 'Failed to download PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error) {
      console.error('PDF download error:', error);
      throw error;
    }
  }

  async downloadIDCard() {
    const user = this.getCurrentUser();
    const filename = `ID_Card_${user?.username || 'student'}.pdf`;
    return this.downloadPDF('/student/download_id_card.php', filename);
  }

  async downloadReceipt(paymentId) {
    const user = this.getCurrentUser();
    const filename = `Receipt_${paymentId}_${user?.username || 'student'}.pdf`;
    return this.downloadPDF(`/student/download_receipt.php?payment_id=${paymentId}`, filename);
  }

  async downloadPerformanceReport(semester = null) {
    const user = this.getCurrentUser();
    const date = new Date().toISOString().split('T')[0];
    const semesterParam = semester ? `?semester=${semester}` : '';
    const filename = `Performance_Report_${user?.username || 'student'}_${date}.pdf`;
    return this.downloadPDF(`/student/download_performance_report.php${semesterParam}`, filename);
  }

  // ==================== Session Management ====================

  /**
   * Create a new academic session
   * @param {Object} sessionData - Session data
   * @param {string} sessionData.session_name - Session name (e.g., "2024-2025")
   * @param {number} sessionData.start_year - Start year
   * @param {number} sessionData.end_year - End year
   * @param {string} sessionData.start_date - Start date (YYYY-MM-DD)
   * @param {string} sessionData.end_date - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Response with { success, data: { session_id, ...sessionData } }
   */
  async createSession(sessionData) {
    try {
      const response = await this.request('/admin/sessions/create.php', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      return response;
    } catch (error) {
      // Handle validation failures
      if (error.message && error.message.toLowerCase().includes('validation')) {
        throw new Error(`Validation error: ${error.message}`);
      }
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Activate a session (deactivates all other sessions)
   * @param {number} sessionId - Session ID to activate
   * @returns {Promise<Object>} Response with { success, message }
   */
  async activateSession(sessionId) {
    try {
      const response = await this.request('/admin/sessions/activate.php', {
        method: 'PUT',
        body: JSON.stringify({ session_id: sessionId }),
      });
      return response;
    } catch (error) {
      // Handle transaction errors
      if (error.message && error.message.toLowerCase().includes('transaction')) {
        throw new Error('Failed to activate session due to transaction error. Please try again.');
      }
      console.error('Activate session error:', error);
      throw error;
    }
  }

  /**
   * List all academic sessions
   * @returns {Promise<Object>} Response with { success, data: { sessions: [...] } }
   * Sessions are ordered by start_year descending
   */
  async listSessions() {
    try {
      const response = await this.request('/admin/sessions/list.php', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('List sessions error:', error);
      throw error;
    }
  }

  // ==================== Semester Management ====================

  /**
   * Create a new semester within a session
   * @param {Object} semesterData - Semester data
   * @param {number} semesterData.session_id - Parent session ID
   * @param {number} semesterData.semester_number - Semester number (1-6)
   * @param {string} semesterData.start_date - Start date (YYYY-MM-DD)
   * @param {string} semesterData.end_date - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Response with { success, data: { semester_id, ...semesterData } }
   */
  async createSemester(semesterData) {
    try {
      const response = await this.request('/admin/semesters/create.php', {
        method: 'POST',
        body: JSON.stringify(semesterData),
      });
      return response;
    } catch (error) {
      // Handle validation errors
      if (error.message && error.message.toLowerCase().includes('validation')) {
        throw new Error(`Validation error: ${error.message}`);
      }
      console.error('Create semester error:', error);
      throw error;
    }
  }

  /**
   * List semesters for a specific session or all semesters
   * @param {number} [sessionId] - Optional session ID to filter by
   * @returns {Promise<Object>} Response with { success, data: { semesters: [...] } or { semesters_by_session: {...} } }
   */
  async listSemesters(sessionId = null) {
    try {
      const endpoint = sessionId 
        ? `/admin/semesters/list.php?session_id=${sessionId}`
        : '/admin/semesters/list.php';
      
      const response = await this.request(endpoint, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('List semesters error:', error);
      throw error;
    }
  }

  // ==================== Reporting Methods ====================

  /**
   * Get performance report with optional filters
   * @param {Object} filters - Optional filters
   * @param {number} [filters.semester] - Filter by semester
   * @param {string} [filters.department] - Filter by department
   * @param {number} [filters.subject_id] - Filter by subject
   * @returns {Promise<Object>} Response with { success, data: { average_gpa, pass_percentage, subject_stats, department_stats } }
   */
  async getPerformanceReport(filters = {}) {
    try {
      // Build query string from filters object
      const params = new URLSearchParams();
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.department) params.append('department', filters.department);
      if (filters.subject_id) params.append('subject_id', filters.subject_id);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await this.request(`/admin/reports/performance.php${query}`);
      
      // Handle empty results gracefully
      if (response.success && (!response.data || Object.keys(response.data).length === 0)) {
        return {
          success: true,
          data: {
            average_gpa: 0,
            pass_percentage: 0,
            subject_stats: [],
            department_stats: [],
            message: 'No data available for the selected filters'
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Performance report error:', error);
      throw error;
    }
  }

  /**
   * Get financial report with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} [filters.start_date] - Start date (YYYY-MM-DD)
   * @param {string} [filters.end_date] - End date (YYYY-MM-DD)
   * @param {string} [filters.department] - Filter by department
   * @param {string} [filters.fee_type] - Filter by fee type
   * @returns {Promise<Object>} Response with { success, data: { total_collected, total_pending, total_late_fines, fee_breakdown, timeline } }
   */
  async getFinancialReport(filters = {}) {
    try {
      // Validate date format before sending
      if (filters.start_date && !this.isValidDate(filters.start_date)) {
        throw new Error('Invalid start_date format. Use YYYY-MM-DD.');
      }
      if (filters.end_date && !this.isValidDate(filters.end_date)) {
        throw new Error('Invalid end_date format. Use YYYY-MM-DD.');
      }
      
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.department) params.append('department', filters.department);
      if (filters.fee_type) params.append('fee_type', filters.fee_type);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await this.request(`/admin/reports/financial.php${query}`);
      
      return response;
    } catch (error) {
      // Handle date validation errors
      if (error.message && error.message.toLowerCase().includes('date')) {
        throw new Error(`Date validation error: ${error.message}`);
      }
      console.error('Financial report error:', error);
      throw error;
    }
  }

  /**
   * Get trends report for analytics
   * @param {string} metric - Metric type: 'attendance', 'performance', or 'payments'
   * @param {string} period - Period type: 'monthly' or 'semester'
   * @param {Object} filters - Optional additional filters
   * @returns {Promise<Object>} Response with { success, data: { trends, percentage_changes, insights } }
   */
  async getTrendsReport(metric, period, filters = {}) {
    try {
      // Validate metric and period
      const validMetrics = ['attendance', 'performance', 'payments'];
      const validPeriods = ['monthly', 'semester'];
      
      if (!validMetrics.includes(metric)) {
        throw new Error(`Invalid metric. Must be one of: ${validMetrics.join(', ')}`);
      }
      if (!validPeriods.includes(period)) {
        throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
      }
      
      // Build query string
      const params = new URLSearchParams();
      params.append('metric', metric);
      params.append('period', period);
      
      // Add optional filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const query = `?${params.toString()}`;
      const response = await this.request(`/admin/reports/trends.php${query}`);
      
      return response;
    } catch (error) {
      // Handle invalid metric/period errors
      if (error.message && (error.message.includes('Invalid metric') || error.message.includes('Invalid period'))) {
        throw error;
      }
      console.error('Trends report error:', error);
      throw error;
    }
  }

  /**
   * Helper method to validate date format (YYYY-MM-DD)
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    const timestamp = date.getTime();
    
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
    
    return dateString === date.toISOString().split('T')[0];
  }
}

export default new ApiService();
