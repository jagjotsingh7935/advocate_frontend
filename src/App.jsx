import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CircularProgress, Typography } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import WhatsAppMessageSend from './components/WhatsAppMessageSend';
import WhatsAppMessageList from './components/WhatsAppMessageList';
import WhatsAppMessageDetail from './components/WhatsAppMessageDetail';
import NewsShow from './components/NewsShow';
import NewsAdd from './components/NewsAdd';
import NewsEdit from './components/NewsEdit';
import NewsDelete from './components/NewsDelete';
import AdminList from './components/AdminList';
import AdminUpdate from './components/AdminUpdate';
import AdminDelete from './components/AdminDelete';
import GenerateExcelTemplate from './components/GenerateExcelTemplate';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import UserUploadDocument from './components/UserUploadDocument';
import UserDocument from './components/UserDocument';
import MyContextProvider from './usercontext/context';
import Permissions from './components/Permissions';
import RegisterClient from './components/RegisterClient';
import TaxReminderMessages from './components/TaxReminderMessages';
import { authMe } from './api/Api';
import useMyContext from './usercontext/useMyContext';
import WhatsappMessageTemplate from './components/WhatsappMessageTemplate';
import ExcelClient from './components/ExcelClient';
import Whatsappscheduler from './components/Whatsappscheduler';
// import Sidebar from './sidebar';
import './App.css';
import UserFetchDocument from './components/UserFetchDocuments';
import TemporaryWhatsAppScheduler from './components/TemporaryWhatsAppScheduler';
import ClientList from './components/ClientList';
import TempClientList from './components/TempClient';
import UnverifiedMembers from './components/UnverifiedMembers';
import ClientProfile from './components/ClientProfile';
import GuidelinesCreate from './components/GuidelinesCreate';
import RegisterClientAdmin from './components/RegisterClientAdmin';
import AIAssistant from './components/AIAssistant';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0891b2',
    },
    secondary: {
      main: '#64748b',
    },
   
    
  },
 
 
});

// Layout component for routes with Sidebar
const MainLayout = ({ children }) => (
  <Sidebar>
    {children}
  </Sidebar>
);

// Protected Route component to restrict access to authenticated users
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    // Redirect to login and save the intended route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function GoogleTranslate() {
  useEffect(() => {
    // Avoid multiple script loads
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // Callback must be global for Google API
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,pa,bn,gu,ta,te,mr,ml', // customize your supported languages
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };
  }, []);
  

  return (
    <div
      id="google_translate_element"
      style={{
        position: 'fixed',
        top: '20px',
        right: '100px',
        zIndex: 9999,
      }}
    />
  );
}
function App() {

  return (
    <MyContextProvider>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <InitAuth/>
          <GoogleTranslate /> 

        <Routes>
          {/* Login as the default route */}
          <Route path="/login" element={<Login />} />
          <Route path="/registerclient" element={<RegisterClient/>} />

          
          {/* Protected Routes with Sidebar */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp/send"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WhatsAppMessageSend />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp/list"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WhatsAppMessageList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/unverified"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UnverifiedMembers/>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientProfile/>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/guide"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GuidelinesCreate/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp/list/detail/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WhatsAppMessageDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Permissions/>
                </MainLayout>
              </ProtectedRoute>
            }
          />

           <Route
            path="/clientlist"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientList/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/news/show"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NewsShow />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/news/add"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NewsAdd />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/news/edit/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NewsEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/tempscheduler"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TemporaryWhatsAppScheduler/>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tempclientlist"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TempClientList/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/news/delete/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NewsDelete />
                </MainLayout>
              </ProtectedRoute>
            }
          />


<Route
            path="/fetchdocuments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserFetchDocument/>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/list"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/update/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminUpdate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delete/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminDelete />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-template"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GenerateExcelTemplate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
            <Route
            path="/admin/documents"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Chat/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
            <Route
            path="/client/registration/admin"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RegisterClientAdmin/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
            <Route
            path="/user-upload-document"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserUploadDocument/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
            <Route
            path="/user-document"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserDocument/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapptemplate"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WhatsappMessageTemplate/>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/excelclient"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ExcelClient/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduler"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Whatsappscheduler/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tax/reminder/message"
            element={
                <MainLayout>
                  <TaxReminderMessages />
                </MainLayout>
            }
          />
          {/* Redirect root and any unmatched routes to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <AIAssistant/>
      </ThemeProvider>
    </BrowserRouter>
    </MyContextProvider>
  );
}

function InitAuth() {
  const { updateState,authme,updateAuthMe } = useMyContext();

  useEffect(() => {
    const fetchData = async () => {
      const res = await authMe();
      console.log('AuthMe response:', res); // Log the response from authMe
      if(res){
        console.log('inside'); // Log the authme data
 updateAuthMe(res);
 console.log('AuthMe state updated:',authme); // Log the updated authme state
      if (res.is_client) {
        updateState("client");
      } else if (res.is_staff) {
        updateState("staff");
      } else {
        updateState("admin");
      }

      }
     
    };
    fetchData();
  }, []);

  return null; // nothing to render, just run effect
}
export default App;