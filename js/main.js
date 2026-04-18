// URL gọi đến Spring Boot Backend (Nhớ cấu hình @CrossOrigin ở BE nhé)
const API_URL = 'http://localhost:8080/api/students';
let allStudents = [];
let isEditMode = false;

window.onload = function() {
    fetchStudents();
};

// 1. Lấy dữ liệu
function fetchStudents() {
    const toaSelected = document.getElementById('filter-toa').value;
    const url = toaSelected ? `http://localhost:8080/api/students?toa=${toaSelected}` : `http://localhost:8080/api/students`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            allStudents = data;
            document.getElementById('total-students').innerText = data.length;
            renderStudentTable(data);
        })
        .catch(error => {
            console.error(error);
            document.getElementById('student-table-body').innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Chưa kết nối được Backend Java</td></tr>';
        });
}

// 2. Render Bảng
function renderStudentTable(data) {
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';
    
    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Không có sinh viên nào trong tòa này.</td></tr>';
        return;
    }

    data.forEach(student => {
        let msv = student.msv || '';
        let ten = student.hoTen || '';
        let toa = student.idToa || 'Chưa xếp';
        let phong = student.idPhong || 'Chưa xếp';
        let gt = student.gioiTinh || '';
        let sdt = student.sdt || '';

        let toaBadge = toa.includes('B1') || toa.includes('B2') 
            ? `<span style="color: #3b82f6; font-weight: bold;">${toa}</span>` 
            : `<span style="color: #ec4899; font-weight: bold;">${toa}</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${msv}</strong></td>
            <td>${ten}</td>
            <td>${toaBadge}</td>
            <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #cbd5e1;">${phong}</span></td>
            <td>${gt}</td>
            <td>${sdt}</td>
            <td>
                <button class="action-btn edit-btn" onclick="openEditForm('${msv}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteStudent('${msv}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. Tìm kiếm
function searchStudent() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filtered = allStudents.filter(student => 
        student.hoTen.toLowerCase().includes(keyword) || 
        student.msv.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
}

// 4. Chuyển Tab (SPA Logic)
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    if (sectionId === 'list-section') {
        document.querySelectorAll('.sidebar-nav li')[1].classList.add('active');
    } else if (sectionId === 'building-section') {
        document.querySelectorAll('.sidebar-nav li')[0].classList.add('active');
    }
}

// 5. Mở Form Thêm
function showAddForm() {
    isEditMode = false;
    document.getElementById('form-title').innerText = "Thêm Sinh Viên Mới";
    document.getElementById('main-form').reset();
    document.getElementById('msv').readOnly = false;
    showSection('form-section');
}

// 6. Mở Form Sửa
function openEditForm(msv) {
    isEditMode = true;
    document.getElementById('form-title').innerText = "Cập Nhật Thông Tin";
    showSection('form-section');
    
    const student = allStudents.find(s => s.msv === msv);
    if(student) {
        document.getElementById('msv').value = student.msv;
        document.getElementById('msv').readOnly = true;
        document.getElementById('hoTen').value = student.hoTen;
        document.getElementById('ngaySinh').value = student.ngaySinh;
        document.getElementById('gioiTinh').value = student.gioiTinh;
        document.getElementById('sdt').value = student.sdt;
        document.getElementById('queQuan').value = student.queQuan;
    }
}

function goBack() {
    document.getElementById('main-form').reset();
    showSection('list-section');
}

// 7. Xử lý Submit Form (Lưu dữ liệu)
document.getElementById('main-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const payload = {
        msv: document.getElementById('msv').value,
        hoTen: document.getElementById('hoTen').value,
        ngaySinh: document.getElementById('ngaySinh').value,
        gioiTinh: document.getElementById('gioiTinh').value,
        sdt: document.getElementById('sdt').value,
        queQuan: document.getElementById('queQuan').value
    };

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${API_URL}/${payload.msv}` : API_URL;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(response => {
        if (response.ok) { goBack(); fetchStudents(); } 
        else { alert("Lưu thất bại! Kiểm tra lại API Backend."); }
    }).catch(error => console.error(error));
});

// 8. Xóa Sinh Viên
function deleteStudent(msv) {
    if (confirm(`Bạn có chắc muốn xóa sinh viên ${msv}?`)) {
        fetch(`${API_URL}/${msv}`, { method: 'DELETE' })
            .then(response => { if (response.ok) fetchStudents(); })
            .catch(error => console.error(error));
    }
}

// 9. Xóa Sinh Viên
function logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?")) {
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    }
}


// Hàm Quản lý phòng: Hiển thị 100% dữ liệu phòng từ Database
function manageRooms(buildingId) {
    console.log("Hàm manageRooms đã được gọi với tòa: " + buildingId);
    showSection('room-section');
    document.getElementById('current-building-name').innerText = buildingId;
    document.getElementById('stat-building-name').innerText = buildingId;
    
    const tbody = document.getElementById('room-table-body');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Đang tải...</td></tr>';

    fetch(`http://localhost:8080/api/rooms?toa=${buildingId}`)
        .then(response => response.json())
        .then(data => {
            tbody.innerHTML = ''; 
            
            let totalStudentsInBuilding = 0;

            data.forEach(room => {
                let id = room.idPhong || room.id_phong || room.id || '';
                let loai = room.loaiPhong || room.loai_phong || room.roomType || '';
                let chua = room.sucChua || room.suc_chua || room.capacity || '';
                let o = room.dangO || room.dang_o || room.occupancy || 0;
                let thai = room.trangThai || room.trang_thai || room.status || '';
                let gia = room.giaThue || room.gia_thue || room.price || 0;

                totalStudentsInBuilding += parseInt(o);

                let statusHtml = thai === 'Đã đầy' 
                    ? `<span style="background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">Đã đầy</span>`
                    : `<span style="background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">${thai}</span>`;

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${id}</strong></td>
                        <td>${loai}</td>
                        <td>${chua}</td>
                        <td>${o}</td>
                        <td>${statusHtml}</td>
                        <td style="display: flex; gap: 5px;">
                            <button class="action-btn" style="background-color: #3b82f6; color: white;" onclick="viewRoomDetail('${id}', '${loai}', '${chua}', '${o}', '${gia}')">
                                <i class="fa-solid fa-eye"></i> Xem
                            </button>
                            <button class="action-btn edit-btn"><i class="fa-solid fa-pen"></i> Sửa</button>
                        </td>
                    </tr>
                `;
            });

            document.getElementById('total-students-building').innerText = totalStudentsInBuilding;
        })
        .catch(error => {
            console.error(error);
        });
}

function viewRoomDetail(id, loai, chua, o, gia) {
    document.getElementById('detail-room-title').innerText = 'Chi tiết phòng ' + id;
    document.getElementById('detail-room-type').innerText = loai;
    document.getElementById('detail-room-capacity').innerText = chua;
    document.getElementById('detail-room-occupancy').innerText = o;
    document.getElementById('detail-room-price').innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
    
    document.getElementById('room-detail-modal').style.display = 'flex';
    
    const tbody = document.getElementById('detail-room-students');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Đang tải dữ liệu sinh viên...</td></tr>';
    
    fetch(`http://localhost:8080/api/students?phong=${id}`)
        .then(response => response.json())
        .then(data => {
            tbody.innerHTML = '';
            if(data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Phòng hiện đang trống</td></tr>';
                return;
            }
            data.forEach(sv => {
                let msv = sv.msv || '';
                let ten = sv.hoTen || '';
                let sdt = sv.sdt || '';
                tbody.innerHTML += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${msv}</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${ten}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${sdt}</td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Lỗi tải dữ liệu</td></tr>';
        });
}

function closeRoomDetail() {
    document.getElementById('room-detail-modal').style.display = 'none';
}