# 🎨 KTX Management System - Frontend Dashboard

Giao diện quản lý Ký túc xá hiện đại, tương tác thời gian thực với Backend qua REST API.

## 🛠 Tech Stack
* **Core:** HTML5, CSS3, JavaScript (ES6+)
* **Communication:** Fetch API (AJAX)
* **Library:** [SheetJS](https://sheetjs.com/) (Hỗ trợ xuất file Excel)
* **Server:** Live Server (VS Code Extension)

## 🌟 Tính năng nổi bật
- **Role-based UI:** - **Admin:** Dashboard quản lý đa cấp (Tòa nhà > Phòng > Sinh viên).
    - **Student:** Xem thông tin cá nhân, phòng ở và tra cứu phòng trống.
- **Data Export:** Xuất danh sách sinh viên nội trú trực tiếp ra file `.xlsx`.
- **Responsive Design:** Giao diện sidebar hiện đại, dễ thao tác.
- **Security:** Tích hợp kiểm tra quyền truy cập qua LocalStorage.

## 🚀 Cách chạy dự án
1. Đảm bảo **Backend Spring Boot** đang chạy tại cổng `8080`.
2. Mở thư mục này bằng VS Code.
3. Chuột phải vào file `login.html` chọn **Open with Live Server**.
4. Truy cập mặc định tại: `http://127.0.0.1:5500/login.html`.

## 📸 Ảnh minh họa giao diện
<img width="958" height="454" alt="image" src="https://github.com/user-attachments/assets/d94c0135-cedb-4cc1-9243-54ef19770bb6" />
