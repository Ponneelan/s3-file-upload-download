export function getExtention(filename: string) {
    const lastIndex = filename.lastIndexOf(".");
    if (lastIndex === -1) {
        return "";
    }
    return filename.slice(lastIndex);
}
export function custructFileName(fileName:string) : string{
    const extention:string = getExtention(fileName);
    return `${fileName}_${Date.now()}${extention}`;
}