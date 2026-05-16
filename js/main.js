const API_BASE = "/api";
const REPAIR_STATUS_SEQUENCE = [
    "Cho tiep nhan",
    "Da tiep nhan",
    "Dang xu ly",
    "Da hoan thanh"
];

let allStudents = [];
let allRepairs = [];
let isEditMode = false;
let currentStudentPortalData = null;

document.addEventListener("DOMContentLoaded", () => {
    initAdminPage();
    initStudentPage();
});

function initAdminPage() {
    const studentTableBody = document.getElementById("student-table-body");
    if (!studentTableBody) {
        return;
    }

    if (!enforceAuth("admin")) {
        return;
    }

    bindProtectedPageGuard("admin");

    fetchStudents();
    loadAdminRepairs();

    const mainForm = document.getElementById("main-form");
    if (mainForm) {
        mainForm.addEventListener("submit", submitStudentForm);
    }
}

function initStudentPage() {
    const portalRoot = document.getElementById("student-portal-root");
    if (!portalRoot) {
        return;
    }

    const session = enforceAuth("student");
    if (!session) {
        return;
    }

    bindProtectedPageGuard("student");
    bindStudentInteractions();
    loadStudentPortal(session.portalMsv || session.username);
}

function getCurrentSession() {
    try {
        return JSON.parse(localStorage.getItem("userSession"));
    } catch (error) {
        return null;
    }
}

function fetchStudents() {
    const filterElement = document.getElementById("filter-toa");
    const toaSelected = filterElement ? filterElement.value : "";
    const url = toaSelected ? `${API_BASE}/students?toa=${toaSelected}` : `${API_BASE}/students`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            allStudents = data;
            setText("total-students", String(data.length));
            renderStudentTable(data);
        })
        .catch((error) => {
            console.error(error);
            document.getElementById("student-table-body").innerHTML =
                '<tr><td colspan="7" style="text-align:center; color:#ef4444;">Chua ket noi duoc backend.</td></tr>';
        });
}

function renderStudentTable(data) {
    const tbody = document.getElementById("student-table-body");
    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Khong co sinh vien nao trong danh sach.</td></tr>';
        return;
    }

    data.forEach((student) => {
        const msv = student.msv || "";
        const ten = student.hoTen || "";
        const toa = student.idToa || "Chua xep";
        const phong = student.idPhong || "Chua xep";
        const gt = student.gioiTinh || "";
        const sdt = student.sdt || "";

        const toaBadge = toa.includes("B1") || toa.includes("B2")
            ? `<span style="color: #3b82f6; font-weight: 700;">${toa}</span>`
            : `<span style="color: #ec4899; font-weight: 700;">${toa}</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${msv}</strong></td>
            <td>${ten}</td>
            <td>${toaBadge}</td>
            <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: 700; border: 1px solid #cbd5e1;">${phong}</span></td>
            <td>${gt}</td>
            <td>${sdt}</td>
            <td>
                <button class="action-btn edit-btn" onclick="openEditForm('${msv}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchStudent() {
    const input = document.getElementById("search-input");
    const keyword = input ? input.value.toLowerCase() : "";
    const filtered = allStudents.filter((student) =>
        (student.hoTen || "").toLowerCase().includes(keyword) ||
        (student.msv || "").toLowerCase().includes(keyword)
    );
    renderStudentTable(filtered);
}

function showSection(sectionId) {
    document.querySelectorAll(".content-section").forEach((sec) => {
        sec.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = "block";
    }

    const navItems = document.querySelectorAll(".sidebar-nav li");
    navItems.forEach((li) => li.classList.remove("active"));

    const navIndexMap = {
        "building-section": 0,
        "room-section": 0,
        "list-section": 1,
        "form-section": 1,
        "repair-admin-section": 2
    };
    const activeIndex = navIndexMap[sectionId];
    if (typeof activeIndex === "number" && navItems[activeIndex]) {
        navItems[activeIndex].classList.add("active");
    }

    if (sectionId === "repair-admin-section") {
        loadAdminRepairs();
    }
}

function showAddForm() {
    isEditMode = false;
    setText("form-title", "Them sinh vien moi");
    document.getElementById("main-form").reset();
    document.getElementById("msv").readOnly = false;
    showSection("form-section");
}

function openEditForm(msv) {
    isEditMode = true;
    setText("form-title", "Cap nhat thong tin");
    showSection("form-section");

    const student = allStudents.find((item) => item.msv === msv);
    if (!student) {
        return;
    }

    document.getElementById("msv").value = student.msv || "";
    document.getElementById("msv").readOnly = true;
    document.getElementById("hoTen").value = student.hoTen || "";
    document.getElementById("ngaySinh").value = student.ngaySinh || "";
    document.getElementById("gioiTinh").value = student.gioiTinh || "Nam";
    document.getElementById("sdt").value = student.sdt || "";
    document.getElementById("queQuan").value = student.queQuan || "";
    const roomInput = document.getElementById("idPhong");
    if (roomInput) {
        roomInput.value = student.idPhong || "";
    }
}

function goBack() {
    const form = document.getElementById("main-form");
    if (form) {
        form.reset();
    }
    showSection("list-section");
}

function submitStudentForm(event) {
    event.preventDefault();

    const payload = {
        msv: document.getElementById("msv").value.trim(),
        hoTen: document.getElementById("hoTen").value.trim(),
        ngaySinh: document.getElementById("ngaySinh").value,
        gioiTinh: document.getElementById("gioiTinh").value,
        sdt: document.getElementById("sdt").value.trim(),
        queQuan: document.getElementById("queQuan").value.trim(),
        idPhong: document.getElementById("idPhong").value.trim()
    };

    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `${API_BASE}/students/${encodeURIComponent(payload.msv)}` : `${API_BASE}/students`;

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(async (response) => {
            if (response.ok) {
                isEditMode = false;
                goBack();
                fetchStudents();
                return;
            }
            const message = await response.text();
            alert(message || "Luu that bai.");
        })
        .catch((error) => {
            console.error(error);
            alert("Khong the ket noi toi backend.");
        });
}

function logout() {
    localStorage.removeItem("userSession");
    sessionStorage.setItem("authMessage", "Ban can dang nhap de tiep tuc.");
    window.location.replace("login.html");
}

function manageRooms(buildingId) {
    showSection("room-section");
    setText("current-building-name", buildingId);
    setText("stat-building-name", buildingId);

    const tbody = document.getElementById("room-table-body");
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Dang tai...</td></tr>';

    fetch(`${API_BASE}/rooms?toa=${buildingId}`)
        .then((response) => response.json())
        .then((rooms) => {
            tbody.innerHTML = "";
            let totalStudentsInBuilding = 0;

            if (!rooms.length) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chua co du lieu phong.</td></tr>';
            }

            rooms.forEach((room) => {
                const id = room.idPhong || "";
                const loai = room.loaiPhong || "";
                const sucChua = room.sucChua || 0;
                const dangO = room.dangO || 0;
                const trangThai = room.trangThai || "Con cho";

                totalStudentsInBuilding += Number(dangO);

                const statusClass = trangThai.toLowerCase().includes("day") ? "status-danger" : "status-success";
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${id}</strong></td>
                        <td>${loai}</td>
                        <td>${sucChua}</td>
                        <td>${dangO}</td>
                        <td><span class="status-pill ${statusClass}">${trangThai}</span></td>
                        <td><button class="btn btn-secondary" onclick="filterByRoom('${id}')">Xem sinh vien</button></td>
                    </tr>
                `;
            });

            setText("total-students-building", String(totalStudentsInBuilding));
        })
        .catch((error) => {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Khong tai duoc danh sach phong.</td></tr>';
        });
}

function filterByRoom(roomId) {
    const filterToa = document.getElementById("filter-toa");
    if (filterToa) {
        filterToa.value = "";
    }

    showSection("list-section");
    fetch(`${API_BASE}/students?phong=${roomId}`)
        .then((response) => response.json())
        .then((data) => {
            allStudents = data;
            setText("total-students", String(data.length));
            renderStudentTable(data);
        })
        .catch((error) => console.error(error));
}

function loadAdminRepairs() {
    const tbody = document.getElementById("repair-admin-table-body");
    if (!tbody) {
        return;
    }

    const statusFilter = document.getElementById("repair-status-filter");
    const status = statusFilter ? statusFilter.value : "";
    const url = status
        ? `${API_BASE}/repairs/admin?status=${encodeURIComponent(status)}`
        : `${API_BASE}/repairs/admin`;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Dang tai...</td></tr>';

    fetch(url)
        .then((response) => response.json())
        .then((items) => {
            allRepairs = Array.isArray(items) ? items : [];
            updateRepairSummary(allRepairs);
            renderAdminRepairTable(allRepairs);
        })
        .catch((error) => {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#ef4444;">Khong tai duoc danh sach yeu cau sua chua.</td></tr>';
        });
}

function updateRepairSummary(items) {
    const counts = {
        pending: 0,
        progress: 0,
        completed: 0
    };

    items.forEach((item) => {
        const status = normalizeRepairStatus(item.status);
        if (status === "Cho tiep nhan") {
            counts.pending += 1;
        } else if (status === "Dang xu ly" || status === "Da tiep nhan") {
            counts.progress += 1;
        } else if (status === "Da hoan thanh") {
            counts.completed += 1;
        }
    });

    setText("repair-pending-count", String(counts.pending));
    setText("repair-progress-count", String(counts.progress));
    setText("repair-completed-count", String(counts.completed));
}

function renderAdminRepairTable(items) {
    const tbody = document.getElementById("repair-admin-table-body");
    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Chua co yeu cau sua chua nao.</td></tr>';
        return;
    }

    items.forEach((item) => {
        const status = normalizeRepairStatus(item.status);
        const statusClass = getRepairStatusClass(status);

        tbody.innerHTML += `
            <tr>
                <td><strong>#${item.id ?? ""}</strong></td>
                <td>${item.msv || ""}</td>
                <td>${item.roomId || "--"}</td>
                <td>${item.category || "Khac"}</td>
                <td style="max-width: 320px;">${item.description || ""}</td>
                <td>${item.createdAt || ""}</td>
                <td><span class="status-pill ${statusClass}">${formatRepairStatus(status)}</span></td>
                <td>${renderRepairActions(item.id, status)}</td>
            </tr>
        `;
    });
}

function renderRepairActions(id, status) {
    const actions = [];

    if (status === "Cho tiep nhan") {
        actions.push(createRepairActionButton(id, "Da tiep nhan", "Tiep nhan", "btn-primary"));
    }
    if (status === "Da tiep nhan") {
        actions.push(createRepairActionButton(id, "Dang xu ly", "Xu ly", "btn-secondary"));
    }
    if (status === "Dang xu ly") {
        actions.push(createRepairActionButton(id, "Da hoan thanh", "Hoan thanh", "btn-primary"));
    }
    if (status !== "Cho tiep nhan") {
        actions.push(createRepairActionButton(id, "Cho tiep nhan", "Reset", "btn-secondary"));
    }

    return `<div style="display:flex; gap:8px; flex-wrap:wrap;">${actions.join("")}</div>`;
}

function createRepairActionButton(id, nextStatus, label, className) {
    return `<button class="btn ${className} btn-small" type="button" onclick="updateRepairStatus(${id}, '${nextStatus}')">${label}</button>`;
}

function updateRepairStatus(id, status) {
    fetch(`${API_BASE}/repairs/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    })
        .then(async (response) => {
            const body = await response.json();
            if (!response.ok) {
                throw new Error(body.message || "Khong cap nhat duoc trang thai.");
            }
            loadAdminRepairs();
        })
        .catch((error) => {
            console.error(error);
            alert(error.message || "Khong the cap nhat trang thai.");
        });
}

function bindStudentInteractions() {
    document.querySelectorAll("[data-student-section]").forEach((item) => {
        item.addEventListener("click", () => {
            switchStudentTab(item.dataset.studentSection, item);
        });
    });

    const repairForm = document.getElementById("repair-form");
    if (repairForm) {
        repairForm.addEventListener("submit", submitRepairRequest);
    }
}

function switchStudentTab(sectionId, clickedElement) {
    document.querySelectorAll(".content-section").forEach((sec) => {
        sec.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = "block";
    }

    document.querySelectorAll("[data-student-section]").forEach((item) => {
        item.classList.remove("active");
    });
    clickedElement.classList.add("active");
}

function loadStudentPortal(msv) {
    const emptyState = document.getElementById("student-loading-state");
    if (emptyState) {
        emptyState.style.display = "flex";
    }

    fetch(`${API_BASE}/student-portal/${encodeURIComponent(msv)}`)
        .then(async (response) => {
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.message || "Khong the tai du lieu sinh vien.");
            }
            return payload;
        })
        .then((data) => {
            currentStudentPortalData = data;
            renderStudentPortal(data);
        })
        .catch((error) => {
            console.error(error);
            renderStudentPortalError(error.message);
        });
}

function renderStudentPortal(data) {
    const student = data.student || {};
    const roomLabel = [student.tenPhong || student.idPhong, student.idToa].filter(Boolean).join(" - ");
    const roomRate = formatCurrency(student.giaThue || 0);
    const occupancy = `${student.dangO || 0}/${student.sucChua || 0}`;

    setText("student-topbar-name", student.hoTen || "Sinh vien");
    setText("student-topbar-msv", student.msv || "");
    setText("student-topbar-msv-copy", student.msv || "--");
    setText("student-avatar-role", "Sinh vien");
    setText("student-profile-name", student.hoTen || "Sinh vien");
    setText("student-profile-subtitle", `${student.msv || ""} - ${student.gioiTinh || "Chua cap nhat"}`);

    setText("room-card-name", roomLabel || "Chua duoc xep phong");
    setText("room-card-type", student.loaiPhong || "Chua cap nhat");
    setText("room-card-price", roomRate);
    setText("room-card-occupancy", occupancy);
    setText("room-card-status", student.trangThaiHopDong || "Chua co hop dong");
    setText("student-phone", student.sdt || "Chua cap nhat");
    setText("student-hometown", student.queQuan || "Chua cap nhat");
    setText("student-birthday", student.ngaySinh || "Chua cap nhat");

    renderRoommates(student, Array.isArray(data.roommates) ? data.roommates : []);
    renderInvoices(data.invoices || []);
    loadRepairHistory();

    const loading = document.getElementById("student-loading-state");
    if (loading) {
        loading.style.display = "none";
    }
}

function renderRoommates(student, roomMates) {
    const roomMateTable = document.getElementById("roommates-table-body");
    if (!roomMateTable) {
        return;
    }

    roomMateTable.innerHTML = "";

    if (!roomMates.length) {
        roomMateTable.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chua co du lieu ban cung phong.</td></tr>';
        return;
    }

    roomMates.forEach((mate, index) => {
        const isCurrentUser = mate.msv === student.msv;
        roomMateTable.innerHTML += `
            <tr ${isCurrentUser ? 'style="background:#f8fafc;"' : ""}>
                <td><strong>${mate.msv || ""}</strong></td>
                <td>${mate.hoTen || ""}${isCurrentUser ? " (Ban)" : ""}</td>
                <td>Giuong ${index + 1}</td>
                <td>${mate.sdt || "Chua cap nhat"}</td>
            </tr>
        `;
    });
}

function renderInvoices(invoices) {
    const tbody = document.getElementById("invoice-table-body");
    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (!invoices.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chua co hoa don cho phong hien tai.</td></tr>';
        return;
    }

    invoices.forEach((invoice) => {
        const soDien = (invoice.chiSoDienMoi || 0) - (invoice.chiSoDienCu || 0);
        const soNuoc = (invoice.chiSoNuocMoi || 0) - (invoice.chiSoNuocCu || 0);
        const trangThai = invoice.trangThai || "Chua thanh toan";
        const daDong = trangThai.toLowerCase().includes("da");

        tbody.innerHTML += `
            <tr>
                <td>${invoice.thangNam || ""}</td>
                <td>${soDien}</td>
                <td>${soNuoc}</td>
                <td style="font-weight:700; color:${daDong ? "var(--text-main)" : "var(--danger)"};">${formatCurrency(invoice.tongTien || 0)}</td>
                <td><span class="status-pill ${daDong ? "status-success" : "status-danger"}">${trangThai}</span></td>
                <td>${daDong ? "-" : `<button class="btn btn-primary btn-small" type="button" onclick="payInvoice(${invoice.idHoaDon})">Thanh toan</button>`}</td>
            </tr>
        `;
    });
}

function loadRepairHistory() {
    const list = document.getElementById("repair-history-list");
    const student = currentStudentPortalData?.student;
    if (!list || !student?.msv) {
        return;
    }

    fetch(`${API_BASE}/repairs?msv=${encodeURIComponent(student.msv)}`)
        .then((response) => response.json())
        .then((items) => renderRepairHistory(items))
        .catch((error) => {
            console.error(error);
            list.innerHTML = '<div class="empty-note">Khong tai duoc lich su sua chua.</div>';
        });
}

function renderRepairHistory(items) {
    const list = document.getElementById("repair-history-list");
    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (!items.length) {
        list.innerHTML = '<div class="empty-note">Chua co yeu cau sua chua nao duoc gui.</div>';
        return;
    }

    items.forEach((item) => {
        const status = normalizeRepairStatus(item.status);
        list.innerHTML += `
            <div class="repair-history-item">
                <div>
                    <strong>${item.category || "Khac"}</strong>
                    <p>${item.description || ""}</p>
                </div>
                <div class="repair-meta">
                    <span>${item.createdAt || ""}</span>
                    <span class="status-pill ${getRepairStatusClass(status)}">${formatRepairStatus(status)}</span>
                </div>
            </div>
        `;
    });
}

function submitRepairRequest(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const student = currentStudentPortalData?.student;
    if (!student) {
        alert("Khong tim thay thong tin sinh vien.");
        return;
    }

    const payload = {
        msv: student.msv,
        roomId: student.idPhong || "",
        category: form.querySelector("[name='repair-category']").value,
        description: form.querySelector("[name='repair-description']").value.trim()
    };

    fetch(`${API_BASE}/repairs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(async (response) => {
            const body = await response.json();
            if (!response.ok) {
                throw new Error(body.message || "Khong gui duoc yeu cau sua chua.");
            }
            form.reset();
            loadRepairHistory();
            alert("Da gui yeu cau sua chua thanh cong.");
        })
        .catch((error) => {
            console.error(error);
            alert(error.message || "Khong the gui yeu cau sua chua.");
        });
}

function payInvoice(invoiceId) {
    fetch(`${API_BASE}/invoices/${invoiceId}/pay`, { method: "PUT" })
        .then(async (response) => {
            const body = await response.json();
            if (!response.ok) {
                throw new Error(body.message || "Thanh toan that bai.");
            }
            if (currentStudentPortalData?.student?.msv) {
                loadStudentPortal(currentStudentPortalData.student.msv);
            }
            alert("Da cap nhat trang thai thanh toan.");
        })
        .catch((error) => {
            console.error(error);
            alert(error.message || "Khong the cap nhat thanh toan.");
        });
}

function renderStudentPortalError(message) {
    const loading = document.getElementById("student-loading-state");
    if (loading) {
        loading.innerHTML = `
            <div class="empty-state-card">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h3>Khong tai duoc du lieu</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

function normalizeRepairStatus(status) {
    const normalized = (status || "").trim().toLowerCase();
    const match = REPAIR_STATUS_SEQUENCE.find((item) => item.toLowerCase() === normalized);
    return match || "Cho tiep nhan";
}

function enforceAuth(requiredRole) {
    const session = getCurrentSession();
    if (!session || session.role !== requiredRole) {
        localStorage.removeItem("userSession");
        sessionStorage.setItem("authMessage", "Ban can dang nhap de tiep tuc.");
        window.location.replace("login.html");
        return null;
    }
    return session;
}

function bindProtectedPageGuard(requiredRole) {
    window.addEventListener("pageshow", () => {
        enforceAuth(requiredRole);
    });

    window.addEventListener("popstate", () => {
        enforceAuth(requiredRole);
    });
}

function formatRepairStatus(status) {
    const labels = {
        "Cho tiep nhan": "Cho tiep nhan",
        "Da tiep nhan": "Da tiep nhan",
        "Dang xu ly": "Dang xu ly",
        "Da hoan thanh": "Da hoan thanh"
    };
    return labels[status] || status;
}

function getRepairStatusClass(status) {
    if (status === "Da hoan thanh") {
        return "status-success";
    }
    if (status === "Dang xu ly" || status === "Da tiep nhan") {
        return "status-warning";
    }
    return "status-danger";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(value);
}
