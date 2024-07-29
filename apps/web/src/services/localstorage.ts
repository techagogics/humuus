export const NAMESPACE = 'humuus_dev'; // Could implrement multiple namespaces when needed

interface LocalStorageData {
  [key: string]: string;
}

export function getData(): LocalStorageData {
  try {
    const data = localStorage.getItem(NAMESPACE);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error getting data in localstorage: ', e);
    return {};
  }
}

export function setData(data: LocalStorageData) {
  try {
    if (data.deviceId && !_isValidId(data.deviceId))
      console.error(`Error setting data in localstorage: ${data.deviceId}`);
    else localStorage.setItem(NAMESPACE, JSON.stringify(data));
  } catch (e) {
    console.error('Error setting data in localstorage: ', e);
  }
}

export function setItem(key: string, value: string) {
  const data = getData();
  data[key] = value;
  setData(data);
}

export function getItem(key: string): string | undefined {
  const data = getData();
  return data ? data[key] : undefined;
}

export function removeItem(key: string) {
  const data = getData();
  delete data[key];
  setData(data);
}

export function clearData() {
  setData({});
}

// Checks if ID is UUIDv4
function _isValidId(id: string): Boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    id
  );
}
