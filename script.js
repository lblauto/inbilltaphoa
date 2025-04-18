let productsDatabase = {};
let cart = [];

// Đọc file Excel khi người dùng tải lên
document.getElementById("excelFile").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Lưu dữ liệu sản phẩm vào object
    productsDatabase = {};
    jsonData.forEach(row => {
      if (row["Mã vạch"] && row["Tên hàng hóa"] && row["Đơn giá"]) {
        productsDatabase[row["Mã vạch"].toString()] = {
          name: row["Tên hàng hóa"],
          price: parseInt(row["Đơn giá"])
        };
      }
    });

    alert("✅ Đã tải danh sách sản phẩm từ Excel!");
  };
  reader.readAsArrayBuffer(e.target.files[0]);
});

// Tự động thêm sản phẩm khi nhấn Enter (quét mã xong)
document.getElementById("barcodeInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addProduct();
  }
});

// Thêm sản phẩm vào bảng
function addProduct() {
  const barcode = document.getElementById("barcodeInput").value.trim();
  if (!barcode) return;

  const product = productsDatabase[barcode];
  if (!product) {
    alert("❌ Không tìm thấy mã vạch trong file Excel!");
    return;
  }

  const existing = cart.find(item => item.barcode === barcode);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ barcode, name: product.name, price: product.price, quantity: 1 });
  }

  document.getElementById("barcodeInput").value = "";
  renderTable();
}

// Hiển thị bảng sản phẩm
function renderTable() {
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.quantity * item.price;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toLocaleString()}</td>
      <td>${subtotal.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("totalAmount").textContent = total.toLocaleString();
}

// In hóa đơn
function printBill() {
  window.print();
}
