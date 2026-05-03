import { useEffect, useMemo, useState } from "react";
import "./index.css";
import logoImage from "./assets/logo.png";
import { supabase } from "./supabaseClient";

const STORAGE_KEYS = {
  currentUserId: "yosr_supabase_current_user_id_v2",
};

const roleOptions = [
  { value: "admin", label: "إدارية النظام" },
  { value: "committee_head", label: "رئيس لجنة الإسكان" },
  { value: "supervisor", label: "مشرف فترة" },
  { value: "field", label: "موظف ميداني" },
];

const shiftOptions = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة"];

const shiftTimes = {
  "الفترة الأولى": "8:00 ص - 4:00 م",
  "الفترة الثانية": "4:00 م - 12:00 ص",
  "الفترة الثالثة": "12:00 ص - 8:00 ص",
};

function getPermissionsByRole(role) {
  if (role === "admin") {
    return {
      canFillForms: true,
      canViewSubmissions: true,
      canViewReports: true,
      canManageUsers: true,
      canManagePermissions: true,
    };
  }

  if (role === "committee_head") {
    return {
      canFillForms: false,
      canViewSubmissions: true,
      canViewReports: true,
      canManageUsers: false,
      canManagePermissions: false,
    };
  }

  if (role === "supervisor") {
    return {
      canFillForms: false,
      canViewSubmissions: true,
      canViewReports: true,
      canManageUsers: false,
      canManagePermissions: false,
    };
  }

  return {
    canFillForms: true,
    canViewSubmissions: true,
    canViewReports: false,
    canManageUsers: false,
    canManagePermissions: false,
  };
}

const formTypes = {
  readiness: {
    title: "بيان كشف الجاهزية قبل وصول الحجاج",
    subtitle: "نموذج الكشف المبدئي قبل الوصول",
    emoji: "🏨",
    questions: [
      {
        section: "معلومات على الطبيعة",
        items: [
          "وجود جميع التراخيص والشهادات سارية المفعول",
          "إمكانية وصول آليات الدفاع المدني والباصات وصهاريج المياه",
          "وجود منحدر للاحتياجات الخاصة",
          "وجود صورة الترخيص في الاستقبال",
          "حالة المبنى غير متهالك",
          "الإضاءة كافية للغرف والممرات",
          "وجود مستودع",
          "وجود غرفة صيانة",
          "وجود أدوات النظافة وكفايتها",
        ],
      },
      {
        section: "الاستقبال",
        items: [
          "وجود وحدة استقبال / كاونتر في مدخل المبنى",
          "وجود موظفين على مدار الساعة طوال أيام الأسبوع",
          "وجود موظفين استقبال يتحدثون العربية والإنجليزية",
          "وجود حقيبة إسعافات أولية كاملة",
          "وجود خدمة واي فاي مجانية",
          "وجود خزينة لحفظ الأمانات",
          "وجود لوحة طوارئ بالمدخل باللغتين العربية والإنجليزية",
          "وجود إرشادات السلامة بلغة مستخدمي المبنى",
          "وجود رسم توضيحي لمخارج الطوارئ وكيفية الإخلاء",
        ],
      },
      {
        section: "الوحدات والغرف",
        items: [
          "وجود لوحة عند كل باب غرفة موضح عليها رقم الغرفة وعدد المرخص بإسكانه",
          "وجود مراتب نظيفة وبحالة جيدة ولا تقل سماكتها عن 12 سم",
          "وجود غطاء عازل يغطي المرتبة بالكامل",
          "وجود غطاء سرير علوي وسفلي نظيف",
          "وجود غطاء نوم قطني ووسادة لكل مرتبة",
          "وجود خزانة ملابس في كل غرفة",
          "وجود سلات مهملات داخل الغرف",
          "وجود وحدة تكييف تعمل بكفاءة في كل غرفة",
          "أبواب الغرف ونوافذها سليمة وتغلق من الداخل بإحكام",
          "وجود ثلاجة بحالة جيدة في الغرفة أو حسب المتطلب",
        ],
      },
      {
        section: "دورات المياه والمرافق المشتركة",
        items: [
          "وجود شطاف يدوي بجوار المرحاض",
          "وجود سلة مهملات تفتح عن طريق القدم",
          "وجود فرشاة تنظيف المرحاض",
          "وصول المياه إلى كافة دورات المياه",
          "وجود شفاط لسحب الهواء في دورات المياه",
          "عدم وجود تسريب في دورات المياه والجدران",
          "وجود مكان مخصص للصلاة مجهز بسجاد نظيف",
          "وجود أغطية محكمة لخزانات المياه",
          "إغلاق جميع آبار المياه إن وجدت",
        ],
      },
    ],
  },
  followup: {
    title: "استمارة متابعة مساكن الحجاج",
    subtitle: "نموذج المتابعة الميدانية أثناء التشغيل",
    emoji: "🧾",
    questions: [
      {
        section: "اشتراطات عامة",
        items: [
          "كاونتر لخدمة العملاء",
          "ملصقات بطائق نسك",
          "عدم وجود تكدس في الغرف",
          "كشافات الطوارئ",
          "عدم تخزين مواد قابلة للاشتعال",
          "جاهزية الغرف قبل وصول الحجاج بـ 6 ساعات كحد أقصى",
          "وجود غالية ماء في الغرف",
          "وجود حاوية نفايات في الممرات",
          "وجود حاويات نفايات في الغرف",
          "تخزين 25% من تجهيزات السكن",
        ],
      },
      {
        section: "السلامة والتجهيز",
        items: [
          "وجود تهوية في الممرات ومدخل السكن",
          "تجهيز الغرف بالأثاث: سرير، مخدة، لحاف",
          "وجود أدوات النظافة الشخصية في دورات المياه",
          "عدم وجود طبلونات كهربائية مكشوفة",
          "تشغيل وحدات التكييف قبل وصول الحجاج بـ 6 ساعات",
          "وجود الرقم الموحد للشركة",
          "وجود ثلاجة لا يقل حجمها عن 10 قدم في كل طابق",
          "عدم وجود طبخ في الغرف أو الممرات",
          "عدم وجود إسكان في الميزانين",
          "عدم وجود إسكان في مواقف السيارات",
        ],
      },
      {
        section: "المرافق والتراخيص",
        items: [
          "عدم وجود سكن أو تخزين بالأسطح",
          "عدم وجود أعطال في المصعد",
          "وجود مولد كهربائي احتياطي",
          "وجود خزنة لحفظ الأمانات في الاستقبال",
          "وجود مصلى رئيسي بالمبنى",
          "وجود التصاريح والتراخيص في استقبال السكن سارية المفعول",
          "وجود مساحة لكل حاج داخل الغرفة 2×2",
          "نظافة الغرف والممرات",
          "وجود برادات مياه أو عبوات مياه للشرب",
          "وجود شبك للذباب في النوافذ",
          "وجود ملصقات ولوحات إرشادية في الاستقبال والممرات",
          "وجود أرقام لجنة الشكاوى أو الدفاع المدني",
          "وجود عمالة للنظافة على مدار الساعة",
          "وجود غرفة خاصة بالاحتياجات الخاصة في كل مبنى",
        ],
      },
    ],
  },
};

const emptyForm = {
  formType: "readiness",
  housingName: "",
  buildingNumber: "",
  permitNumber: "",
  nationality: "",
  pilgrimsCount: "",
  electricityNumber: "",
  ownerName: "",
  address: "",
  visitDate: "",
  visitTime: "",
  shift: "الفترة الأولى",
  gpsStatus: "داخل النطاق",
  actionTaken: "لا توجد ملاحظات",
  deadlineHours: "",
  notes: "",
  photos: [],
};

const emptyUserForm = {
  nationalId: "",
  fullName: "",
  phone: "",
  password: "",
  role: "field",
  shift: "الفترة الأولى",
  supervisor: "—",
  status: "نشط",
  permissions: getPermissionsByRole("field"),
};

function getRoleLabel(role) {
  return roleOptions.find((item) => item.value === role)?.label || "مستخدم";
}

function toUser(row) {
  return {
    id: row.id,
    nationalId: row.national_id,
    fullName: row.full_name,
    phone: row.phone || "",
    password: row.password || "",
    role: row.role || "field",
    roleLabel: row.role_label || getRoleLabel(row.role || "field"),
    shift: row.shift || "الفترة الأولى",
    supervisor: row.supervisor || "—",
    status: row.status || "نشط",
    permissions: {
      canFillForms: !!row.can_fill_forms,
      canViewSubmissions: !!row.can_view_submissions,
      canViewReports: !!row.can_view_reports,
      canManageUsers: !!row.can_manage_users,
      canManagePermissions: !!row.can_manage_permissions,
    },
  };
}

function toVisit(row) {
  return {
    id: row.id,
    userId: row.user_id,
    employee: row.employee,
    housing: row.housing,
    permit: row.permit,
    submitTime: row.submit_time,
    shift: row.shift,
    gps: row.gps,
    photo: row.photo,
    status: row.status,
    risk: row.risk,
  };
}

function toSubmission(row) {
  return {
    id: row.id,
    userId: row.user_id,
    employee: row.employee,
    formType: row.form_type,
    housingName: row.housing_name,
    buildingNumber: row.building_number,
    permitNumber: row.permit_number,
    nationality: row.nationality,
    pilgrimsCount: row.pilgrims_count,
    electricityNumber: row.electricity_number,
    ownerName: row.owner_name,
    address: row.address,
    visitDate: row.visit_date,
    visitTime: row.visit_time,
    shift: row.shift,
    gpsStatus: row.gps_status,
    photoStatus: row.photo_status,
    actionTaken: row.action_taken,
    deadlineHours: row.deadline_hours,
    notes: row.notes,
    answers: row.answers || {},
    photos: row.photos || [],
    submittedAt: row.submitted_at,
    status: row.status,
    risk: row.risk,
  };
}

function getStatusClass(status) {
  if (status === "نشط" || status === "معتمدة") return "success";
  if (status === "موقوف" || status === "مرفوضة") return "danger";
  return "warning";
}

function getRiskClass(risk) {
  if (risk === "مرتفع") return "danger";
  if (risk === "متوسط") return "warning";
  return "success";
}

function getNowTime() {
  return new Date().toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayDate() {
  return new Date().toLocaleDateString("ar-SA");
}

function canSeeAll(user) {
  return user.role === "admin" || user.role === "committee_head";
}

function canSeeByShift(user) {
  return user.role === "supervisor";
}

function filterByUserAccess(items, user) {
  if (canSeeAll(user)) return items;
  if (canSeeByShift(user)) return items.filter((item) => item.shift === user.shift);
  return items.filter((item) => item.userId === user.id);
}

function getDefaultView(user) {
  if (user.permissions.canViewReports) return "overview";
  if (user.permissions.canFillForms) return "field";
  if (user.permissions.canViewSubmissions) return "submissions";
  return "profile";
}

function getSupervisorByRole(role, shift, users) {
  if (role === "admin" || role === "committee_head") return "—";
  if (role === "supervisor") return "رئيس لجنة الإسكان";

  const shiftSupervisor = users.find(
    (user) => user.role === "supervisor" && user.shift === shift && user.status === "نشط"
  );

  return shiftSupervisor?.fullName || "—";
}

function ThemeToggle({ theme, onToggleTheme }) {
  const nextLabel = theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";
  const nextIcon = theme === "dark" ? "☀️" : "🌙";

  return (
    <button type="button" className="theme-toggle" onClick={onToggleTheme}>
      <span className="theme-toggle-icon">{nextIcon}</span>
      <div className="theme-toggle-copy">
        <strong>{nextLabel}</strong>
        <small>{theme === "dark" ? "Light Mode" : "Dark Mode"}</small>
      </div>
    </button>
  );
}

function LoginPage({ onLogin, onForgotPassword, theme, onToggleTheme }) {
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = await onLogin(nationalId.trim(), password.trim());

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-shell">
        <div className="auth-visual">
          <div className="auth-topbar">
            <div className="auth-brand-inline">
              <img src={logoImage} alt="يسر المشاعر" className="auth-logo-image" />
              <div className="auth-company">
                <h3>يسر المشاعر</h3>
                <span>Yosr Al Mashaer</span>
              </div>
            </div>

            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>

          <div className="auth-badge">نظام رقابة ميدانية</div>
          <h1>توثيق جولات مساكن الحجاج</h1>

          <div className="auth-points">
            <span>📍 تحقق بالموقع</span>
            <span>📸 توثيق بالصورة</span>
            <span>⏱️ قياس مدة الكشف</span>
            <span>🧾 نماذج إلكترونية</span>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <span>مرحبًا بك</span>
            <h2>تسجيل الدخول</h2>
            <p>
              أدخل بيانات الحساب المعتمد للمتابعة إلى نظام الجولات الميدانية التابعة
              للجنة الإسكان.
            </p>
          </div>

          <label>
            رقم الهوية
            <input
              type="text"
              value={nationalId}
              onChange={(event) => setNationalId(event.target.value)}
              placeholder="رقم الهوية"
              autoComplete="username"
            />
          </label>

          <label>
            كلمة المرور
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="كلمة المرور"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="executive-note">
              <p style={{ color: "var(--danger)", fontWeight: 900 }}>{error}</p>
            </div>
          )}

          <div className="auth-row">
            <label className="remember">
              <input type="checkbox" defaultChecked />
              تذكرني
            </label>

            <button type="button" className="link-button" onClick={onForgotPassword}>
              نسيت كلمة المرور؟
            </button>
          </div>

          <button type="submit" className="main-submit">
            دخول للنظام
          </button>
        </form>
      </section>
    </main>
  );
}

function ForgotPasswordPage({ onBack, theme, onToggleTheme }) {
  return (
    <main className="auth-page" dir="rtl">
      <section className="reset-shell">
        <div className="reset-toolbar">
          <div className="reset-brand">
            <img src={logoImage} alt="يسر المشاعر" className="mini-brand-logo" />
            <div className="mini-brand-copy">
              <strong>يسر المشاعر</strong>
              <span>Yosr Al Mashaer</span>
            </div>
          </div>

          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </div>

        <div className="reset-card">
          <div className="reset-icon">🔐</div>
          <h1>استعادة كلمة المرور</h1>
          <p>يرجى التواصل مع إدارة النظام لإعادة ضبط بيانات الدخول.</p>

          <button type="button" className="ghost-submit" onClick={onBack}>
            رجوع لتسجيل الدخول
          </button>
        </div>
      </section>
    </main>
  );
}

function ProfilePage({ employee, onBack, theme, onToggleTheme }) {
  return (
    <main className="app-page" dir="rtl">
      <header className="topbar">
        <div>
          <span>الملف التعريفي</span>
          <h1>بيانات المستخدم</h1>
        </div>

        <div className="topbar-actions">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <button type="button" className="topbar-btn" onClick={onBack}>
            رجوع للوحة
          </button>
        </div>
      </header>

      <section className="profile-shell">
        <div className="profile-card main-profile">
          <div className="profile-avatar">{employee.fullName.charAt(0)}</div>
          <h2>{employee.fullName}</h2>
          <p>{employee.roleLabel || getRoleLabel(employee.role)}</p>
          <span className={`status-badge ${getStatusClass(employee.status)}`}>
            {employee.status}
          </span>
        </div>

        <div className="profile-card">
          <h3>بيانات الحساب</h3>
          <div className="profile-list">
            <div>
              <span>رقم الهوية</span>
              <strong>{employee.nationalId || "—"}</strong>
            </div>
            <div>
              <span>رقم الجوال</span>
              <strong>{employee.phone || "—"}</strong>
            </div>
            <div>
              <span>الدور</span>
              <strong>{employee.roleLabel || getRoleLabel(employee.role)}</strong>
            </div>
            <div>
              <span>الفترة</span>
              <strong>{employee.shift}</strong>
            </div>
            <div>
              <span>المسؤول المباشر</span>
              <strong>{employee.supervisor}</strong>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>الصلاحيات</h3>
          <div className="notes-list">
            <span className="note-chip">
              {employee.permissions.canFillForms ? "✅" : "🔒"} تعبئة الاستمارات
            </span>
            <span className="note-chip">
              {employee.permissions.canViewSubmissions ? "✅" : "🔒"} سجل التعبئة
            </span>
            <span className="note-chip">
              {employee.permissions.canViewReports ? "✅" : "🔒"} التقارير
            </span>
            <span className="note-chip">
              {employee.permissions.canManageUsers ? "✅" : "🔒"} إدارة المستخدمين
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function UserManagementPage({ users, loadAllData, currentUser }) {
  const [form, setForm] = useState(emptyUserForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function updateForm(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "role") {
        next.permissions = getPermissionsByRole(value);
        next.roleLabel = getRoleLabel(value);
        next.shift =
          value === "admin" || value === "committee_head"
            ? "كل الفترات"
            : current.shift === "كل الفترات"
            ? "الفترة الأولى"
            : current.shift;
        next.supervisor = getSupervisorByRole(value, next.shift, users);
      }

      if (field === "shift") {
        next.supervisor = getSupervisorByRole(current.role, value, users);
      }

      return next;
    });
  }

  function updatePermission(permissionName) {
    setForm((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [permissionName]: !current.permissions[permissionName],
      },
    }));
  }

  function resetForm() {
    setForm(emptyUserForm);
    setEditingId(null);
  }

  async function saveUser(event) {
    event.preventDefault();
    setSaving(true);

    if (!form.nationalId.trim() || !form.fullName.trim() || !form.password.trim()) {
      alert("رقم الهوية والاسم الكامل وكلمة المرور حقول مطلوبة.");
      setSaving(false);
      return;
    }

    const duplicate = users.some(
      (user) => user.nationalId.trim() === form.nationalId.trim() && user.id !== editingId
    );

    if (duplicate) {
      alert("رقم الهوية مستخدم مسبقًا.");
      setSaving(false);
      return;
    }

    const finalSupervisor = getSupervisorByRole(form.role, form.shift, users);

    const payload = {
      national_id: form.nationalId.trim(),
      full_name: form.fullName.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      role_label: form.role === "supervisor" ? `مشرف ${form.shift}` : getRoleLabel(form.role),
      shift: form.shift,
      supervisor: finalSupervisor,
      status: form.status,
      can_fill_forms: form.permissions.canFillForms,
      can_view_submissions: form.permissions.canViewSubmissions,
      can_view_reports: form.permissions.canViewReports,
      can_manage_users: form.permissions.canManageUsers,
      can_manage_permissions: form.permissions.canManagePermissions,
    };

    const query = editingId
      ? supabase.from("users_profiles").update(payload).eq("id", editingId)
      : supabase.from("users_profiles").insert(payload);

    const { error } = await query;

    if (error) {
      alert(`تعذر حفظ المستخدم: ${error.message}`);
      setSaving(false);
      return;
    }

    await loadAllData();
    resetForm();
    setSaving(false);
  }

  function editUser(user) {
    setEditingId(user.id);
    setForm({
      nationalId: user.nationalId || "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      password: user.password || "",
      role: user.role || "field",
      shift: user.shift || "الفترة الأولى",
      supervisor: user.supervisor || "—",
      status: user.status || "نشط",
      permissions: user.permissions || getPermissionsByRole(user.role || "field"),
    });
  }

  async function toggleStatus(userId, currentStatus) {
    if (userId === currentUser.id) {
      alert("لا يمكن إيقاف الحساب الحالي.");
      return;
    }

    const { error } = await supabase
      .from("users_profiles")
      .update({ status: currentStatus === "نشط" ? "موقوف" : "نشط" })
      .eq("id", userId);

    if (error) {
      alert(`تعذر تعديل حالة الحساب: ${error.message}`);
      return;
    }

    await loadAllData();
  }

  async function deleteUser(userId) {
    if (userId === currentUser.id) {
      alert("لا يمكن حذف الحساب الحالي.");
      return;
    }

    const confirmDelete = window.confirm("هل تريد حذف هذا المستخدم؟");
    if (!confirmDelete) return;

    const { error } = await supabase.from("users_profiles").delete().eq("id", userId);

    if (error) {
      alert(`تعذر حذف المستخدم: ${error.message}`);
      return;
    }

    await loadAllData();
  }

  return (
    <section className="content-grid">
      <form className="content-card wide" onSubmit={saveUser}>
        <div className="card-head">
          <div>
            <h3>👥 إدارة المستخدمين والصلاحيات</h3>
            <p>إنشاء الحسابات وتحديد الصلاحيات وحالة التفعيل.</p>
          </div>

          {editingId && (
            <button type="button" className="mini-btn" onClick={resetForm}>
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="field-form-layout">
          <div className="form-card">
            <h3>{editingId ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h3>

            <div className="form-grid">
              <label>
                رقم الهوية
                <input
                  type="text"
                  value={form.nationalId}
                  onChange={(event) => updateForm("nationalId", event.target.value)}
                  placeholder="رقم الهوية"
                />
              </label>

              <label>
                الاسم الكامل
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateForm("fullName", event.target.value)}
                  placeholder="الاسم الكامل"
                />
              </label>

              <label>
                رقم الجوال
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                  placeholder="رقم الجوال"
                />
              </label>

              <label>
                كلمة المرور
                <input
                  type="text"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  placeholder="كلمة المرور"
                />
              </label>

              <label>
                الدور الوظيفي
                <select value={form.role} onChange={(event) => updateForm("role", event.target.value)}>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                الفترة
                <select
                  value={form.shift}
                  onChange={(event) => updateForm("shift", event.target.value)}
                  disabled={form.role === "admin" || form.role === "committee_head"}
                >
                  <option>كل الفترات</option>
                  {shiftOptions.map((shift) => (
                    <option key={shift}>{shift}</option>
                  ))}
                </select>
              </label>

              <label>
                المسؤول المباشر
                <input type="text" value={form.supervisor} disabled />
              </label>

              <label>
                حالة الحساب
                <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                  <option>نشط</option>
                  <option>موقوف</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-card">
            <h3>صلاحيات الحساب</h3>

            <div className="notes-list">
              {Object.entries({
                canFillForms: "تعبئة الاستمارات",
                canViewSubmissions: "مشاهدة سجل التعبئة",
                canViewReports: "مشاهدة التقارير والرقابة",
                canManageUsers: "إدارة المستخدمين",
                canManagePermissions: "تعديل الصلاحيات",
              }).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={`mini-btn ${form.permissions[key] ? "active" : ""}`}
                  onClick={() => updatePermission(key)}
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    display: "flex",
                    alignItems: "center",
                    background: form.permissions[key]
                      ? "rgba(66, 199, 137, 0.18)"
                      : "var(--toggle-bg)",
                  }}
                >
                  <span>{label}</span>
                  <strong>{form.permissions[key] ? "مفتوحة ✅" : "مقفلة 🔒"}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="submit-row">
          <button type="submit" className="main-submit" disabled={saving}>
            {saving ? "جاري الحفظ..." : editingId ? "حفظ تعديل المستخدم" : "إنشاء المستخدم"}
          </button>
        </div>
      </form>

      <div className="content-card wide">
        <div className="card-head">
          <div>
            <h3>قائمة المستخدمين</h3>
            <p>الحسابات المعتمدة في النظام</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم الهوية</th>
                <th>الجوال</th>
                <th>الدور</th>
                <th>الفترة</th>
                <th>المسؤول المباشر</th>
                <th>الحالة</th>
                <th>الصلاحيات</th>
                <th>إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.nationalId || "—"}</td>
                  <td>{user.phone || "—"}</td>
                  <td>{user.roleLabel || getRoleLabel(user.role)}</td>
                  <td>{user.shift}</td>
                  <td>{user.supervisor}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge success">
                      {Object.values(user.permissions || {}).filter(Boolean).length} مفتوحة
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button type="button" className="mini-btn" onClick={() => editUser(user)}>
                        تعديل
                      </button>
                      <button type="button" className="mini-btn" onClick={() => toggleStatus(user.id, user.status)}>
                        {user.status === "نشط" ? "إيقاف" : "تفعيل"}
                      </button>
                      <button type="button" className="mini-btn" onClick={() => deleteUser(user.id)}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function VisitsTable({ visits, compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>الموظف</th>
            <th>السكن</th>
            <th>رقم التصريح</th>
            <th>وقت الإرسال</th>
            <th>الفترة</th>
            <th>الموقع</th>
            <th>الصورة</th>
            <th>الحالة</th>
            {!compact && <th>الخطورة</th>}
          </tr>
        </thead>

        <tbody>
          {visits.length === 0 ? (
            <tr>
              <td colSpan={compact ? "8" : "9"}>لا توجد جولات مسجلة.</td>
            </tr>
          ) : (
            visits.map((visit) => (
              <tr key={visit.id}>
                <td>{visit.employee}</td>
                <td>{visit.housing}</td>
                <td>{visit.permit}</td>
                <td>{visit.submitTime}</td>
                <td>{visit.shift}</td>
                <td>{visit.gps}</td>
                <td>{visit.photo}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(visit.status)}`}>
                    {visit.status}
                  </span>
                </td>
                {!compact && (
                  <td>
                    <span className={`status-badge ${getRiskClass(visit.risk)}`}>
                      {visit.risk}
                    </span>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PrintableSubmission({ submission }) {
  const formMeta = formTypes[submission.formType];

  return (
    <div style={{ display: "none" }}>
      <div id={`print-${submission.id}`}>
        <div style={{ direction: "rtl", fontFamily: "Arial, sans-serif", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <img src={logoImage} alt="يسر المشاعر" style={{ width: "110px", height: "80px", objectFit: "contain" }} />
            <div>
              <h1 style={{ margin: 0, fontSize: "24px" }}>يسر المشاعر</h1>
              <p style={{ margin: "6px 0 0", color: "#555" }}>نظام الجولات الميدانية لمساكن الحجاج</p>
            </div>
          </div>

          <h2 style={{ borderBottom: "2px solid #5e1c84", paddingBottom: "12px" }}>
            {formMeta.title}
          </h2>

          <h3>بيانات الزيارة</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <tbody>
              {[
                ["اسم الموظف", submission.employee],
                ["اسم السكن", submission.housingName || "—"],
                ["رقم التصريح", submission.permitNumber || "—"],
                ["رقم العمارة", submission.buildingNumber || "—"],
                ["الجنسية", submission.nationality || "—"],
                ["عدد الحجاج", submission.pilgrimsCount || "—"],
                ["الفترة", submission.shift],
                ["تاريخ الزيارة", submission.visitDate || "—"],
                ["وقت الزيارة", submission.visitTime || "—"],
                ["وقت الإرسال", submission.submittedAt],
                ["حالة الموقع", submission.gpsStatus],
                ["حالة الصورة", submission.photoStatus],
                ["الحالة", submission.status],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ border: "1px solid #ddd", padding: "10px", fontWeight: "bold", width: "30%" }}>
                    {label}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>إجابات بنود الكشف</h3>
          {formMeta.questions.map((section) => (
            <div key={section.section} style={{ marginBottom: "18px" }}>
              <h4 style={{ color: "#5e1c84" }}>{section.section}</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {section.items.map((item) => (
                    <tr key={item}>
                      <td style={{ border: "1px solid #ddd", padding: "9px", width: "75%" }}>{item}</td>
                      <td style={{ border: "1px solid #ddd", padding: "9px", fontWeight: "bold" }}>
                        {submission.answers[item] || "لم يحدد"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <h3>الملاحظات</h3>
          <p style={{ border: "1px solid #ddd", padding: "12px", minHeight: "70px" }}>
            {submission.notes || "لا توجد ملاحظات مدخلة."}
          </p>

          {submission.photos?.length > 0 && (
            <>
              <h3>الصور المرفقة</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {submission.photos.map((photo) => (
                  <div key={photo.id}>
                    <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>{photo.label}</p>
                    <img
                      src={photo.url}
                      alt={photo.label}
                      style={{
                        width: "100%",
                        maxHeight: "260px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: "36px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <strong>توقيع الموظف:</strong>
              <div style={{ borderBottom: "1px solid #333", height: "42px" }} />
            </div>
            <div>
              <strong>اعتماد المشرف:</strong>
              <div style={{ borderBottom: "1px solid #333", height: "42px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionDetails({ submission, onBack, theme, onToggleTheme }) {
  const formMeta = formTypes[submission.formType];

  function printSubmission() {
    const printContent = document.getElementById(`print-${submission.id}`)?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>${formMeta.title}</title>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <main className="app-page" dir="rtl">
      <PrintableSubmission submission={submission} />

      <header className="topbar">
        <div>
          <span>تفاصيل التعبئة</span>
          <h1>{formMeta.title}</h1>
        </div>

        <div className="topbar-actions">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <button type="button" className="topbar-btn" onClick={printSubmission}>
            🖨️ طباعة الاستمارة
          </button>
          <button type="button" className="topbar-btn" onClick={onBack}>
            رجوع للسجل
          </button>
        </div>
      </header>

      <section className="details-shell">
        <div className="details-hero">
          <div>
            <span>
              {formMeta.emoji} {formMeta.subtitle}
            </span>
            <h2>{submission.housingName || "سكن بدون اسم"}</h2>
            <p>
              الموظف: {submission.employee} · الفترة: {submission.shift} · وقت الإرسال:{" "}
              {submission.submittedAt}
            </p>
          </div>

          <span className={`status-badge ${getStatusClass(submission.status)}`}>
            {submission.status}
          </span>
        </div>

        <div className="details-grid">
          <div className="profile-card">
            <h3>بيانات السكن</h3>
            <div className="profile-list">
              <div>
                <span>رقم التصريح</span>
                <strong>{submission.permitNumber || "—"}</strong>
              </div>
              <div>
                <span>رقم العمارة</span>
                <strong>{submission.buildingNumber || "—"}</strong>
              </div>
              <div>
                <span>الجنسية</span>
                <strong>{submission.nationality || "—"}</strong>
              </div>
              <div>
                <span>عدد الحجاج</span>
                <strong>{submission.pilgrimsCount || "—"}</strong>
              </div>
              <div>
                <span>رقم اشتراك الكهرباء</span>
                <strong>{submission.electricityNumber || "—"}</strong>
              </div>
              <div>
                <span>اسم المالك / المستأجر</span>
                <strong>{submission.ownerName || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>توثيق الزيارة</h3>
            <div className="profile-list">
              <div>
                <span>التاريخ</span>
                <strong>{submission.visitDate || "—"}</strong>
              </div>
              <div>
                <span>الوقت</span>
                <strong>{submission.visitTime || "—"}</strong>
              </div>
              <div>
                <span>الموقع</span>
                <strong>{submission.gpsStatus}</strong>
              </div>
              <div>
                <span>الصورة</span>
                <strong>{submission.photoStatus}</strong>
              </div>
              <div>
                <span>الإجراء المتخذ</span>
                <strong>{submission.actionTaken}</strong>
              </div>
              <div>
                <span>المهلة</span>
                <strong>{submission.deadlineHours || "لا يوجد"}</strong>
              </div>
            </div>
          </div>
        </div>

        {submission.photos?.length > 0 && (
          <div className="content-card wide">
            <div className="card-head">
              <div>
                <h3>📸 الصور المرفقة</h3>
                <p>صور التوثيق المرفوعة مع الاستمارة</p>
              </div>
            </div>

            <div className="summary-grid">
              {submission.photos.map((photo) => (
                <div className="summary-box" key={photo.id}>
                  <span>{photo.label}</span>
                  <img
                    src={photo.url}
                    alt={photo.label}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                      borderRadius: "18px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="content-card wide">
          <div className="card-head">
            <div>
              <h3>إجابات بنود الكشف</h3>
              <p>الاختيارات المدخلة في الاستمارة</p>
            </div>
          </div>

          <div className="answer-review">
            {formMeta.questions.map((section) => (
              <div className="review-section" key={section.section}>
                <h3>{section.section}</h3>
                {section.items.map((item) => (
                  <div className="review-item" key={item}>
                    <span>{item}</span>
                    <strong>{submission.answers[item] || "لم يحدد"}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="content-card wide">
          <div className="card-head">
            <div>
              <h3>الملاحظات</h3>
              <p>ملاحظات الزيارة والإجراء المتخذ</p>
            </div>
          </div>

          <div className="executive-note">
            <p>{submission.notes || "لا توجد ملاحظات مدخلة."}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardPage({
  user,
  users,
  loadAllData,
  visits,
  submissions,
  onLogout,
  onProfile,
  onOpenSubmission,
  theme,
  onToggleTheme,
}) {
  const [activeView, setActiveView] = useState(getDefaultView(user));
  const [savingForm, setSavingForm] = useState(false);
  const [formData, setFormData] = useState({
    ...emptyForm,
    shift: user.shift === "كل الفترات" ? "الفترة الأولى" : user.shift,
    visitDate: getTodayDate(),
    visitTime: getNowTime(),
  });
  const [answers, setAnswers] = useState({});

  const visibleVisits = useMemo(() => filterByUserAccess(visits, user), [visits, user]);
  const visibleSubmissions = useMemo(
    () => filterByUserAccess(submissions, user),
    [submissions, user]
  );
  const activeForm = formTypes[formData.formType];

  const summary = useMemo(() => {
    const total = visibleVisits.length;
    const first = visibleVisits.filter((item) => item.shift === "الفترة الأولى").length;
    const second = visibleVisits.filter((item) => item.shift === "الفترة الثانية").length;
    const third = visibleVisits.filter((item) => item.shift === "الفترة الثالثة").length;
    const review = visibleVisits.filter((item) => item.status === "تحتاج مراجعة").length;
    const approved = visibleVisits.filter((item) => item.status === "معتمدة").length;
    const outside = visibleVisits.filter((item) => item.gps === "خارج النطاق").length;
    const noPhoto = visibleVisits.filter((item) => item.photo === "غير مرفقة").length;
    const compliance = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, first, second, third, review, approved, outside, noPhoto, compliance };
  }, [visibleVisits]);

  const priorityItems = useMemo(() => {
    const items = [];

    if (summary.review > 0) {
      items.push({
        label: "نماذج تحتاج مراجعة",
        value: summary.review,
        note: "تحتاج إجراء من المشرف",
      });
    }

    if (summary.outside > 0) {
      items.push({
        label: "جولات خارج النطاق",
        value: summary.outside,
        note: "تحتاج تحقق من الموقع",
      });
    }

    if (summary.noPhoto > 0) {
      items.push({
        label: "جولات بدون صورة",
        value: summary.noPhoto,
        note: "تحتاج استكمال توثيق",
      });
    }

    if (items.length === 0) {
      items.push({
        label: "الوضع مستقر",
        value: "✓",
        note: "لا توجد أولويات حرجة حاليًا",
      });
    }

    return items;
  }, [summary]);

  const tabs = [
    {
      id: "overview",
      label: "📌 مركز العمليات",
      visible: user.permissions.canViewReports,
    },
    {
      id: "field",
      label: "📝 تعبئة استمارة",
      visible: user.permissions.canFillForms,
    },
    {
      id: "submissions",
      label: user.role === "field" ? "📚 تعبئاتي" : "📚 سجل التعبئة",
      visible: user.permissions.canViewSubmissions,
    },
    {
      id: "users",
      label: "👥 إدارة المستخدمين",
      visible: user.permissions.canManageUsers,
    },
    {
      id: "reports",
      label: "🛡️ التقارير",
      visible: user.permissions.canViewReports,
    },
  ].filter((tab) => tab.visible);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeView)) {
      setActiveView(tabs[0]?.id || "profile");
    }
  }, [activeView, tabs]);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateAnswer(question, value) {
    setAnswers((current) => ({
      ...current,
      [question]: value,
    }));
  }

  function handlePhotoUpload(event, label) {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const newPhoto = {
      id: `${label}-${Date.now()}`,
      label,
      name: file.name,
      file,
      previewUrl,
    };

    setFormData((current) => ({
      ...current,
      photos: [...current.photos.filter((photo) => photo.label !== label), newPhoto],
    }));
  }

  async function uploadPhotos(submissionId, photos) {
    const uploaded = [];

    for (const photo of photos) {
      const extension = photo.name.split(".").pop() || "jpg";
      const safeName = `${submissionId}/${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}.${extension}`;

      const { error } = await supabase.storage.from("inspection-photos").upload(safeName, photo.file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = supabase.storage.from("inspection-photos").getPublicUrl(safeName);

      uploaded.push({
        id: photo.id,
        label: photo.label,
        name: photo.name,
        path: safeName,
        url: data.publicUrl,
      });
    }

    return uploaded;
  }

  async function submitInspection(event) {
    event.preventDefault();
    setSavingForm(true);

    try {
      const selectedShift =
        user.role === "field" && user.shift !== "كل الفترات" ? user.shift : formData.shift;

      const hasPhotos = formData.photos.length > 0;
      const isNeedsReview =
        formData.gpsStatus === "خارج النطاق" ||
        !hasPhotos ||
        formData.actionTaken !== "لا توجد ملاحظات";

      const status = isNeedsReview ? "تحتاج مراجعة" : "معتمدة";
      const risk =
        formData.gpsStatus === "خارج النطاق" || !hasPhotos
          ? "مرتفع"
          : formData.actionTaken !== "لا توجد ملاحظات"
          ? "متوسط"
          : "منخفض";

      const draftSubmission = {
        user_id: user.id,
        employee: user.fullName,
        form_type: formData.formType,
        housing_name: formData.housingName || "",
        building_number: formData.buildingNumber || "",
        permit_number: formData.permitNumber || "",
        nationality: formData.nationality || "",
        pilgrims_count: formData.pilgrimsCount || "",
        electricity_number: formData.electricityNumber || "",
        owner_name: formData.ownerName || "",
        address: formData.address || "",
        visit_date: formData.visitDate || "",
        visit_time: formData.visitTime || "",
        shift: selectedShift,
        gps_status: formData.gpsStatus,
        photo_status: hasPhotos ? "مرفقة" : "غير مرفقة",
        action_taken: formData.actionTaken,
        deadline_hours: formData.deadlineHours || "",
        notes: formData.notes || "",
        answers,
        photos: [],
        submitted_at: getNowTime(),
        status,
        risk,
      };

      const { data: insertedSubmission, error: submissionError } = await supabase
        .from("submissions")
        .insert(draftSubmission)
        .select()
        .single();

      if (submissionError) throw new Error(submissionError.message);

      let uploadedPhotos = [];

      if (formData.photos.length > 0) {
        uploadedPhotos = await uploadPhotos(insertedSubmission.id, formData.photos);

        const { error: updateError } = await supabase
          .from("submissions")
          .update({
            photos: uploadedPhotos,
            photo_status: "مرفقة",
          })
          .eq("id", insertedSubmission.id);

        if (updateError) throw new Error(updateError.message);
      }

      const { error: visitError } = await supabase.from("visits").insert({
        user_id: user.id,
        employee: user.fullName,
        housing: formData.housingName || "سكن غير محدد",
        permit: formData.permitNumber || "—",
        submit_time: getNowTime(),
        shift: selectedShift,
        gps: formData.gpsStatus,
        photo: uploadedPhotos.length > 0 ? "مرفقة" : "غير مرفقة",
        status,
        risk,
      });

      if (visitError) throw new Error(visitError.message);

      await loadAllData();

      setFormData({
        ...emptyForm,
        shift: user.shift === "كل الفترات" ? "الفترة الأولى" : user.shift,
        visitDate: getTodayDate(),
        visitTime: getNowTime(),
      });

      setAnswers({});
      setActiveView("submissions");
    } catch (error) {
      alert(`تعذر حفظ الاستمارة: ${error.message}`);
    } finally {
      setSavingForm(false);
    }
  }

  return (
    <main className="app-page" dir="rtl">
      <header className="system-hero">
        <div className="hero-top">
          <div className="brand-area">
            <img src={logoImage} alt="يسر المشاعر" className="brand-logo-image" />

            <div className="brand-text">
              <div className="brand-company">
                <h3>يسر المشاعر</h3>
                <span>Yosr Al Mashaer</span>
              </div>

              <h1>نظام الجولات الميدانية لمساكن الحجاج</h1>
            </div>
          </div>

          <div className="hero-actions">
            <button type="button" className="user-chip" onClick={onProfile}>
              <span>{user.fullName.charAt(0)}</span>
              <div>
                <strong>{user.fullName}</strong>
                <small>{user.roleLabel || getRoleLabel(user.role)}</small>
              </div>
            </button>

            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

            <button type="button" className="logout-btn" onClick={onLogout}>
              خروج
            </button>
          </div>
        </div>

        <nav className="hero-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`hero-tab ${activeView === tab.id ? "active" : ""}`}
              onClick={() => setActiveView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="dashboard-shell">
        {activeView !== "field" && (
          <section className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon purple">🧭</div>
              <span>إجمالي الجولات</span>
              <strong>{summary.total}</strong>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green">✅</div>
              <span>معتمدة</span>
              <strong>{summary.approved}</strong>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon red">⚠️</div>
              <span>تحتاج مراجعة</span>
              <strong>{summary.review}</strong>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon orange">📍</div>
              <span>خارج النطاق</span>
              <strong>{summary.outside}</strong>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon mint">📸</div>
              <span>بدون صورة</span>
              <strong>{summary.noPhoto}</strong>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon purple">📊</div>
              <span>نسبة الالتزام</span>
              <strong>{summary.compliance}%</strong>
            </div>
          </section>
        )}

        {activeView === "overview" && (
          <>
            <section className="overview-panel">
              <div>
                <span>مركز العمليات</span>
                <h2>متابعة الجولات الميدانية حسب الصلاحية</h2>
                <p>
                  تعرض هذه الصفحة مؤشرات التشغيل، أولويات المراجعة، وآخر الجولات المسجلة.
                </p>
              </div>

              <div className="system-status">
                <strong>🟢 تشغيل نشط</strong>
                <small>
                  {user.shift === "كل الفترات"
                    ? "كل الفترات"
                    : `${user.shift} · ${shiftTimes[user.shift]}`}
                </small>
              </div>
            </section>

            <section className="command-layout">
              <div className="command-main">
                <span>🎯 الأولوية الآن</span>
                <h2>{priorityItems[0]?.label}</h2>
                <p>{priorityItems[0]?.note}</p>

                <div className="command-footer">
                  {priorityItems.map((item) => (
                    <div key={item.label}>
                      <strong>{item.value}</strong>
                      <small>{item.label}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mini-command">
                <span>🕓 الفترة الأعلى نشاطًا</span>
                <strong>
                  {
                    [
                      ["الفترة الأولى", summary.first],
                      ["الفترة الثانية", summary.second],
                      ["الفترة الثالثة", summary.third],
                    ].sort((a, b) => b[1] - a[1])[0][0]
                  }
                </strong>
              </div>

              <div className="mini-command danger">
                <span>⚠️ تحتاج إجراء</span>
                <strong>{summary.review + summary.outside + summary.noPhoto}</strong>
              </div>
            </section>

            <section className="content-grid">
              <div className="content-card">
                <div className="card-head">
                  <div>
                    <h3>📊 توزيع الجولات حسب الفترة</h3>
                    <p>قراءة سريعة لحركة التشغيل</p>
                  </div>
                </div>

                <div className="period-bars">
                  {shiftOptions.map((shift) => {
                    const value =
                      shift === "الفترة الأولى"
                        ? summary.first
                        : shift === "الفترة الثانية"
                        ? summary.second
                        : summary.third;

                    return (
                      <div className="period-row" key={shift}>
                        <div>
                          <strong>{shift}</strong>
                          <span>{shiftTimes[shift]}</span>
                        </div>
                        <div className="period-track">
                          <span style={{ width: `${Math.max(value * 18, 8)}%` }} />
                        </div>
                        <b>{value}</b>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="content-card">
                <div className="card-head">
                  <div>
                    <h3>🛡️ مؤشرات التحقق</h3>
                    <p>الموقع، الصورة، حالة الاعتماد</p>
                  </div>
                </div>

                <div className="summary-grid">
                  <div className="summary-box">
                    <span>📍 داخل النطاق</span>
                    <strong>
                      {visibleVisits.filter((item) => item.gps === "داخل النطاق").length}
                    </strong>
                  </div>

                  <div className="summary-box danger-box">
                    <span>📍 خارج النطاق</span>
                    <strong>{summary.outside}</strong>
                  </div>

                  <div className="summary-box">
                    <span>📸 صور مرفقة</span>
                    <strong>
                      {visibleVisits.filter((item) => item.photo === "مرفقة").length}
                    </strong>
                  </div>

                  <div className="summary-box warning-box">
                    <span>🧾 النماذج</span>
                    <strong>{visibleSubmissions.length}</strong>
                  </div>
                </div>
              </div>

              <div className="content-card wide">
                <div className="card-head">
                  <div>
                    <h3>🧾 آخر الجولات الميدانية</h3>
                    <p>آخر خمس جولات مسجلة</p>
                  </div>

                  {user.permissions.canViewSubmissions && (
                    <button type="button" className="mini-btn" onClick={() => setActiveView("submissions")}>
                      عرض السجل
                    </button>
                  )}
                </div>

                <VisitsTable visits={visibleVisits.slice(0, 5)} compact />
              </div>
            </section>
          </>
        )}

        {activeView === "field" && (
          <section className="content-grid">
            <form className="content-card wide" onSubmit={submitInspection}>
              <div className="card-head">
                <div>
                  <h3>📝 تعبئة استمارة كشف ميداني</h3>
                  <p>اختيار النموذج وتعبئة بيانات الزيارة.</p>
                </div>
              </div>

              <div className="form-type-switch">
                {Object.entries(formTypes).map(([key, item]) => (
                  <button
                    type="button"
                    key={key}
                    className={formData.formType === key ? "active" : ""}
                    onClick={() => {
                      updateField("formType", key);
                      setAnswers({});
                    }}
                  >
                    <span>{item.emoji}</span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </button>
                ))}
              </div>

              <div className="field-form-layout">
                <div className="form-card">
                  <h3>بيانات السكن</h3>

                  <div className="form-grid">
                    <label>
                      اسم السكن
                      <input
                        type="text"
                        value={formData.housingName}
                        onChange={(event) => updateField("housingName", event.target.value)}
                        placeholder="اسم السكن"
                      />
                    </label>

                    <label>
                      رقم العمارة
                      <input
                        type="text"
                        value={formData.buildingNumber}
                        onChange={(event) => updateField("buildingNumber", event.target.value)}
                        placeholder="رقم العمارة"
                      />
                    </label>

                    <label>
                      رقم التصريح
                      <input
                        type="text"
                        value={formData.permitNumber}
                        onChange={(event) => updateField("permitNumber", event.target.value)}
                        placeholder="رقم التصريح"
                      />
                    </label>

                    <label>
                      الجنسية
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(event) => updateField("nationality", event.target.value)}
                        placeholder="الجنسية"
                      />
                    </label>

                    <label>
                      عدد الحجاج
                      <input
                        type="number"
                        value={formData.pilgrimsCount}
                        onChange={(event) => updateField("pilgrimsCount", event.target.value)}
                        placeholder="عدد الحجاج"
                      />
                    </label>

                    <label>
                      رقم اشتراك الكهرباء
                      <input
                        type="text"
                        value={formData.electricityNumber}
                        onChange={(event) => updateField("electricityNumber", event.target.value)}
                        placeholder="رقم الاشتراك"
                      />
                    </label>

                    <label>
                      اسم المالك / المستأجر
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(event) => updateField("ownerName", event.target.value)}
                        placeholder="اسم المالك أو المستأجر"
                      />
                    </label>

                    <label>
                      العنوان
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(event) => updateField("address", event.target.value)}
                        placeholder="العنوان"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-card">
                  <h3>توثيق الزيارة</h3>

                  <div className="form-grid single">
                    <label>
                      تاريخ الزيارة
                      <input
                        type="text"
                        value={formData.visitDate}
                        onChange={(event) => updateField("visitDate", event.target.value)}
                      />
                    </label>

                    <label>
                      وقت الزيارة
                      <input
                        type="text"
                        value={formData.visitTime}
                        onChange={(event) => updateField("visitTime", event.target.value)}
                      />
                    </label>

                    <label>
                      الفترة
                      <select
                        value={formData.shift}
                        onChange={(event) => updateField("shift", event.target.value)}
                        disabled={user.role === "field" && user.shift !== "كل الفترات"}
                      >
                        {shiftOptions.map((shift) => (
                          <option key={shift}>{shift}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      حالة الموقع
                      <select
                        value={formData.gpsStatus}
                        onChange={(event) => updateField("gpsStatus", event.target.value)}
                      >
                        <option>داخل النطاق</option>
                        <option>خارج النطاق</option>
                      </select>
                    </label>

                    <label>
                      الإجراء المتخذ
                      <select
                        value={formData.actionTaken}
                        onChange={(event) => updateField("actionTaken", event.target.value)}
                      >
                        <option>لا توجد ملاحظات</option>
                        <option>توجد ملاحظات</option>
                        <option>أعطي مهلة للتصحيح</option>
                        <option>تحتاج إعادة زيارة</option>
                      </select>
                    </label>

                    <label>
                      المهلة إن وجدت
                      <input
                        type="text"
                        value={formData.deadlineHours}
                        onChange={(event) => updateField("deadlineHours", event.target.value)}
                        placeholder="المهلة"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <h3>📸 الصور المرفقة</h3>

                <div className="form-grid">
                  <label>
                    صورة واجهة السكن
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => handlePhotoUpload(event, "صورة واجهة السكن")}
                    />
                  </label>

                  <label>
                    صورة الترخيص / اللوحة
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => handlePhotoUpload(event, "صورة الترخيص / اللوحة")}
                    />
                  </label>

                  <label>
                    صورة الملاحظات
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => handlePhotoUpload(event, "صورة الملاحظات")}
                    />
                  </label>
                </div>

                {formData.photos.length > 0 && (
                  <div className="notes-list" style={{ marginTop: "16px" }}>
                    {formData.photos.map((photo) => (
                      <span className="note-chip" key={photo.id}>
                        ✅ {photo.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="inspection-header">
                <div>
                  <span>{activeForm.emoji}</span>
                  <h3>{activeForm.title}</h3>
                  <p>{activeForm.subtitle}</p>
                </div>
              </div>

              <div className="inspection-sections">
                {activeForm.questions.map((section) => (
                  <div className="inspection-section" key={section.section}>
                    <h3>{section.section}</h3>

                    <div className="inspection-list">
                      {section.items.map((item, index) => (
                        <div className="inspection-item" key={item}>
                          <strong>{index + 1}</strong>
                          <span>{item}</span>

                          <div className="answer-buttons">
                            {["يوجد", "لا يوجد", "غير منطبق"].map((answer) => (
                              <button
                                type="button"
                                key={answer}
                                className={answers[item] === answer ? "active" : ""}
                                onClick={() => updateAnswer(item, answer)}
                              >
                                {answer}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-card notes-card">
                <h3>🖊️ الملاحظات النهائية</h3>
                <textarea
                  value={formData.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="الملاحظات أو الإجراء المتخذ في الزيارة"
                />
              </div>

              <div className="submit-row">
                <button type="submit" className="main-submit" disabled={savingForm}>
                  {savingForm ? "جاري حفظ الاستمارة..." : "✅ إرسال الاستمارة وحفظ التعبئة"}
                </button>
              </div>
            </form>
          </section>
        )}

        {activeView === "submissions" && (
          <section className="content-grid">
            <div className="content-card wide">
              <div className="card-head">
                <div>
                  <h3>📚 سجل التعبئة</h3>
                  <p>النماذج المسجلة حسب الصلاحية.</p>
                </div>
              </div>

              {visibleSubmissions.length === 0 ? (
                <div className="empty-state">
                  <h3>لا توجد تعبئات مسجلة</h3>
                  <p>سيظهر السجل بعد إرسال أول استمارة.</p>
                </div>
              ) : (
                <div className="submission-grid">
                  {visibleSubmissions.map((item) => (
                    <button
                      type="button"
                      className="submission-card"
                      key={item.id}
                      onClick={() => onOpenSubmission(item)}
                    >
                      <div>
                        <span>{formTypes[item.formType].emoji}</span>
                        <h3>{item.housingName || "سكن بدون اسم"}</h3>
                        <p>{formTypes[item.formType].title}</p>
                      </div>

                      <div className="submission-meta">
                        <small>الموظف: {item.employee}</small>
                        <small>الفترة: {item.shift}</small>
                        <small>وقت الإرسال: {item.submittedAt}</small>
                        <small>الصور: {item.photos?.length || 0}</small>
                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeView === "users" && (
          <UserManagementPage users={users} loadAllData={loadAllData} currentUser={user} />
        )}

        {activeView === "reports" && (
          <section className="content-grid">
            <div className="content-card wide">
              <div className="card-head">
                <div>
                  <h3>🛡️ القراءة التنفيذية</h3>
                  <p>ملخص رقابي لحالة التشغيل.</p>
                </div>
              </div>

              <div className="executive-note">
                <p>
                  النظام يعرض الجولات والتعبئات حسب الصلاحيات المعتمدة لكل مستخدم،
                  مع إظهار مؤشرات الالتزام، النماذج التي تحتاج مراجعة، وتوزيع العمل
                  حسب الفترات.
                </p>
              </div>

              <div className="notes-list">
                <span className="note-chip">👑 الإدارة: تحكم كامل</span>
                <span className="note-chip">🏛️ رئيس اللجنة: رقابة عامة</span>
                <span className="note-chip">🕓 المشرف: متابعة الفترة</span>
                <span className="note-chip">📝 الموظف: تعبئة ميدانية</span>
                <span className="note-chip">🔐 صلاحيات قابلة للتفعيل والإيقاف</span>
              </div>
            </div>

            <div className="content-card wide">
              <div className="card-head">
                <div>
                  <h3>👥 توزيع المستخدمين</h3>
                  <p>ملخص الأدوار الحالية.</p>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-box">
                  <span>إداريون</span>
                  <strong>{users.filter((item) => item.role === "admin").length}</strong>
                </div>
                <div className="summary-box">
                  <span>رؤساء لجنة</span>
                  <strong>{users.filter((item) => item.role === "committee_head").length}</strong>
                </div>
                <div className="summary-box">
                  <span>مشرفون</span>
                  <strong>{users.filter((item) => item.role === "supervisor").length}</strong>
                </div>
                <div className="summary-box">
                  <span>موظفون ميدانيون</span>
                  <strong>{users.filter((item) => item.role === "field").length}</strong>
                </div>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState("login");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.currentUserId);
    return storedId ? Number(storedId) : null;
  });

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((user) => user.id === currentUserId && user.status === "نشط") || null;
  }, [users, currentUserId]);

  async function loadAllData() {
    setLoading(true);

    const [usersResponse, visitsResponse, submissionsResponse] = await Promise.all([
      supabase.from("users_profiles").select("*").order("id", { ascending: true }),
      supabase.from("visits").select("*").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    ]);

    if (usersResponse.error) {
      alert(`خطأ تحميل المستخدمين: ${usersResponse.error.message}`);
    } else {
      setUsers((usersResponse.data || []).map(toUser));
    }

    if (visitsResponse.error) {
      alert(`خطأ تحميل الجولات: ${visitsResponse.error.message}`);
    } else {
      setVisits((visitsResponse.data || []).map(toVisit));
    }

    if (submissionsResponse.error) {
      alert(`خطأ تحميل الاستمارات: ${submissionsResponse.error.message}`);
    } else {
      setSubmissions((submissionsResponse.data || []).map(toSubmission));
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (!loading && currentUser) {
      setScreen("dashboard");
    } else if (!loading && currentUserId && !currentUser) {
      localStorage.removeItem(STORAGE_KEYS.currentUserId);
      setCurrentUserId(null);
      setScreen("login");
    }
  }, [loading, currentUser, currentUserId]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  async function handleLogin(nationalId, password) {
    if (!nationalId || !password) {
      return { error: "يرجى إدخال رقم الهوية وكلمة المرور." };
    }

    const { data, error } = await supabase
      .from("users_profiles")
      .select("*")
      .eq("national_id", nationalId.trim())
      .maybeSingle();

    if (error || !data) {
      return { error: "رقم الهوية غير مسجل في النظام." };
    }

    const user = toUser(data);

    if (user.status !== "نشط") {
      return { error: "هذا الحساب غير مفعل. يرجى مراجعة إدارة النظام." };
    }

    if (user.password !== password) {
      return { error: "كلمة المرور غير صحيحة." };
    }

    localStorage.setItem(STORAGE_KEYS.currentUserId, String(user.id));
    setCurrentUserId(user.id);

    const exists = users.some((item) => item.id === user.id);
    if (!exists) {
      setUsers((current) => [...current, user]);
    }

    setScreen("dashboard");
    return { user };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    setCurrentUserId(null);
    setSelectedSubmission(null);
    setScreen("login");
  }

  let content = null;

  if (loading) {
    content = (
      <main className="auth-page" dir="rtl">
        <section className="reset-card">
          <div className="reset-icon">⏳</div>
          <h1>جاري تحميل النظام</h1>
          <p>يتم الاتصال بقاعدة البيانات.</p>
        </section>
      </main>
    );
  } else if (screen === "forgot") {
    content = (
      <ForgotPasswordPage onBack={() => setScreen("login")} theme={theme} onToggleTheme={toggleTheme} />
    );
  } else if (screen === "profile" && currentUser) {
    content = (
      <ProfilePage
        employee={currentUser}
        onBack={() => setScreen("dashboard")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  } else if (screen === "submissionDetails" && selectedSubmission) {
    content = (
      <SubmissionDetails
        submission={selectedSubmission}
        onBack={() => setScreen("dashboard")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  } else if (screen === "dashboard" && currentUser) {
    content = (
      <DashboardPage
        user={currentUser}
        users={users}
        loadAllData={loadAllData}
        visits={visits}
        submissions={submissions}
        onLogout={logout}
        onProfile={() => setScreen("profile")}
        onOpenSubmission={(submission) => {
          setSelectedSubmission(submission);
          setScreen("submissionDetails");
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  } else {
    content = (
      <LoginPage
        onLogin={handleLogin}
        onForgotPassword={() => setScreen("forgot")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return <div className={`theme-shell theme-${theme}`}>{content}</div>;
}

export default App;