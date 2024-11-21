import React, { useEffect, useState } from 'react';
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

import templateSimple from './assets/templateSimple.png';
import templateRul from './assets/templateRul.png';
import { listen } from '@tauri-apps/api/event';
import PrinterPopup from './components/PrinterPopup.jsx';
import { invoke } from '@tauri-apps/api';
import { toast, ToastContainer } from 'react-toastify';

export default function App(){
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [showPopup, setShowPopup] = useState(true);
  const [design, setDesign] = useState('');
  const [images, setImages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(loading) setShowPopup(false);
  }, []);

  const handlePrinterSelection = (printerName) => {
    setSelectedPrinter(printerName);
    // invoke("save_selected_printer", { printerName });
  }

  return (
        <>
          <Router>
            <Routes>
              <Route path="/" element={<MainPage active={showPopup} setLoading={setLoading} loading={loading} />}/>
              <Route path="/template" element={<TemplatePage onSelectDesign={setDesign} />} />
              <Route path="/capture" element={<CapturePage onCapture={setImages}/>} />
              <Route path="/print" element={<PrintPage design={design} images={images} onPrint={() => {}} />} />

              <Route path="/settings" element={<Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
              <Route path="/settings/touchscreen" element={<Touchscreen isDarkMode={isDarkMode} />} />
              <Route path="/settings/printer" element={<PrinterInfo isDarkMode={isDarkMode}/>} />
              <Route path="/settings/timer" element={<Timer />} />
              <Route path="/settings/editor" element={<Editor isDarkMode={isDarkMode}/>} />
              <Route path="/settings/template-editor" element={<TemplateEditor isDarkMode={isDarkMode} />} />
              {/* <Route path="/settings/statistic" element={<Statistic />} /> */}
            </Routes>
          </Router>
          {showPopup && (
            <PrinterPopup  onClose={() => setShowPopup(false)} onSelectPrinter={handlePrinterSelection} loading={loading} />
          )}
        </>
      )
};

export function usePageNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const unlisten = listen('navigate-to-page', (event) => {
      const targetPage = event.payload;

      if (targetPage === 'main_page') {
        navigate('/'); // React Router navigation to main page
      } else if (targetPage === 'setting_page') {
        navigate('/settings'); // React Router navigation to settings page
      }
    });

    // Cleanup listener on component unmount
    return () => {
      unlisten.then((off) => off());
    };
  }, [navigate]);
}