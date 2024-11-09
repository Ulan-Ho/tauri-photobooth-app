#include <EDSDK.h>
#include <EDSDKErrors.h>
#include <EDSDKTypes.h>
#include <iostream>
#include <vector>
#include <memory>
#include <cstring>
#include <sstream>
#include <cstring>
#include <iomanip>

#include <thread> 
#include <chrono>

#include <atomic>

bool isLiveViewStarted = false;
bool eventHasFired = false;
std::atomic<bool> stopLiveViewFlag(false);

extern "C" {
    EdsError downloadImage(EdsDirectoryItemRef directoryItem, const std::string& fileName);
    EdsError EDSCALLBACK handleStateEvent(EdsStateEvent event, EdsUInt32 parameter, EdsVoid* context);
    EdsError EDSCALLBACK handleObjectEvent(EdsObjectEvent event, EdsBaseRef object, EdsVoid* context);
    EdsError EDSCALLBACK handlePropertyEvent(EdsPropertyEvent event, EdsPropertyID property, EdsUInt32 inParam, EdsVoid* context);

    EdsCameraListRef cameraList = nullptr;
    EdsCameraRef camera = nullptr;

    // Функция очистки ресурсов
    void cleanup(EdsCameraRef camera, EdsCameraListRef cameraList) {
        if (camera) EdsRelease(camera);
        if (cameraList) EdsRelease(cameraList);
    }
    void checkError(EdsError err, const char* errorMsg) {
        if (err != EDS_ERR_OK) {
            std::cerr << "Error: " << errorMsg << " Code: " << err << std::endl;
            // exit(EXIT_FAILURE);
        }
    }
// Функция для кодирования данных в Base64
    std::string base64_encode(const unsigned char* data, size_t input_length) {
        static const char table[] =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "abcdefghijklmnopqrstuvwxyz"
            "0123456789+/";
        std::string output;
        output.reserve(((input_length + 2) / 3) * 4);

        for (size_t i = 0; i < input_length; i += 3) {
            size_t remaining = input_length - i;
            unsigned char a = data[i];
            unsigned char b = remaining > 1 ? data[i + 1] : 0;
            unsigned char c = remaining > 2 ? data[i + 2] : 0;

            output.push_back(table[(a >> 2) & 0x3F]);
            output.push_back(table[((a & 0x03) << 4) | (b >> 4) & 0x0F]);
            output.push_back(remaining > 1 ? table[((b & 0x0F) << 2) | (c >> 6) & 0x03] : '=');
            output.push_back(remaining > 2 ? table[c & 0x3F] : '=');
        }
        return output;
    }
    
    EdsError downloadEvfImage(unsigned char** out_data, size_t* out_length){
        EdsError err = EDS_ERR_OK;
        EdsStreamRef stream = NULL;
        EdsEvfImageRef evfImage = NULL;

        // Создаем поток памяти
        err = EdsCreateMemoryStream(0, &stream);
        if (err != EDS_ERR_OK) return err;
        // std::cout << "Create memory" << std::endl;


        // Создаем EvfImageRef
        err = EdsCreateEvfImageRef(stream, &evfImage);
        if (err != EDS_ERR_OK) return err;
        // std::cout << "Create image ref" << std::endl;

        // Загружаем изображение
        err = EdsDownloadEvfImage(camera, evfImage);
        if (err != EDS_ERR_OK) return err;
        // std::cout << "Download image" << std::endl;

        // Получаем длину данных
        EdsUInt64 length = 0;
        err = EdsGetLength(stream, &length);
        if (err != EDS_ERR_OK || length == 0) return err;
        // std::cout << "Find size length" << std::endl;

        // Получаем указатель на данные
        EdsVoid* dataPtr = nullptr;
        err = EdsGetPointer(stream, &dataPtr);
        if (err != EDS_ERR_OK || dataPtr == nullptr) return err;
        // std::cout << "Find void" << std::endl;

        // Выделяем память для данных в Rust
        *out_length = static_cast<size_t>(length);
        *out_data = static_cast<unsigned char*>(malloc(*out_length));
        memcpy(*out_data, dataPtr, *out_length);
        // std::cout << "Copy image" << std::endl;

        // Освобождаем ресурсы
        EdsRelease(stream);
        EdsRelease(evfImage);

        return err;
    }
    // Функция для освобождения памяти
    void free_image_data(unsigned char* data) {
        if (data != nullptr) {
            std::cout << "FREEE" << std::endl;
            free(data);
        }
    }

    void startLiveView(){
        stopLiveViewFlag = false;
        if (!isLiveViewStarted){
            isLiveViewStarted = true;
            EdsError err = EdsInitializeSDK();
            if (err != EDS_ERR_OK) {
                checkError(err, "Error to initialize SDK");
            }
            std::cout << "SDK initialized" << std::endl;

            // Получаем список камер
            err = EdsGetCameraList(&cameraList);
            if (err != EDS_ERR_OK) {
                EdsTerminateSDK();
                checkError(err, "Error to get camera List");
            }
            std::cout << "Camera list obtained" << std::endl;

            // Проверяем, есть ли подключенные камеры
            EdsUInt32 cameraCount = 0;
            err = EdsGetChildCount(cameraList, &cameraCount);
            if (err != EDS_ERR_OK || cameraCount == 0) {
                cleanup(nullptr, cameraList);
                EdsTerminateSDK();
                checkError(err, "Error to connect camera");
            }
            std::cout << "Camera count: " << cameraCount << std::endl;

            // Получаем первую камеру из списка
            err = EdsGetChildAtIndex(cameraList, 0, &camera);
            if (err != EDS_ERR_OK) {
                cleanup(nullptr, cameraList);
                EdsTerminateSDK();
                checkError(err, "Error to get first camera");
            }
            std::cout << "Camera obtained" << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(200));

            // Открываем сессию с камерой
            err = EdsOpenSession(camera);
            if (err != EDS_ERR_OK) {
                cleanup(camera, cameraList);
                EdsTerminateSDK();
                checkError(err, "Error to open Session");
            }
            std::cout << "Session opened" << std::endl;

            std::this_thread::sleep_for(std::chrono::milliseconds(200));
            // Запускаем режим live view
            EdsUInt32 device = 0;
            err = EdsGetPropertyData(camera, kEdsPropID_Evf_OutputDevice, 0, sizeof(device), &device);
            std::cout << "Current output device: " << device << std::endl;
            if (device & kEdsEvfOutputDevice_PC) {
                std::cout << "Live view is already active." << std::endl;
            } else {
                device |= kEdsEvfOutputDevice_PC;  // Enable live view output to PC

                err = EdsSetPropertyData(camera, kEdsPropID_Evf_OutputDevice, 0, sizeof(device), &device);
                std::cout << "Current output device: " << device << std::endl;

                checkError(err, "Failed to set live view output device");
            }
            std::cout << "Live view started" << std::endl;
        }
    }
    void stopLiveView() {
        stopLiveViewFlag = true;
        if (isLiveViewStarted) {
            EdsError err;

            // Disable live view output to PC
            EdsUInt32 device = 0;
            err = EdsGetPropertyData(camera, kEdsPropID_Evf_OutputDevice, 0, sizeof(device), &device);
            checkError(err, "Failed to get current output device");

            if (device & kEdsEvfOutputDevice_PC) {
                device &= ~kEdsEvfOutputDevice_PC;  // Disable PC live view output
                err = EdsSetPropertyData(camera, kEdsPropID_Evf_OutputDevice, 0, sizeof(device), &device);
                checkError(err, "Failed to disable live view output device");
            }

            std::cout << "Live view stopped" << std::endl;

            // Close the session with the camera
            err = EdsCloseSession(camera);
            checkError(err, "Failed to close camera session");

            // Release camera and camera list resources
            cleanup(camera, cameraList);

            // Terminate the SDK
            EdsTerminateSDK();
            std::cout << "SDK terminated" << std::endl;

            isLiveViewStarted = false;
        } else {
            std::cout << "Live view is not started" << std::endl;
        }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Функция для захвата фото
    void capturePhoto() { 
        EdsCapacity capacity = { 0x7FFFFFFF, 0x1000, 1 };
        EdsInt32 saveTarget = kEdsSaveTo_Host;

        EdsError err = EdsSetObjectEventHandler(camera, kEdsObjectEvent_All, handleObjectEvent, NULL);
        err = EdsSetPropertyEventHandler(camera, kEdsPropertyEvent_All, handlePropertyEvent, NULL);
        err = EdsSetCameraStateEventHandler(camera, kEdsStateEvent_All, handleStateEvent, NULL);

        // Попытка установить место сохранения на хост
        EdsInt32 af_mode = 1;
        err = EdsSetPropertyData(camera, kEdsPropID_AFMode, 0, 4, &af_mode);
        err = EdsSetPropertyData(camera, kEdsPropID_SaveTo, 0, 4, &saveTarget);
        if (err != EDS_ERR_OK) {
            std::cerr << "[WARNING] Failed to set save location to host, falling back to memory card. Error: " 
                    << std::hex << err << std::endl;
        }

        // Установка емкости камеры
        err = EdsSetCapacity(camera, capacity);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to set camera capacity: " << std::hex << err << std::endl;
        }

        // Захват фото
        
        // err = EdsSetPropertyData(camera, kEdsPropID_AFMode, 0, 4, &saveTarget);
        std::cout << "[LOG] Taking picture..." << std::endl;
        err = EdsSendCommand(camera, kEdsCameraCommand_TakePicture, 0);
        // err = EdsSendCommand(camera, kEdsCameraCommand_PressShutterButton, kEdsCameraCommand_ShutterButton_OFF);
        checkError(err, "Failed to take picture");
            

        // Ожидание события для загрузки изображения
        std::cout << "[LOG] Waiting for event..." << std::endl;
        while (!eventHasFired) {
            err = EdsGetEvent();
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
        eventHasFired = false;
    }

    // Функция для загрузки изображения с заданным именем файла
    EdsError downloadImage(EdsDirectoryItemRef directoryItem, const std::string& fileName) {
        EdsError err = EDS_ERR_OK;
        EdsStreamRef stream = NULL;
        EdsDirectoryItemInfo dirItemInfo;

        // Получение информации о файле
        err = EdsGetDirectoryItemInfo(directoryItem, &dirItemInfo);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to get directory item info: " << std::hex << err << std::endl;
            return err;
        }

        // Создание потока файла с пользовательским именем
        err = EdsCreateFileStream(fileName.c_str(), kEdsFileCreateDisposition_CreateAlways, 
                                kEdsAccess_ReadWrite, &stream);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to create file stream: " << std::hex << err << std::endl;
            return err;
        }

        // Загрузка изображения
        err = EdsDownload(directoryItem, dirItemInfo.size, stream);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to download image: " << std::hex << err << std::endl;
            return err;
        }

        // Завершение загрузки
        err = EdsDownloadComplete(directoryItem);
        if (err != EDS_ERR_OK) {
            std::cerr << "[ERROR] Failed to complete download: " << std::hex << err << std::endl;
            return err;
        }

        // Освобождение ресурсов
        if (stream != NULL) {
            EdsRelease(stream);
            stream = NULL;
        }
        std::cout << "[LOG] Image downloaded successfully." << std::endl;
        return err;
    }

    // Обработчик события для загрузки изображения
    EdsError EDSCALLBACK handleObjectEvent(EdsObjectEvent event, EdsBaseRef object, EdsVoid* context) {
        // std::cout << "[LOG] Event triggered: 0x" << std::hex << event << std::endl;
        EdsError err = EDS_ERR_OK;
        
        if (event == kEdsObjectEvent_DirItemRequestTransfer) {
            std::string fileName = "image_alltime_usable.jpg";

            err = downloadImage(object, fileName);
            if (object) {
                EdsRelease(object);
            }
            eventHasFired = true;  // Установка флага завершения события
        }
        return err;
    }

    // Обработчик состояния
    EdsError EDSCALLBACK handleStateEvent(EdsStateEvent event, EdsUInt32 parameter, EdsVoid* context) {
        // std::cout << "[LOG] State event triggered: 0x" << std::hex << event << std::endl;
        return EDS_ERR_OK;
    }

    // Обработчик событий свойств
    EdsError EDSCALLBACK handlePropertyEvent(EdsPropertyEvent event, EdsPropertyID property, EdsUInt32 inParam, EdsVoid* context) {
        // std::cout << "[LOG] Property event triggered: 0x" << std::hex << property << std::endl;
        return EDS_ERR_OK;
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // std::string getLiveViewImage() {
    //     return downloadEvfImage();
    // }
}