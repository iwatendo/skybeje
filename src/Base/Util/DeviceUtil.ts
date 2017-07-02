
interface OnReadDevice { (devices: Array<any>) }


export default class DeviceUtil {

    public static DeviceMap = new Map<string, string>();

    /**
     * 
     */
    public static GetAudioDevice(callback: OnReadDevice) {

        let count = 0;

        navigator.mediaDevices.enumerateDevices().then((devices) => {

            let result = Array<any>();
            devices.forEach((device, index, array) => {
                if (device.kind === 'audioinput') {
                    count++;
                    let name = (device.label || 'microphone ' + count.toString());
                    DeviceUtil.DeviceMap.set(name, device.deviceId);
                    result.push(device);
                }
            });
            callback(result);
        });
    }

    /**
     * 
     */
    public static GetVideoDevice(callback: OnReadDevice) {

        let count = 0;

        navigator.mediaDevices.enumerateDevices().then((devices) => {

            let result = Array<any>();

            devices.forEach((device, index, array) => {
                if (device.kind === 'videoinput') {

                    count++;
                    let name = (device.label || 'camera ' + count.toString());
                    DeviceUtil.DeviceMap.set(name, device.deviceId);
                    result.push(device);
                }
            });

            callback(result);
        });

    }

}