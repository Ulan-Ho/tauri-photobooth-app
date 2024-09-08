#include <iostream>
#include "EDSDK.h" // Подключаем заголовочный файл SDK Canon

extern "C" {
    // Функция для получения и вывода списка камер
void printCameraList() {
    EdsCameraListRef cameraList = nullptr;
    EdsError err = EdsGetCameraList(&cameraList); // Получаем список камер

    if (err == EDS_ERR_OK) {
        EdsUInt32 cameraCount = 0;
        err = EdsGetChildCount(cameraList, &cameraCount); // Получаем количество камер
        if (err == EDS_ERR_OK && cameraCount > 0) {
            std::cout << "Найдено камер: " << cameraCount << std::endl;
            for (EdsUInt32 i = 0; i < cameraCount; i++) {
                EdsCameraRef camera = nullptr;
                err = EdsGetChildAtIndex(cameraList, i, &camera); // Получаем камеру по индексу
                if (err == EDS_ERR_OK) {
                    // Получаем информацию о камере
                    EdsDeviceInfo deviceInfo;
                    err = EdsGetDeviceInfo(camera, &deviceInfo); // Получаем информацию о устройстве
                    if (err == EDS_ERR_OK) {
                        std::cout << "Камера " << i + 1 << ": " << deviceInfo.szDeviceDescription << std::endl;
                    }
                    else {
                        std::cout << "Ошибка получения информации о камере " << i + 1 << std::endl;
                    }
                    EdsRelease(camera); // Освобождаем объект камеры
                }
                else {
                    std::cout << "Ошибка получения камеры " << i + 1 << std::endl;
                }
            }
        }
        else {
            std::cout << "Камеры не найдены\n";
        }
        EdsRelease(cameraList); // Освобождаем список камер
    }
    else {
        std::cout << "Ошибка получения списка камер\n";
    }
}

// Функция для съемки фотографии
bool take_picture(EdsCameraRef camera) {
    EdsError err = EdsSendCommand(camera, kEdsCameraCommand_TakePicture, 0); // Отправляем команду съемки
    if (err != EDS_ERR_OK) {
        std::cerr << "Ошибка при съемке: " << err << std::endl;
        return false;
    }

    std::cout << "Camera tike picture!" << std::endl;
    return true;
}

void mainC() {
    // Инициализация SDK
    EdsError err = EdsInitializeSDK(); // Правильное использование типа EdsError
    if (err == EDS_ERR_OK) {
        std::cout << "SDK Canon NICE INIT\n";

        // Получаем список камер
        EdsCameraListRef cameraList = nullptr;
        err = EdsGetCameraList(&cameraList);
        if (err == EDS_ERR_OK) {
            EdsUInt32 cameraCount = 0;
            err = EdsGetChildCount(cameraList, &cameraCount);
            if (err == EDS_ERR_OK && cameraCount > 0) {
                // Получаем первую камеру
                EdsCameraRef camera = nullptr;
                err = EdsGetChildAtIndex(cameraList, 0, &camera);
                if (err == EDS_ERR_OK && camera != nullptr) {
                    // Открываем сессию с камерой
                    err = EdsOpenSession(camera);
                    if (err == EDS_ERR_OK) {
                        // Делаем фото
                        take_picture(camera);

                        // Закрываем сессию с камерой
                        err = EdsCloseSession(camera);
                        if (err != EDS_ERR_OK) {
                            std::cerr << "Ошибка закрытия сессии с камерой: " << err << std::endl;
                        }

                        EdsRelease(camera); // Освобождаем камеру
                    }
                    else {
                        std::cerr << "Ошибка открытия сессии с камерой: " << err << std::endl;
                    }
                }
                else {
                    std::cerr << "Ошибка получения камеры: " << err << std::endl;
                }
            }
            else {
                std::cerr << "Камеры не найдены" << std::endl;
            }
        }
        else {
            std::cerr << "Ошибка получения списка камер: " << err << std::endl;
        }

        EdsRelease(cameraList); // Освобождаем список камер

        // Завершение работы SDK
        err = EdsTerminateSDK(); // Правильное использование типа EdsError
        if (err != EDS_ERR_OK) {
            std::cout << "Ошибка завершения работы SDK Canon\n";
        }
        else {
            std::cout << "SDK Canon NICE END\n";
        }
    }
    else {
        std::cout << "Ошибка инициализации SDK Canon\n";
    }
}

}
