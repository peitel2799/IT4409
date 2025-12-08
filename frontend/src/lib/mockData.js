// src/lib/mockData.js

// 1. DANH SÁCH BẠN BÈ (CONTACTS)
export const MOCK_CONTACTS = [
  { _id: "u1", fullName: "Minh Anh", email: "minhanh@gmail.com", avatar: "https://i.pravatar.cc/150?u=1", status: "online", desc: "Design Team" },
  { _id: "u2", fullName: "Tuấn Hưng", email: "hung@gmail.com", avatar: "https://i.pravatar.cc/150?u=2", status: "offline", desc: "Product Manager" },
  { _id: "u3", fullName: "Lan Ngọc", email: "ngoc@gmail.com", avatar: "https://i.pravatar.cc/150?u=3", status: "busy", desc: "Developer" },
  { _id: "u4", fullName: "Quang Hải", email: "hai@gmail.com", avatar: "https://i.pravatar.cc/150?u=4", status: "online", desc: "Marketing" },
  { _id: "u5", fullName: "Bích Phương", email: "phuong@gmail.com", avatar: "https://i.pravatar.cc/150?u=5", status: "online", desc: "HR" },
  { _id: "u6", fullName: "Sơn Tùng", email: "tung@gmail.com", avatar: "https://i.pravatar.cc/150?u=6", status: "away", desc: "CEO" },
];

// 2. DỮ LIỆU TRANG HOME (Calls, Recent Chats, Notes)
export const MOCK_HOME_STATS = {
  calls: [
    { id: 1, name: "Minh Anh", avatar: "https://i.pravatar.cc/150?u=1", type: "missed", time: "10:30 AM", date: "Hôm nay" },
    { id: 2, name: "Tuấn Hưng", avatar: "https://i.pravatar.cc/150?u=2", type: "incoming", time: "09:15 AM", date: "Hôm nay" },
    { id: 3, name: "Lan Ngọc", avatar: "https://i.pravatar.cc/150?u=3", type: "outgoing", time: "Hôm qua", date: "28/11" },
    { id: 4, name: "Quang Hải", avatar: "https://i.pravatar.cc/150?u=4", type: "incoming", time: "T2", date: "25/11" },
    { id: 5, name: "Bích Phương", avatar: "https://i.pravatar.cc/150?u=5", type: "missed", time: "CN", date: "24/11" },
    { id: 6, name: "Sơn Tùng", avatar: "https://i.pravatar.cc/150?u=6", type: "outgoing", time: "CN", date: "24/11" },
    { id: 7, name: "Hoàng Yến", avatar: "https://i.pravatar.cc/150?u=20", type: "missed", time: "T7", date: "23/11" },
    { id: 8, name: "Mẹ", avatar: "https://i.pravatar.cc/150?u=8", type: "incoming", time: "T7", date: "23/11" },
    { id: 9, name: "Sếp Tổng", avatar: "https://i.pravatar.cc/150?u=9", type: "incoming", time: "T6", date: "22/11" },
    { id: 10, name: "Shipper", avatar: "https://ui-avatars.com/api/?name=SP&background=random", type: "missed", time: "T6", date: "22/11" },
  ],
  chats: [
    { id: "u1", name: "Minh Anh", avatar: "https://i.pravatar.cc/150?u=1", lastMessage: "Oke, cố lên!", time: "10:30 AM", unread: 2 },
    { id: "u2", name: "Tuấn Hưng", avatar: "https://i.pravatar.cc/150?u=2", lastMessage: "Ok chốt đơn", time: "Hôm qua", unread: 0 },
    { id: "group1", name: "Team Dự Án", avatar: "https://ui-avatars.com/api/?name=DA&background=random", lastMessage: "Đã gửi file design nhé", time: "2p", unread: 5 },
    { id: "u3", name: "Lan Ngọc", avatar: "https://i.pravatar.cc/150?u=3", lastMessage: "Bug này fix chưa?", time: "30p", unread: 1 },
  ],
  notes: [
    { id: 1, title: "Họp Team Design", time: "10:00 AM" },
    { id: 2, title: "Gửi báo cáo tháng", time: "04:30 PM" },
    { id: 3, title: "Mua quà sinh nhật", time: "CN, 20:00" },
  ]
};

// 3. LỜI MỜI KẾT BẠN (ĐƯỢC NHẬN) - Tab Requests
export const MOCK_REQUESTS = [
  { id: 10, name: "Hoàng Yến", mutual: 12, avatar: "https://i.pravatar.cc/150?u=20" },
  { id: 11, name: "Tiến Linh", mutual: 3, avatar: "https://i.pravatar.cc/150?u=21" },
  { id: 12, name: "Hòa Minzy", mutual: 8, avatar: "https://i.pravatar.cc/150?u=22" },
];

// 4. LỜI MỜI ĐÃ GỬI (SENT REQUESTS) - Tab Add Friend
export const MOCK_SENT_REQUESTS = [
  { _id: "s1", fullName: "David Beckham", email: "david.beck@example.com", avatar: "https://ui-avatars.com/api/?name=David+Beckham&background=0D8ABC&color=fff" },
  { _id: "s2", fullName: "Taylor Swift", email: "taylor.1989@example.com", avatar: "https://ui-avatars.com/api/?name=Taylor+Swift&background=pink&color=fff" },
  { _id: "s3", fullName: "Elon Musk", email: "elon.tesla@example.com", avatar: "https://ui-avatars.com/api/?name=Elon+Musk&background=333&color=fff" },
];

// 5. GỢI Ý KẾT BẠN (SUGGESTIONS)
export const MOCK_SUGGESTIONS = [
  { id: 30, fullName: "Lê Bảo", reason: "Gợi ý mới", avatar: "https://i.pravatar.cc/150?u=60" },
  { id: 31, fullName: "Trần My", reason: "Bạn chung của Lan", avatar: "https://i.pravatar.cc/150?u=61" },
];

// 6. NỘI DUNG TIN NHẮN (Chi tiết cuộc trò chuyện)
// Key ("u1", "u2") phải khớp với id trong MOCK_HOME_STATS.chats hoặc MOCK_CONTACTS
export const MOCK_MESSAGES = {
  "u1": [ // Chat với Minh Anh
    { _id: "m1", senderId: "u1", text: "Alo, dự án đến đâu rồi?", createdAt: "2025-11-29T09:00:00" },
    { _id: "m2", senderId: "me", text: "Đang làm phần Frontend nhé, sắp xong rồi", createdAt: "2025-11-29T09:05:00" },
    { _id: "m3", senderId: "u1", text: "Oke, cố lên! Chiều nay họp nhé.", createdAt: "2025-11-29T09:06:00" },
    { _id: "m4", senderId: "me", text: "Ok chốt", createdAt: "2025-11-29T09:07:00" },
  ],
  "u2": [ // Chat với Tuấn Hưng
    { _id: "m5", senderId: "me", text: "Tối nay đi đá bóng không?", createdAt: "2025-11-28T18:00:00" },
    { _id: "m6", senderId: "u2", text: "Sân nào đấy?", createdAt: "2025-11-28T18:05:00" },
    { _id: "m7", senderId: "me", text: "Sân cũ nha", createdAt: "2025-11-28T18:06:00" },
    { _id: "m8", senderId: "u2", text: "Ok chốt đơn", createdAt: "2025-11-28T18:10:00" },
  ],
  "group1": [ // Chat nhóm
    { _id: "g1", senderId: "u1", text: "Mọi người check mail nhé", createdAt: "2025-11-29T10:00:00" },
    { _id: "g2", senderId: "u3", text: "Đã nhận", createdAt: "2025-11-29T10:02:00" },
    { _id: "g3", senderId: "me", text: "Ok đang xem", createdAt: "2025-11-29T10:05:00" },
  ]
};