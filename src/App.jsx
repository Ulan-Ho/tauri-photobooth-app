// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/tauri";
// import "./App.css";

// function App() {
//   const [greetMsg, setGreetMsg] = useState("");
//   const [name, setName] = useState("");

//   async function greet() {
//     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//     setGreetMsg(await invoke("greet", { name }));
//   }

//   return (
//     <div className="container">
//       <h1>Welcome to Tauri!</h1>

//       <div className="row">
//         <a href="https://vitejs.dev" target="_blank">
//           <img src="/vite.svg" className="logo vite" alt="Vite logo" />
//         </a>
//         <a href="https://tauri.app" target="_blank">
//           <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
//         </a>
//         <a href="https://reactjs.org" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>

//       <p>Click on the Tauri, Vite, and React logos to learn more.</p>

//       <form
//         className="row"
//         onSubmit={(e) => {
//           e.preventDefault();
//           greet();
//         }}
//       >
//         <input
//           id="greet-input"
//           onChange={(e) => setName(e.currentTarget.value)}
//           placeholder="Enter a name..."
//         />
//         <button type="submit">Greet</button>
//       </form>

//       <p>{greetMsg}</p>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage.jsx';
import TemplatePage from './pages/TemplatePage.jsx';
import CapturePage from './pages/CapturePage.jsx';
import PrintPage from './pages/PrintPage.jsx';

import templateSimple from './assets/templateSimple.png';
import templateRul from './assets/templateRul.png';


export default function App(){

  const [design, setDesign] = useState('');
  const [images, setImages] = useState([]);
  const [template, setTemplate] = useState('');
  const templates = [
        { id: 1, name: 'template1', url_png: templateSimple },
        { id: 2, name: 'template2', url_png: templateRul }
    ];

  return (
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />}/>
            <Route path="/template" element={<TemplatePage templates={templates} onSelectDesign={setDesign} onSelectTemplate={setTemplate} />} />
            <Route path="/capture" element={<CapturePage onCapture={setImages} />} />
            <Route path="/print" element={<PrintPage design={design} template={template} images={images} onPrint={() => {}} />} />

            {/* <Route path="/settings" element={<MainSetting />} />
            <Route path="/settings/touchscreen" element={<Touchscreen />} />
            <Route path="/settings/printer" element={<Printer />} />
            <Route path="/settings/power-management" element={<PowerManagement />} />
            <Route path="/settings/chromakey" element={<ChromaKey />} />
            <Route path="/settings/home-screen-editor" element={<HomeScreenEditor />} />
            <Route path="/settings/template-editor" element={<TemplateEditor images={images} />} />
            <Route path="/settings/statistic" element={<Statistic />} /> */}
          </Routes>
        </Router>
      )
};