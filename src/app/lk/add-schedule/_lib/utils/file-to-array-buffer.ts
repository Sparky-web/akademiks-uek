export default function fileToArrayBuffer(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsArrayBuffer(file);

        reader.onload = function (e) {
            resolve(e?.target?.result as ArrayBuffer);
        };

        reader.onerror = function (e) {
            reject(e);
        };
    });
}