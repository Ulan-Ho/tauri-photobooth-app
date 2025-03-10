import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listen } from '@tauri-apps/api/event';
import { useStore } from '../admin/store';

export function usePageNavigation() {
    const navigate = useNavigate();
    const { canvases, currentCanvasId, updateObjectProps, isLiveView, cameraStatus, updateCameraStatus, updateLiveViewStatus, chromokeyBackgroundImage, chromokeyStatus } = useStore();
  
    useEffect(() => {
      const unlisten = listen('navigate-to-page', (event) => {
        const targetPage = event.payload;
  
        if (targetPage === 'main_page') {
          navigate('/'); // React Router navigation to main page
        } else if (targetPage === 'setting_page') {
          navigate('/settings'); // React Router navigation to settings page
        }
      });
  
      const cameraStatusCheck = async () => {
        if (cameraStatus) {
          await invoke('end_camera');
        }
      }
  
      cameraStatusCheck();
      // Cleanup listener on component unmount
      return () => {
        unlisten.then((off) => off());
      };
    }, [navigate, cameraStatus]);
  }
