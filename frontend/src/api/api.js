const BASE_URL = "http://localhost:5000";

const roomChecker = async (roomId) => {
  const response = await fetch(`${BASE_URL}/api/rooms/${roomId}`);
  const data = await response.json();
  console.log(data);
  return data;
};

export { roomChecker };
