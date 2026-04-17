function loadBuildings() {
    const buildings = [
        { id: 'T1', name: 'Tòa Nam (Nam)' },
        { id: 'T2', name: 'Tòa Nữ (Nữ)' }
    ]; 

    const buildingList = document.getElementById('building-list');
    buildingList.innerHTML = '';
    
    buildings.forEach(b => {
        buildingList.innerHTML += `<li onclick="loadRooms('${b.id}', '${b.name}')">🏢 ${b.name}</li>`;
    });
}

function loadRooms(toaId, toaName) {
    document.getElementById('current-view-title').innerText = `Danh sách phòng - ${toaName}`;
    document.getElementById('room-details').style.display = 'none'; // Ẩn chi tiết phòng cũ nếu có
    const grid = document.getElementById('room-grid');
    
    const rooms = [
        { id: 'P101-T1', name: 'Phòng 101', capacity: 4, current: 4, price: '1.500.000đ' },
        { id: 'P102-T1', name: 'Phòng 102', capacity: 6, current: 2, price: '1.200.000đ' }
    ];

    grid.innerHTML = '';
    rooms.forEach(r => {
        let status = r.current >= r.capacity ? '<span class="badge-full">Đã đầy</span>' : `<span class="badge-empty">Còn ${r.capacity - r.current} chỗ</span>`;
        grid.innerHTML += `
            <div class="room-card" onclick="viewRoomDetails('${r.id}', '${r.name}')">
                <h3>${r.name}</h3>
                <p>Sức chứa: ${r.current}/${r.capacity} người</p>
                <p>Giá: ${r.price}</p>
                <p>${status}</p>
            </div>
        `;
    });
}

function viewRoomDetails(roomId, roomName) {
    document.getElementById('current-view-title').innerText = `Chi tiết ${roomName}`;
    document.getElementById('room-grid').innerHTML = ''; // Ẩn danh sách phòng
    document.getElementById('room-details').style.display = 'block'; // Hiện khu vực chi tiết

    document.getElementById('room-students-body').innerHTML = `
        <tr><td>SV001</td><td>Nguyễn Thanh Lam</td><td>0123456789</td><td>Bắc Ninh</td></tr>
        <tr><td>SV002</td><td>Trần Văn B</td><td>0987654321</td><td>Hà Nội</td></tr>
    `;

    document.getElementById('room-invoices-body').innerHTML = `
        <tr><td>03/2026</td><td>50</td><td>10</td><td>350.000đ</td><td><span class="badge-full">Đã thu</span></td></tr>
        <tr><td>04/2026</td><td>62</td><td>12</td><td>410.000đ</td><td><span class="badge-empty">Chưa thu</span></td></tr>
    `;
}

function switchTab(tabName) {
    document.getElementById('tab-students').style.display = 'none';
    document.getElementById('tab-invoices').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).style.display = 'block';
    event.target.classList.add('active');
}

function closeRoomDetails() {
    document.getElementById('room-details').style.display = 'none';
    document.getElementById('current-view-title').innerText = `Vui lòng chọn Tòa nhà bên trái`;
}

function exportToExcel() {
    let table = document.getElementById("table-export");
    let wb = XLSX.utils.table_to_book(table, {sheet: "DanhSach"});
    XLSX.writeFile(wb, "BaoCao_KyTucXa.xlsx");
    alert("Đã tải xuống file Excel thành công!");
}

window.onload = function() {
    loadBuildings();
};