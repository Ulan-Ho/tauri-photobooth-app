import React, { Children, useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
// import MainPage from './admin/TemplateEditor.jsx';
import MainPage from './pages/MainPage.jsx';
// import MainPage from './ChromaKeyTest.jsx';
import TemplatePage from './pages/TemplatePage.jsx';
import CapturePage from './pages/CapturePage.jsx';
import PrintPage from './pages/PrintPage.jsx';

import Settings from './admin/Settings.jsx';
import Touchscreen from './admin/TouchScreen.jsx';
import PrinterInfo from './admin/Printer.jsx';
import TemplateEditor from './admin/TemplateEditor.jsx';
import Timer from './admin/Timer.jsx';
import Editor from './admin/Editor.jsx';
import Chromakey from './admin/ChromaKey.jsx';
import PrinterPopup from './components/PrinterPopup.jsx';
import { usePageNavigation } from './hooks/usePageNavigation.js';
import ListPage from './pages/ListPage.jsx';
import CheckLicensePage from './pages/CheckLicensePage.jsx';
import { useStore } from './admin/store.js';
import { invoke } from '@tauri-apps/api/tauri';

export function CheckLicense({ children }) {
  const { license, setLicense } = useStore();
  const navigate = useNavigate();

  // const checkLicense = useCallback(async () => {
  //   try {
  //     const state = await invoke('check_license');
  //     console.log(state);
  //     if (!state) navigate('/license');
  //     else setLicense();
  //     console.log('License:', license);
  //   } catch (error) {
  //     navigate('/license');
  //     console.error(error);
  //   }
  // }, [navigate, setLicense]);
  
  // useEffect(() => {
  //   if (!license) checkLicense();
  // }, [checkLicense, license]);

  useEffect(() => {
    if (!license) navigate('/license');
  }, [license, navigate]);

  return license ? children : null;
}

export default function App(){
  const [showPopup, setShowPopup] = useState(false);
  const { license } = useStore();
  const [design, setDesign] = useState(true);
  const [images, setImages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [cameraStatus, setCameraStatus] = useState(false);
  // const [isLiveView, setIsLiveView] = useState(false);

  return (
        <>
          <Router>
            <Routes>
              <Route path="/license" element={<CheckLicensePage />} /> 
              <Route 
                  path="/*"
                  element={
                    <CheckLicense>
                      <>
                        <Routes>
                          <Route path="/" element={<MainPage active={showPopup} setLoading={setLoading} loading={loading} setActive={setShowPopup} design={design}/>}/>
                          <Route path="/template" element={<TemplatePage design={design} setDesign={setDesign} />} />
                          <Route path="/capture" element={<CapturePage onCapture={setImages}/>} />
                          <Route path="/print" element={<PrintPage design={design} images={images} onPrint={() => {}} setDesign={setDesign} />} />
                          <Route path="/list" element={<ListPage />} />

                          <Route path="/settings" element={<Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
                          <Route path="/settings/touchscreen" element={<Touchscreen isDarkMode={isDarkMode} />} />
                          <Route path="/settings/printer" element={<PrinterInfo isDarkMode={isDarkMode} setShowPopup={setShowPopup} setLoading={setLoading} showPopup={showPopup}/>} />
                          <Route path="/settings/timer" element={<Timer />} />
                          <Route path="/settings/editor" element={<Editor isDarkMode={isDarkMode}/>} />
                          <Route path="/settings/template-editor" element={<TemplateEditor isDarkMode={isDarkMode} />} />
                          <Route path="/settings/chromakey" element={<Chromakey />} />
                        </Routes>
                        {showPopup && <PrinterPopup  onClose={() => setShowPopup(false)} loading={loading}/>}

                      </>
                    </CheckLicense>
                  }
              />
            </Routes>
          </Router>
        </>
      )
};
