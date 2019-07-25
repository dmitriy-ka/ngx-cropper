import { Format } from './../components/ngx-cropper/ngx-cropper.component';
export const cropImage = (
  canvas: HTMLCanvasElement,
  format: string = 'png',
  quality: number
): Promise<string> => {
  console.time('CROP');
  // TODO: toBlob() is faster, maye need to be replaced
  return new Promise(resolve => {
    resolve(canvas.toDataURL(`image/${format}`, 1));
    console.timeEnd('CROP');
  });
};

const dataURLtoBlob = dataurl => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const downloadImage = (
  canvas: HTMLCanvasElement,
  format: Format = 'png',
  quality: number = 1
) => {
  const link = document.createElement('a');
  const imgData = canvas.toDataURL(format, quality);
  const strDataURI = imgData.substr(22, imgData.length);
  const blob = dataURLtoBlob(imgData);
  const objurl = URL.createObjectURL(blob);
  link.download = `download.${format}`;
  link.href = objurl;
  link.click();
};
