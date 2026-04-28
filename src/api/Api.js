import axios from 'axios';
const API_BASE_URL = 'http://127.0.0.1:8000/'; // Adjust to your Django backend URL

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Functions


export const authMe = async () => {
  try {
    const response = await api.get('accounts/api/me/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};


export const loginUser = async (username, password) => {

  try {
    const response = await api.post('/accounts/api/login/', { username, password });

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};



export const generateExcelTemplate = async (formdata) => {
  try {
    const response = await api.post('client/excel/template/generation/', formdata);

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};


export const uploadExcel = async (formdata) => {
  try {
    const response = await api.post('client/bulk/upload/', formdata,{
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};


export const whatsappGetTemplate = async () => {
  try {
    const response = await api.get('whatsapp-messages-template-show/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};


export const whatsappSchedulerTemplate = async () => {
  try {
    const response = await api.get('number/type/dropdown/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};


export const chatGet = async () => {
  try {
    const response = await api.get('client/document/from/drive/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const chatGetMembers = async () => {
  try {
    const response = await api.get('accounts/api/client/member/show/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const chatGetMembersdata = async (id) => {
  try {
    const response = await api.get(`client/member/document/from/drive/?client_member_id=${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const TempwhatsappSchedulerTemplate = async () => {
  try {
    const response = await api.get('temporary/client/number/type/dropdown/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};


export const TempwhatsappSchedulerTemplateById = async (id) => {
  try {
    const response = await api.get(`temporary/client/list/by/number/type/?number_type=${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const whatsappSchedulerTemplateById = async (id) => {
  try {
    const response = await api.get(`client/list/by/number/type/?number_type_id=${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};


export const WhatsappTemplateType = async () => {
  try {
    const response = await api.get('whatsapp-messages-template-show/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const WhatsappTemplateTypeById = async (id) => {
  try {
    const response = await api.get(`whatsapp-messages-template-show/by/ID/?template_id=${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const UserDocumentGet = async ({ page = 1, search = '' } = {}) => {
  try {
    const response = await api.get('client/uploaded/documents/', {
      params: {
        page,
        search
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch documents' };
  }
};

export const UserFetchDocumentGet= async ({ page = 1, search = '',page_size = 3 } = {}) => {
  try {
    const response = await api.get('client/uploaded/documents/for/admin/all/client/', {
      params: {
        page,
        search,
        page_size
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch documents' };
  }
};

export const UserFetchDocumentGet2= async ({ page = 1, search = '' } = {}) => {
  try {
    const response = await api.get('not/visited/client/documents/', {
      params: {
        page,
        search
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch documents' };
  }
};

export const SidebarCountForDocs = async () => {
  try {
    const response = await api.get(`not/visited/document/count/sidebar/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};

export const UserFetchDocumentPost = async (formData) => {
  try {
    const response = await api.post('client/documents/visited/by/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};


export const whatsappGetTemplateById = async (id) => {
  try {
    const response = await api.get(`whatsapp-messages-template-show/by/ID/?template_id=${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to generate template' };
  }
};


export const createwhatsappTemplate = async (formData) => {
  try {
    const response = await api.post('whatsapp-messages-template-create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};

export const sendWhatsAppMessage = async (formData) => {
  try {
    const response = await api.post('/whasapp/message/send/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};


export const clientRegister = async (formData) => {
  try {
    const response = await api.post('accounts/api/signup/client/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};


export const uploadDocuments = async (formData) => {
  try {
    const response = await api.post('client/documents/upload/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};

export const guidelinesDocument = async (formData) => {
  try {
    const response = await api.post('guideline/document/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};


export const permissionGrant = async (formData) => {
  const accessToken=sessionStorage.getItem('access_token');
  try {
   const response = await api.post('accounts/api/roles/', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp message' };
  }
};

export const getWhatsAppMessages = async (params = {}) => {
  try {
    const response = await api.get('/whasapp/message/list/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch messages' };
  }
};

export const getWhatsAppMessageDetail = async (id) => {
  try {
    const response = await api.get(`/whasapp/message/list/detail/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch message details' };
  }
};

export const getNews = async (id = null) => {
  try {
    const url = id ? `/news/show/${id}/` : '/news/show/';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch news' };
  }
};

export const addNews = async (data) => {
  try {
    const response = await api.post('/news/add/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to add news' };
  }
};

export const editNews = async (id, data) => {
  try {
    const response = await api.put(`/news/edit/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to edit news' };
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/news/delete/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete news' };
  }
};

export const registerAdmin = async (data) => {
  try {
    const response = await api.post('/api/register/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to register admin' };
  }
};

export const updateAdmin = async (id, data) => {
  try {
    const response = await api.put(`/api/update/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update admin' };
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/api/userdelete/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete admin' };
  }
};

export const getAdmins = async ({page,search}) => {
  try {
    const response = await api.get('accounts/api/staff/',{
       params: {
        page,
        search
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};


export const getClient = async ({page,search}) => {
  try {
    const response = await api.get('accounts/api/client/',{
       params: {
        page,
        search
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};




export const TempgetClientTab = async () => {
  try {
    const response = await api.get('temporary/client/number/type/dropdown/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};


export const TempgetClient = async (tabValue,page,search) => {
  try {
    const response = await api.get(`/temporary/client/list/by/number/type/?number_type=${tabValue}`,
      {
        params: {
        page,
        search
      }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};

export const TempallgetClient = async (page,search) => {
  try {
    const response = await api.get(`accounts/api/temporary/client/list/`,
      {
        
        params: {
        page,
        search
      }
      
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};



export const getAllDocuments = async () => {
  try {
    const response = await api.get(`guideline/documents/in/tab/`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};


export const getUnverifydocuments = async () => {
  try {
    const response = await api.get(`accounts/api/deleted/client/member/list/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};

export const getTaxReminder = async (params = {}) => {
  try {
    const response = await api.get(`tax-reminder-messages/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch tax reminders' };
  }
};

export const getClientDocuments = async (params = {}) => {
  try {
    const response = await api.get(`client/uploaded/documents/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch tax reminders' };
  }
};

export const getClientMemberTab = async (params = {}) => {
  try {
    const response = await api.get(`guideline/documents/in/tab/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch tax reminders' };
  }
};

export const getMemberDocumentsbyid = async (id) => {
  try {
    const response = await api.get(`guideline/document/retrieve/${id}/`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};


export const getAllDocumentsbyid = async (id) => {
  try {
    const response = await api.get(`guideline/document/retrieve/${id}/`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch admins' };
  }
};

export const refreshToken = async (refresh) => {
  try {
    const response = await api.post('/api/token/refresh/', { refresh });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};


export const ConvertToPermanentAPI = async (data) => {
  try {
    const response = await api.post('accounts/api/bulk/create/client/from/temp/client/ids/', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};


export const AddMemberApi = async (data) => {
  try {
    const response = await api.post('accounts/api/client/member/create/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};


export const Verifymember = async (data) => {
  try {
    const response = await api.post('accounts/api/client/member/verify/post/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};

export const Unverifymember = async (data) => {
  try {
    const response = await api.post('accounts/api/delete/client/member/admin/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};

export const ShowMemberApi = async () => {
  try {
    const response = await api.get('accounts/api/client/member/show/')
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};


export const ShowUnverifiedMemberApi = async () => {
  try {
    const response = await api.get('accounts/api/client/member/show/unverified/')
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to refresh token' };
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await api.post('/api/token/verify/', { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Invalid token' };
  }
};