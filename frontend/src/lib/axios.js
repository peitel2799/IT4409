import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

/* ---------- Helper: localStorage ---------- */
const loadData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/* ---------- Dữ liệu Giả Lập Khởi Đầu ---------- */
/* ---------- Dữ liệu Giả Lập Khởi Đầu ---------- */
const DUMMY_FRIENDS = [
  { id: "1", name: "A", email: "a@example.com", avatar: "/images.jpg" },
  { id: "2", name: "B", email: "b@example.com", avatar: "/images.jpg" },
  { id: "3", name: "C", email: "c@example.com", avatar: "/images.jpg" },
  { id: "4", name: "D", email: "d@example.com", avatar: "/images.jpg" },
  { id: "5", name: "E", email: "e@example.com", avatar: "/images.jpg" },
];

const DUMMY_CONVERSATIONS = [
  { id: "1", name: "A", avatar: "/images.jpg" },
  { id: "2", name: "B", avatar: "/images.jpg" },
  { id: "3", name: "C", avatar: "/images.jpg" },
  { id: "4", name: "D", avatar: "/images.jpg" },
  { id: "5", name: "E", avatar: "/images.jpg" },
];

const messages_for_chat_1 = [
  { id: 1, senderId: 1, text: "Hey, are you there?", time: "2025-11-10T12:35:00" },
  { id: 2, senderId: 0, text: "You missed a video call", time: "2025-11-10T19:05:00", isSystem: true },
  { id: 3, senderId: 0, text: "Call again", time: "2025-11-10T19:06:00", isAction: true },
  { id: 4, senderId: 1, text: "Hello?", time: "2025-11-12T08:30:00" },
  { id: 5, senderId: 0, text: "Hi! Can you hear me?", time: "2025-11-12T08:31:00" },
  { id: 6, senderId: 0, text: "What's up?", time: "2025-11-12T08:31:30" },
  { id: 7, senderId: 1, text: "Oh, nothing. I called by mistake.", time: "2025-11-12T08:32:00" },
];

const DUMMY_MESSAGES = {
  "1": messages_for_chat_1, // '1' là id của "Bố Bống"
  "2": [ { id: "c2m1", senderId: 2, text: "Hey, this is Hien.", time: "2025-11-11T10:00:00" } ],
  "3": [ { id: "c3m1", senderId: 3, text: "Hi everyone in the group!", time: "2025-11-11T11:00:00" } ],
  "4": [ { id: "c4m1", senderId: 4, text: "Hey Lan Anh, how are you?", time: "2025-11-11T12:00:00" } ],
  "5": [ { id: "c5m1", senderId: 5, text: "Testing tagLive message.", time: "2025-11-11T13:00:00" } ],
};

// Hàm khởi tạo dữ liệu giả lập 
const initializeMockData = () => {
  if (!loadData("mockUsers")) {
    saveData("mockUsers", []);
  }
  if (!loadData("currentUser")) {
    saveData("currentUser", null);
  }
  if (!loadData("mockConversations")) {
    saveData("mockConversations", DUMMY_CONVERSATIONS);
  }
  if (!loadData("mockMessages")) {
    saveData("mockMessages", DUMMY_MESSAGES);
  }
  if (!loadData("mockFriends")) {
    saveData("mockFriends", DUMMY_FRIENDS);
  }
};

initializeMockData();


axiosInstance.interceptors.request.use(async (config) => {
  const method = (config.method || "").toUpperCase();
  const url = config.url || "";
  
  const mockFriends = loadData("mockFriends");
  const mockUsers = loadData("mockUsers");
  const currentUser = loadData("currentUser");
  const mockConversations = loadData("mockConversations");
  const mockMessages = loadData("mockMessages");

  console.groupCollapsed(`MOCK REQUEST: ${method} ${url}`);
  console.log("Payload:", config.data);
  console.groupEnd();

  /* ==================== AUTH ==================== */
  if (method === "POST" && url === "/auth/signup") {
    const { fullName, email, password } = config.data || {};
    await new Promise(res => setTimeout(res, 500));

    if (mockUsers.some(u => u.email === email)) {
      throw { response: { data: { message: "Email already exists" }, status: 400 } };
    }

    const newUser = {
      _id: Date.now().toString(),
      fullName,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...mockUsers, newUser];
    saveData("mockUsers", updatedUsers);
    saveData("currentUser", newUser);

    config.adapter = async () => ({
      data: newUser,
      status: 201,
      statusText: "Created",
      headers: {},
      config,
    });

    return config;
  }

  if (method === "POST" && url === "/auth/login") {
    const { email, password } = config.data || {};
    await new Promise(res => setTimeout(res, 500));

    const user = mockUsers.find(u => u.email === email);
    if (!user || user.password !== password) {
      throw { response: { data: { message: "Invalid email or password" }, status: 401 } };
    }

    saveData("currentUser", user);
    config.adapter = async () => ({
      data: user,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    return config;
  }

  if (method === "GET" && url === "/auth/check") {
    await new Promise(res => setTimeout(res, 200));
    config.adapter = async () => ({
      data: currentUser,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    return config;
  }

  if (method === "POST" && url === "/auth/logout") {
    saveData("currentUser", null);
    config.adapter = async () => ({
      data: { message: "Logged out" },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    return config;
  }
  /* ==================== CONVERSATIONS ==================== */
  if (config.method.toUpperCase() === "GET" && config.url === "/conversations") {
    await new Promise(res => setTimeout(res, 300)); // Giả lập độ trễ mạng
    
    // mockConversations là biến đã load DUMMY_CONVERSATIONS từ localStorage
    config.adapter = async () => ({
      data: mockConversations,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    return config;
  }

  /* ==================== MESSAGES ==================== */
  if (config.method.toUpperCase() === "GET" && config.url.startsWith("/messages/")) {
    const conversationId = config.url.split('/')[2];
    await new Promise(res => setTimeout(res, 400)); // Giả lập độ trễ mạng
    
    const messages = mockMessages[conversationId] || [];
    
    config.adapter = async () => ({
      data: messages,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    return config;
  }

  
  return config;
});


export { axiosInstance };