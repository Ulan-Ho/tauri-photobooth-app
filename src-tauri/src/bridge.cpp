#include <iostream>
#include <thread>
#include <chrono>
#include "EDSDK.h"
#include "EDSDKTypes.h"
#include "EDSDKErrors.h"

extern "C" {
    EdsError getFirstCamera(EdsCameraRef* camera);
    EdsError downloadImage(EdsDirectoryItemRef directoryItem);
    EdsError EDSCALLBACK handleStateEvent(EdsStateEvent event, EdsUInt32 parameter, EdsVoid* context);
    EdsError EDSCALLBACK handleObjectEvent(EdsObjectEvent event, EdsBaseRef object, EdsVoid* context);
    EdsError EDSCALLBACK handlePropertyEvent(EdsPropertyEvent event, EdsPropertyID property, EdsUInt32 inParam, EdsVoid* context);

    bool eventHasFired = false;  // Флаг для отслеживания события

    int mainC(int argc, char** argv) {
        EdsError err = EDS_ERR_OK;
        EdsCameraRef camera = NULL;
        bool isSDKLoaded = false;
        EdsCapacity capacity = { 0x7FFFFFFF, 0x1000, 1 };
        EdsInt32 saveTarget = kEdsSaveTo_Host;

        // Initialize SDK
        err = EdsInitializeSDK();
        if (err == EDS_ERR_OK) {
            isSDKLoaded = true;
            std::cout << "[LOG] SDK initialized successfully." << std::endl;
        }
        else {
            std::cerr << "[ERROR] Failed to initialize SDK: " << std::hex << err << std::endl;
            return -1;
        }

        // Get first camera
        err = getFirstCamera(&camera);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to get camera: " << std::hex << err << std::endl;
            return -1;
        }
        std::cout << "[LOG] Camera obtained." << std::endl;

        // Open session with camera
        err = EdsOpenSession(camera);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to open session with camera: " << std::hex << err << std::endl;
            return -1;
        }
        std::cout << "[LOG] Camera session opened." << std::endl;

        // Set event handlers
        err = EdsSetObjectEventHandler(camera, kEdsObjectEvent_All, handleObjectEvent, NULL);
        err = EdsSetPropertyEventHandler(camera, kEdsPropertyEvent_All, handlePropertyEvent, NULL);
        err = EdsSetCameraStateEventHandler(camera, kEdsStateEvent_All, handleStateEvent, NULL);

        // Try to set save location to host
        err = EdsSetPropertyData(camera, kEdsPropID_SaveTo, 0, 4, &saveTarget);
        if (err != EDS_ERR_OK) {
            std::cerr << "[WARNING] Failed to set save location to host, falling back to memory card. Error: " << std::hex << err << std::endl;
        }

        // Set camera capacity
        err = EdsSetCapacity(camera, capacity);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to set camera capacity: " << std::hex << err << std::endl;
        }

        // Take picture
        std::cout << "[LOG] Taking picture..." << std::endl;
        do {
            err = EdsSendCommand(camera, kEdsCameraCommand_TakePicture, 0);
            if (err == EDS_ERR_TAKE_PICTURE_AF_NG) {
                std::cerr << "[WARNING] Autofocus failed, retrying..." << std::endl;
                std::this_thread::sleep_for(std::chrono::milliseconds(500));  // Небольшая пауза перед повтором
            }
        } while (err == EDS_ERR_TAKE_PICTURE_AF_NG);

        // Wait for event (download image)
        std::cout << "[LOG] Waiting for event..." << std::endl;
        while (!eventHasFired) {
            err = EdsGetEvent();
            std::this_thread::sleep_for(std::chrono::milliseconds(100)); // Небольшая пауза для обработки событий
        }

        // Close session with camera
        err = EdsCloseSession(camera);
        std::cout << "[LOG] Camera session closed." << std::endl;

        // Release camera
        if (camera != NULL) {
            err = EdsRelease(camera);
            camera = NULL;
        }

        // Terminate SDK
        if (isSDKLoaded) {
            err = EdsTerminateSDK();
            if (err != EDS_ERR_OK) {
                std::cerr << "[ERROR] Failed to terminate SDK: " << std::hex << err << std::endl;
            }
        }

        std::cout << "[LOG] Application terminated." << std::endl;
        return 0;
    }

    EdsError EDSCALLBACK handleObjectEvent(EdsObjectEvent event, EdsBaseRef object, EdsVoid* context) {
        std::cout << "[LOG] Event triggered: 0x" << std::hex << event << std::endl;
        EdsError err = EDS_ERR_OK;

        if (event == kEdsObjectEvent_DirItemRequestTransfer) {
            err = downloadImage(object);
            if (object) {
                EdsRelease(object);
            }
            eventHasFired = true;  // Устанавливаем флаг завершения события
        }
        return err;
    }

    EdsError getFirstCamera(EdsCameraRef* camera) {
        EdsError err;
        EdsCameraListRef cameraList = NULL;
        EdsUInt32 count = 0;

        err = EdsGetCameraList(&cameraList);
        if (err == EDS_ERR_OK) {
            err = EdsGetChildCount(cameraList, &count);
            if (count == 0) {
                std::cerr << "[ERROR] No cameras found." << std::endl;
                return EDS_ERR_DEVICE_NOT_FOUND;
            }
            err = EdsGetChildAtIndex(cameraList, 0, camera);
        }

        // Release the camera list
        if (cameraList != NULL) {
            EdsRelease(cameraList);
        }
        return err;
    }

    EdsError downloadImage(EdsDirectoryItemRef directoryItem) {
        EdsError err = EDS_ERR_OK;
        EdsStreamRef stream = NULL;
        EdsDirectoryItemInfo dirItemInfo;

        // Get directory item information
        err = EdsGetDirectoryItemInfo(directoryItem, &dirItemInfo);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to get directory item info: " << std::hex << err << std::endl;
            return err;
        }

        // Create file stream for transfer destination
        err = EdsCreateFileStream(dirItemInfo.szFileName, kEdsFileCreateDisposition_CreateAlways, kEdsAccess_ReadWrite, &stream);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to create file stream: " << std::hex << err << std::endl;
            return err;
        }

        // Download image
        err = EdsDownload(directoryItem, dirItemInfo.size, stream);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to download image: " << std::hex << err << std::endl;
            return err;
        }

        // Notify that download is complete
        err = EdsDownloadComplete(directoryItem);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to complete download: " << std::hex << err << std::endl;
            return err;
        }

        // Release the stream
        if (stream != NULL) {
            EdsRelease(stream);
            stream = NULL;
        }
        std::cout << "[LOG] Image downloaded successfully." << std::endl;
        return err;
    }
    // Обработчик событий состояния
    EdsError EDSCALLBACK handleStateEvent(EdsStateEvent event, EdsUInt32 parameter, EdsVoid* context) {
        std::cout << "[LOG] State event triggered: 0x" << std::hex << event << std::endl;
        return EDS_ERR_OK;  // Возвращаем успешный результат
    }

    // Обработчик событий свойств
    EdsError EDSCALLBACK handlePropertyEvent(EdsPropertyEvent event, EdsPropertyID property, EdsUInt32 inParam, EdsVoid* context) {
        std::cout << "[LOG] Property event triggered: 0x" << std::hex << property << std::endl;
        return EDS_ERR_OK;  // Возвращаем успешный результат
    }
}
