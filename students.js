const STORAGE_KEY = "sms-students";

const studentForm = document.getElementById("student-form");
const studentIdInput = document.getElementById("student-id");
const studentNameInput = document.getElementById("student-name");
const studentEmailInput = document.getElementById("student-email");
const studentMobileInput = document.getElementById("student-mobile");
const studentDobInput = document.getElementById("student-dob");
const studentCourseInput = document.getElementById("student-course");
const studentAddressInput = document.getElementById("student-address");
const editingIndexInput = document.getElementById("editing-index");
const studentSearchInput = document.getElementById("student-search");
const tableBody = document.getElementById("students-table-body");
const clearFormButton = document.getElementById("clear-form");
const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");
const genderInputs = Array.from(document.querySelectorAll('input[name="gender"]'));

let students = loadStudents();

renderStudents();

studentMobileInput.addEventListener("input", () => {
  studentMobileInput.value = studentMobileInput.value.replace(/\D/g, "").slice(0, 10);
});

clearFormButton.addEventListener("click", () => {
  resetForm();
});

studentSearchInput.addEventListener("input", () => {
  renderStudents();
});

resetButton.addEventListener("click", () => {
  resetForm();
});

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const student = getFormData();
  const validationErrors = validateStudent(student, editingIndexInput.value);

  clearErrors();

  if (Object.keys(validationErrors).length > 0) {
    showErrors(validationErrors);
    return;
  }

  const editingIndex = editingIndexInput.value;

  if (editingIndex === "") {
    students.push(student);
  } else {
    students[Number(editingIndex)] = student;
  }

  saveStudents();
  renderStudents();
  resetForm();
});

function getFormData() {
  const selectedGender = genderInputs.find((input) => input.checked);

  return {
    studentId: studentIdInput.value.trim(),
    studentName: studentNameInput.value.trim(),
    email: studentEmailInput.value.trim(),
    mobile: studentMobileInput.value.trim(),
    gender: selectedGender ? selectedGender.value : "",
    dob: studentDobInput.value,
    course: studentCourseInput.value,
    address: studentAddressInput.value.trim(),
  };
}

function validateStudent(student, editingIndex) {
  const errors = {};
  const namePattern = /^[A-Za-z ]{3,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobilePattern = /^\d{10}$/;

  if (!student.studentId) {
    errors["student-id"] = "Student ID is required.";
  } else if (students.some((entry, index) => entry.studentId.toLowerCase() === student.studentId.toLowerCase() && String(index) !== String(editingIndex))) {
    errors["student-id"] = "Student ID must be unique.";
  }

  if (!student.studentName) {
    errors["student-name"] = "Student name is required.";
  } else if (!namePattern.test(student.studentName)) {
    errors["student-name"] = "Name must contain only alphabets and be at least 3 letters.";
  }

  if (!student.email) {
    errors["student-email"] = "Email is required.";
  } else if (!emailPattern.test(student.email)) {
    errors["student-email"] = "Enter a valid email address.";
  }

  if (!student.mobile) {
    errors["student-mobile"] = "Mobile number is required.";
  } else if (!mobilePattern.test(student.mobile)) {
    errors["student-mobile"] = "Mobile number must be exactly 10 digits.";
  }

  if (!student.gender) {
    errors["gender"] = "Please select a gender.";
  }

  if (!student.dob) {
    errors["student-dob"] = "Date of birth is required.";
  } else if (!isAtLeast18(student.dob)) {
    errors["student-dob"] = "Student must be at least 18 years old.";
  }

  if (!student.course) {
    errors["student-course"] = "Please select a course.";
  }

  if (!student.address) {
    errors["student-address"] = "Address is required.";
  } else if (student.address.length < 10) {
    errors["student-address"] = "Address must be at least 10 characters long.";
  }

  return errors;
}

function isAtLeast18(dateString) {
  const dob = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 18;
}

function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorElement = document.querySelector(`[data-error-for="${field}"]`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  });
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((element) => {
    element.textContent = "";
  });
}

function renderStudents() {
  tableBody.innerHTML = "";
  const searchTerm = studentSearchInput.value.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const searchableText = [student.studentId, student.studentName, student.email].join(" ").toLowerCase();
    return searchableText.includes(searchTerm);
  });

  if (filteredStudents.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = searchTerm
      ? '<td colspan="6" class="empty-state">No matching students found.</td>'
      : '<td colspan="6" class="empty-state">No students registered yet.</td>';
    tableBody.appendChild(emptyRow);
    return;
  }

  filteredStudents.forEach((student) => {
    const index = students.indexOf(student);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(student.studentId)}</td>
      <td>${escapeHtml(student.studentName)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${escapeHtml(student.mobile)}</td>
      <td>${escapeHtml(student.address)}</td>
      <td>
        <button type="button" class="table-button edit-button" data-index="${index}">Edit</button>
        <button type="button" class="table-button delete-button" data-index="${index}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", handleEditStudent);
  });

  tableBody.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", handleDeleteStudent);
  });
}

function handleEditStudent(event) {
  const index = Number(event.currentTarget.dataset.index);
  const student = students[index];

  studentIdInput.value = student.studentId;
  studentNameInput.value = student.studentName;
  studentEmailInput.value = student.email;
  studentMobileInput.value = student.mobile;
  studentDobInput.value = student.dob;
  studentCourseInput.value = student.course;
  studentAddressInput.value = student.address;
  editingIndexInput.value = String(index);

  genderInputs.forEach((input) => {
    input.checked = input.value === student.gender;
  });

  clearErrors();
  saveButton.textContent = "Update Student";
  studentForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleDeleteStudent(event) {
  const index = Number(event.currentTarget.dataset.index);

  students.splice(index, 1);
  saveStudents();

  if (editingIndexInput.value !== "" && Number(editingIndexInput.value) === index) {
    resetForm();
  }

  renderStudents();
}

function resetForm() {
  studentForm.reset();
  editingIndexInput.value = "";
  saveButton.textContent = "Save Student";
  clearErrors();
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function loadStudents() {
  const rawStudents = localStorage.getItem(STORAGE_KEY);

  if (!rawStudents) {
    return [];
  }

  try {
    const parsedStudents = JSON.parse(rawStudents);
    return Array.isArray(parsedStudents) ? parsedStudents : [];
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
