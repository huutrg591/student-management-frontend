function validateForm(){

let masv = document.getElementById("masv").value;
let name = document.getElementById("name").value;
let gpa = document.getElementById("gpa").value;

if(masv === "" || name === ""){
alert("Không được để trống mã SV hoặc họ tên");
return false;
}

if(gpa < 0 || gpa > 10){
alert("Điểm phải từ 0 đến 10");
return false;
}

alert("Thêm sinh viên thành công (demo frontend)");

return true;
}