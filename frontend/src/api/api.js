const BASE_URL = import.meta.env.VITE_API_BASE_URL_PROD;

const roomChecker = async (roomId) => {
  const response = await fetch(`${BASE_URL}/api/rooms/${roomId}`);
  const data = await response.json();
  console.log(data);
  return data;
};

const getRoomData = async (roomId) => {
  const response = await fetch(`${BASE_URL}/api/roomData/${roomId}`);
  const data = await response.json();
  return data;
};

const contactServer = async () => {
  const response = await fetch(`${BASE_URL}/api/contactServer`);
  const data = await response.json();
  return data;
};

export { roomChecker, getRoomData, contactServer, BASE_URL };
