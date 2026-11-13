/**
 * JDCOEM Digital Document Portal V2 - Unified API Client
 * Seamlessly interfaces with Express 5 TypeScript Backend (Port 4000)
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.text()) as unknown as T;
}

/* ── 1. AUTHENTICATION API ── */
export const authApi = {
  login: async (email: string, password?: string) => {
    return request<{ success: boolean; requires_otp: boolean; token?: string; user?: any; message?: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  verifyOtp: async (email: string, otp: string) => {
    return request<{ success: boolean; token: string; user: any; message?: string }>(
      '/auth/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }
    );
  },

  register: async (data: Record<string, any>) => {
    return request<{ success: boolean; message: string; user_id?: number }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  me: async () => {
    return request<{ success: boolean; user: any }>('/auth/me');
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' });
  },
};

/* ── 2. APPLICATIONS API ── */
export const applicationApi = {
  create: async (data: Record<string, any>) => {
    return request<{ success: boolean; message: string; application_id: number; application_number: string }>(
      '/application/create',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getMy: async (studentId?: number) => {
    const query = studentId ? `?student_id=${studentId}` : '';
    return request<{ success: boolean; data: any[] }>(`/application/my${query}`);
  },

  getById: async (id: number | string) => {
    return request<{ success: boolean; data: any }>(`/application/view?id=${id}`);
  },

  trackStatus: async (ref: string) => {
    return request<{ success: boolean; data: any }>(`/application/status?application_number=${encodeURIComponent(ref)}`);
  },

  getProgress: async (id: number | string) => {
    return request<{ success: boolean; stages: any[]; current_status: string }>(`/application/progress?id=${id}`);
  },

  getTimeline: async (id: number | string) => {
    return request<{ success: boolean; data: any[] }>(`/application/timeline?id=${id}`);
  },
};

/* ── 3. APPROVAL CHAIN API (CLERK / HOD / PRINCIPAL) ── */
export const approvalApi = {
  // Clerk
  getClerkPending: async (department?: string) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request<{ success: boolean; data: any[] }>(`/application/clerk-pending${query}`);
  },

  clerkApprove: async (applicationId: number | string, remarks: string) => {
    return request<{ success: boolean; message: string }>('/application/clerk-approve', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, remarks }),
    });
  },

  clerkReject: async (applicationId: number | string, reason: string) => {
    return request<{ success: boolean; message: string }>('/application/clerk-reject', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, reason }),
    });
  },

  // HOD
  getHodPending: async (department?: string) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request<{ success: boolean; data: any[] }>(`/application/hod-pending${query}`);
  },

  hodApprove: async (applicationId: number | string, remarks: string) => {
    return request<{ success: boolean; message: string }>('/application/hod-approve', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, remarks }),
    });
  },

  hodReject: async (applicationId: number | string, reason: string) => {
    return request<{ success: boolean; message: string }>('/application/hod-reject', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, reason }),
    });
  },

  // Principal (Institutional)
  getPrincipalPending: async (department?: string) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request<{ success: boolean; data: any[] }>(`/application/principal-pending${query}`);
  },

  principalApproveFinal: async (applicationId: number | string, remarks: string) => {
    return request<{
      success: boolean;
      message: string;
      certificate_number: string;
      file_path: string;
      hash: string;
    }>('/application/principal-approve-final', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, remarks }),
    });
  },

  principalReject: async (applicationId: number | string, reason: string) => {
    return request<{ success: boolean; message: string }>('/application/principal-reject', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, reason }),
    });
  },

  // Admin Stats
  getStats: async (department?: string) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request<{ success: boolean; stats: any }>(`/application/stats${query}`);
  },
};

/* ── 4. CERTIFICATES & VERIFICATION API ── */
export const certificateApi = {
  getDownloadUrl: (applicationId: number | string) => {
    return `/api/certificate/download?application_id=${applicationId}`;
  },

  verify: async (certNumber: string) => {
    return request<{ success: boolean; verified: boolean; data: any; message?: string }>(
      `/certificate/verify?cert=${encodeURIComponent(certNumber)}`
    );
  },

  verifyHash: async (hash: string) => {
    return request<{ success: boolean; verified: boolean; certificate?: any; message?: string }>(
      '/certificate/verify-hash',
      {
        method: 'POST',
        body: JSON.stringify({ hash }),
      }
    );
  },
};

/* ── 5. NOTIFICATIONS API ── */
export const notificationApi = {
  getMy: async (userId?: number) => {
    const query = userId ? `?user_id=${userId}` : '';
    return request<{ success: boolean; data: any[] }>(`/notifications/my${query}`);
  },

  getUnreadCount: async (userId?: number) => {
    const query = userId ? `?user_id=${userId}` : '';
    return request<{ success: boolean; count: number }>(`/notifications/unread-count${query}`);
  },

  markRead: async (id: number, userId?: number) => {
    return request<{ success: boolean; message: string }>('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notification_id: id, user_id: userId }),
    });
  },

  markAllRead: async (userId?: number) => {
    return request<{ success: boolean; message: string }>('/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

/* ── 6. STUDENT PROFILE API ── */
export const studentApi = {
  getProfile: async (userId?: number) => {
    const query = userId ? `?user_id=${userId}` : '';
    return request<{ success: boolean; data: any }>(`/student/profile${query}`);
  },

  updateProfile: async (data: Record<string, any>) => {
    return request<{ success: boolean; message: string }>('/student/profile/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

