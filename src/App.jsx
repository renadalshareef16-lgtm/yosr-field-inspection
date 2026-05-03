import { useEffect, useMemo, useState } from "react";
import "./index.css";
import logoImage from "./assets/logo.png";

const STORAGE_KEYS = {
  users: "yosr_users_v2",
  visits: "yosr_visits_v2",
  submissions: "yosr_submissions_v2",
  currentUserId: "yosr_current_user_id_v2",
};

const roleOptions = [
  { value: "admin", label: "إدارية النظام" },
  { value: "committee_head", label: "رئيس لجنة الإسكان" },
  { value: "supervisor", label: "مشرف فترة" },
  { value: "field", label: "موظف ميداني" },
];

const shiftOptions = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة"];

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

const defaultUsers = [
  {
    id: 1,
    nationalId: "0000000001",
    fullName: "ريناد الشريف",
    name: "ريناد الشريف",
    phone: "05xxxxxxxx",
    username: "admin",
    password: "123456",
    role: "admin",
    roleLabel: "إدارية النظام",
    shift: "كل الفترات",
    supervisor: "—",
    status: "نشط",
    permissions: getPermissionsByRole("admin"),
    todayVisits: 0,
    suspicious: 0,
    accuracy: "100%",
  },
  {
    id: 2,
    nationalId: "0000000002",
    fullName: "محمد القحطاني",
    name: "محمد القحطاني",
    phone: "05xxxxxxxx",
    username: "alqhtani",
    password: "123456",
    role: "supervisor",
    roleLabel: "مشرف الفترة الثانية",
    shift: "الفترة الثانية",
    supervisor: "صهيب",
    status: "نشط",
    permissions: getPermissionsByRole("supervisor"),
    todayVisits: 0,
    suspicious: 0,
    accuracy: "100%",
  },
];

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
  photoStatus: "مرفقة",
  actionTaken: "لا توجد ملاحظات",
  deadlineHours: "",
  notes: "",
};

const emptyUserForm = {
  nationalId: "",
  fullName: "",
  phone: "",
  username: "",
  password: "",
  role: "field",
  shift: "الفترة الأولى",
  supervisor: "محمد القحطاني",
  status: "نشط",
  permissions: getPermissionsByRole("field"),
};

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function getRoleLabel(role) {
  return roleOptions.find((item) => item.value === role)?.label || "مستخدم";
}

function getRiskClass(risk) {
  if (risk === "مرتفع") return "danger";
  if (risk === "متوسط") return "warning";
  return "success";
}

function getStatusClass(status) {
  if (status === "نشط" || status === "معتمدة") return "success";
  if (status === "موقوف") return "danger";
  return "warning";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = onLogin(username.trim(), password.trim());

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
            <p>أدخل بيانات الحساب المعتمد للمتابعة إلى نظام الجولات الميدانية.</p>
          </div>

          <label>
            اسم المستخدم
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="اسم المستخدم"
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

            <button
              type="button"
              className="link-button"
              onClick={onForgotPassword}
            >
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
              <span>اسم المستخدم</span>
              <strong>{employee.username}</strong>
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
              <span>المشرف</span>
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

function SubmissionDetails({ submission, onBack, theme, onToggleTheme }) {
  const formMeta = formTypes[submission.formType];

  return (
    <main className="app-page" dir="rtl">
      <header className="topbar">
        <div>
          <span>تفاصيل التعبئة</span>
          <h1>{formMeta.title}</h1>
        </div>

        <div className="topbar-actions">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
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
              الموظف: {submission.employee} · الفترة: {submission.shift} · وقت
              الإرسال: {submission.submittedAt}
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

function UserManagementPage({ users, setUsers, currentUser }) {
  const [form, setForm] = useState(emptyUserForm);
  const [editingId, setEditingId] = useState(null);

  const supervisors = users.filter((user) => user.role === "supervisor");

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "role"
        ? {
            permissions: getPermissionsByRole(value),
            roleLabel: getRoleLabel(value),
            shift:
              value === "admin" || value === "committee_head"
                ? "كل الفترات"
                : current.shift === "كل الفترات"
                ? "الفترة الأولى"
                : current.shift,
            supervisor:
              value === "admin" || value === "committee_head"
                ? "—"
                : current.supervisor,
          }
        : {}),
    }));
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

  function saveUser(event) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.username.trim() || !form.password.trim()) {
      alert("الاسم الكامل واسم المستخدم وكلمة المرور حقول مطلوبة.");
      return;
    }

    const usernameTaken = users.some(
      (user) =>
        user.username.trim().toLowerCase() === form.username.trim().toLowerCase() &&
        user.id !== editingId
    );

    if (usernameTaken) {
      alert("اسم المستخدم مستخدم مسبقًا.");
      return;
    }

    if (editingId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingId
            ? {
                ...user,
                ...form,
                name: form.fullName,
                roleLabel:
                  form.role === "supervisor"
                    ? `مشرف ${form.shift}`
                    : getRoleLabel(form.role),
              }
            : user
        )
      );
    } else {
      const newUser = {
        id: Date.now(),
        ...form,
        name: form.fullName,
        roleLabel:
          form.role === "supervisor"
            ? `مشرف ${form.shift}`
            : getRoleLabel(form.role),
        todayVisits: 0,
        suspicious: 0,
        accuracy: "100%",
      };

      setUsers((current) => [newUser, ...current]);
    }

    resetForm();
  }

  function editUser(user) {
    setEditingId(user.id);
    setForm({
      nationalId: user.nationalId || "",
      fullName: user.fullName || user.name || "",
      phone: user.phone || "",
      username: user.username || "",
      password: user.password || "",
      role: user.role || "field",
      shift: user.shift || "الفترة الأولى",
      supervisor: user.supervisor || "—",
      status: user.status || "نشط",
      permissions: user.permissions || getPermissionsByRole(user.role || "field"),
    });
  }

  function toggleStatus(userId) {
    if (userId === currentUser.id) {
      alert("لا يمكن إيقاف الحساب الحالي.");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "نشط" ? "موقوف" : "نشط" }
          : user
      )
    );
  }

  function deleteUser(userId) {
    if (userId === currentUser.id) {
      alert("لا يمكن حذف الحساب الحالي.");
      return;
    }

    const confirmDelete = window.confirm("هل تريد حذف هذا المستخدم؟");
    if (!confirmDelete) return;

    setUsers((current) => current.filter((user) => user.id !== userId));
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
                اسم المستخدم
                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => updateForm("username", event.target.value)}
                  placeholder="اسم المستخدم"
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
                <select
                  value={form.role}
                  onChange={(event) => updateForm("role", event.target.value)}
                >
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
                المشرف التابع له
                <select
                  value={form.supervisor}
                  onChange={(event) => updateForm("supervisor", event.target.value)}
                  disabled={form.role === "admin" || form.role === "committee_head"}
                >
                  <option>—</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id}>{supervisor.fullName}</option>
                  ))}
                </select>
              </label>

              <label>
                حالة الحساب
                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                >
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
          <button type="submit" className="main-submit">
            {editingId ? "حفظ تعديل المستخدم" : "إنشاء المستخدم"}
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
                <th>اسم المستخدم</th>
                <th>الدور</th>
                <th>الفترة</th>
                <th>المشرف</th>
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
                  <td>{user.username}</td>
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
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => editUser(user)}
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => toggleStatus(user.id)}
                      >
                        {user.status === "نشط" ? "إيقاف" : "تفعيل"}
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => deleteUser(user.id)}
                      >
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

function VisitsTable({ visits }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>الموظف</th>
            <th>السكن</th>
            <th>رقم التصريح</th>
            <th>بداية الكشف</th>
            <th>وقت الإرسال</th>
            <th>المدة</th>
            <th>الفترة</th>
            <th>الموقع</th>
            <th>الصورة</th>
            <th>الحالة</th>
            <th>الخطورة</th>
          </tr>
        </thead>

        <tbody>
          {visits.length === 0 ? (
            <tr>
              <td colSpan="11">لا توجد جولات مسجلة.</td>
            </tr>
          ) : (
            visits.map((visit) => (
              <tr key={visit.id}>
                <td>{visit.employee}</td>
                <td>{visit.housing}</td>
                <td>{visit.permit}</td>
                <td>{visit.startTime}</td>
                <td>{visit.submitTime}</td>
                <td>{visit.duration}</td>
                <td>{visit.shift}</td>
                <td>{visit.gps}</td>
                <td>{visit.photo}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(visit.status)}`}>
                    {visit.status}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getRiskClass(visit.risk)}`}>
                    {visit.risk}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DashboardPage({
  user,
  users,
  setUsers,
  visits,
  setVisits,
  submissions,
  setSubmissions,
  onLogout,
  onProfile,
  onOpenSubmission,
  theme,
  onToggleTheme,
}) {
  const [activeView, setActiveView] = useState(getDefaultView(user));
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
    const compliance = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, first, second, third, review, approved, compliance };
  }, [visibleVisits]);

  const tabs = [
    {
      id: "overview",
      label: "📌 نظرة عامة",
      visible: user.permissions.canViewReports,
    },
    {
      id: "field",
      label: "📝 تعبئة استمارة",
      visible: user.permissions.canFillForms,
    },
    {
      id: "submissions",
      label: "📚 سجل التعبئة",
      visible: user.permissions.canViewSubmissions,
    },
    {
      id: "users",
      label: "👥 إدارة المستخدمين",
      visible: user.permissions.canManageUsers,
    },
    {
      id: "reports",
      label: "🛡️ الرقابة والتقارير",
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

  function submitInspection(event) {
    event.preventDefault();

    const selectedShift =
      user.role === "field" && user.shift !== "كل الفترات" ? user.shift : formData.shift;

    const newSubmission = {
      id: Date.now(),
      userId: user.id,
      employee: user.fullName,
      ...formData,
      shift: selectedShift,
      answers,
      submittedAt: getNowTime(),
      status:
        formData.gpsStatus === "خارج النطاق" || formData.photoStatus === "غير مرفقة"
          ? "تحتاج مراجعة"
          : "معتمدة",
      risk:
        formData.gpsStatus === "خارج النطاق" || formData.photoStatus === "غير مرفقة"
          ? "متوسط"
          : "منخفض",
    };

    const newVisit = {
      id: Date.now() + 1,
      userId: user.id,
      employee: user.fullName,
      housing: formData.housingName || "سكن جديد",
      permit: formData.permitNumber || "—",
      startTime: formData.visitTime || getNowTime(),
      submitTime: getNowTime(),
      duration: "قيد الربط",
      shift: selectedShift,
      gps: formData.gpsStatus,
      photo: formData.photoStatus,
      status: newSubmission.status,
      risk: newSubmission.risk,
    };

    setSubmissions((current) => [newSubmission, ...current]);
    setVisits((current) => [newVisit, ...current]);

    setFormData({
      ...emptyForm,
      shift: user.shift === "كل الفترات" ? "الفترة الأولى" : user.shift,
      visitDate: getTodayDate(),
      visitTime: getNowTime(),
    });

    setAnswers({});
    setActiveView("submissions");
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
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon purple">🧭</div>
            <span>إجمالي الجولات</span>
            <strong>{summary.total}</strong>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon green">🌅</div>
            <span>الفترة الأولى</span>
            <strong>{summary.first}</strong>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon orange">🌆</div>
            <span>الفترة الثانية</span>
            <strong>{summary.second}</strong>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon mint">🌙</div>
            <span>الفترة الثالثة</span>
            <strong>{summary.third}</strong>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon red">⚠️</div>
            <span>تحتاج مراجعة</span>
            <strong>{summary.review}</strong>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon purple">✅</div>
            <span>نسبة الالتزام</span>
            <strong>{summary.compliance}%</strong>
          </div>
        </section>

        {activeView === "overview" && (
          <>
            <section className="overview-panel">
              <div>
                <span>لوحة التشغيل اليومية</span>
                <h2>متابعة الجولات وتعبئة استمارات كشف مساكن الحجاج</h2>
                <p>
                  تعرض هذه اللوحة ملخص الجولات، حالات المراجعة، ونسبة الالتزام
                  حسب نطاق الصلاحية.
                </p>
              </div>

              <div className="system-status">
                <strong>🟢 تشغيل نشط</strong>
                <small>{user.roleLabel || getRoleLabel(user.role)}</small>
              </div>
            </section>

            <section className="command-layout">
              <div className="command-main">
                <span>🎯 مركز الرقابة الميدانية</span>
                <h2>قراءة موحدة لأداء الجولات</h2>
                <p>
                  يتم احتساب الجولات حسب الفترة، مع رصد النماذج التي تحتاج مراجعة
                  بسبب نقص الصورة أو خروج الموقع عن النطاق.
                </p>

                <div className="command-footer">
                  <div>
                    <strong>{summary.compliance}%</strong>
                    <small>التزام ميداني</small>
                  </div>
                  <div>
                    <strong>{summary.approved}</strong>
                    <small>جولات معتمدة</small>
                  </div>
                  <div>
                    <strong>{summary.review}</strong>
                    <small>تحتاج مراجعة</small>
                  </div>
                </div>
              </div>

              <div className="mini-command danger">
                <span>⚠️ أولوية المشرف</span>
                <strong>مراجعة النماذج الناقصة</strong>
              </div>

              <div className="mini-command">
                <span>📚 سجل التعبئة</span>
                <strong>{visibleSubmissions.length} نموذج</strong>
              </div>
            </section>

            <section className="content-grid">
              <div className="content-card">
                <div className="card-head">
                  <div>
                    <h3>📊 توزيع الجولات حسب الفترة</h3>
                    <p>الفترة الأولى / الثانية / الثالثة</p>
                  </div>
                </div>

                <div className="period-bars">
                  <div className="period-row">
                    <div>
                      <strong>🌅 الفترة الأولى</strong>
                      <span>8:00 ص - 4:00 م</span>
                    </div>
                    <div className="period-track">
                      <span style={{ width: `${Math.max(summary.first * 18, 8)}%` }} />
                    </div>
                    <b>{summary.first}</b>
                  </div>

                  <div className="period-row">
                    <div>
                      <strong>🌆 الفترة الثانية</strong>
                      <span>4:00 م - 12:00 ص</span>
                    </div>
                    <div className="period-track">
                      <span style={{ width: `${Math.max(summary.second * 18, 8)}%` }} />
                    </div>
                    <b>{summary.second}</b>
                  </div>

                  <div className="period-row">
                    <div>
                      <strong>🌙 الفترة الثالثة</strong>
                      <span>12:00 ص - 8:00 ص</span>
                    </div>
                    <div className="period-track">
                      <span style={{ width: `${Math.max(summary.third * 18, 8)}%` }} />
                    </div>
                    <b>{summary.third}</b>
                  </div>
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
                    <strong>
                      {visibleVisits.filter((item) => item.gps === "خارج النطاق").length}
                    </strong>
                  </div>

                  <div className="summary-box">
                    <span>📸 صور مرفقة</span>
                    <strong>
                      {visibleVisits.filter((item) => item.photo === "مرفقة").length}
                    </strong>
                  </div>

                  <div className="summary-box warning-box">
                    <span>🧾 نماذج</span>
                    <strong>{visibleSubmissions.length}</strong>
                  </div>
                </div>
              </div>

              <div className="content-card wide">
                <div className="card-head">
                  <div>
                    <h3>🧾 سجل الجولات الميدانية</h3>
                    <p>جدول رقابي لمتابعة الزيارات الميدانية</p>
                  </div>
                </div>

                <VisitsTable visits={visibleVisits} />
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
                        onChange={(event) =>
                          updateField("buildingNumber", event.target.value)
                        }
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
                        onChange={(event) =>
                          updateField("pilgrimsCount", event.target.value)
                        }
                        placeholder="عدد الحجاج"
                      />
                    </label>

                    <label>
                      رقم اشتراك الكهرباء
                      <input
                        type="text"
                        value={formData.electricityNumber}
                        onChange={(event) =>
                          updateField("electricityNumber", event.target.value)
                        }
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
                      حالة الصورة
                      <select
                        value={formData.photoStatus}
                        onChange={(event) => updateField("photoStatus", event.target.value)}
                      >
                        <option>مرفقة</option>
                        <option>غير مرفقة</option>
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
                        onChange={(event) =>
                          updateField("deadlineHours", event.target.value)
                        }
                        placeholder="المهلة"
                      />
                    </label>
                  </div>
                </div>
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
                <button type="submit" className="main-submit">
                  ✅ إرسال الاستمارة وحفظ التعبئة
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
          <UserManagementPage
            users={users}
            setUsers={setUsers}
            currentUser={user}
          />
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
                  <strong>
                    {users.filter((item) => item.role === "committee_head").length}
                  </strong>
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

  const [users, setUsers] = useState(() =>
    readStorage(STORAGE_KEYS.users, defaultUsers)
  );

  const [visits, setVisits] = useState(() =>
    readStorage(STORAGE_KEYS.visits, [])
  );

  const [submissions, setSubmissions] = useState(() =>
    readStorage(STORAGE_KEYS.submissions, [])
  );

  const [currentUserId, setCurrentUserId] = useState(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.currentUserId);
    return storedId ? Number(storedId) : null;
  });

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((user) => user.id === currentUserId && user.status === "نشط") || null;
  }, [users, currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.visits, JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (currentUser) {
      setScreen("dashboard");
    } else if (currentUserId) {
      localStorage.removeItem(STORAGE_KEYS.currentUserId);
      setCurrentUserId(null);
      setScreen("login");
    }
  }, [currentUser, currentUserId]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function handleLogin(username, password) {
    if (!username || !password) {
      return { error: "يرجى إدخال اسم المستخدم وكلمة المرور." };
    }

    const userByUsername = users.find(
      (user) => user.username.trim().toLowerCase() === username.trim().toLowerCase()
    );

    if (!userByUsername) {
      return { error: "اسم المستخدم غير صحيح." };
    }

    if (userByUsername.status !== "نشط") {
      return { error: "هذا الحساب غير مفعل. يرجى مراجعة إدارة النظام." };
    }

    if (userByUsername.password !== password) {
      return { error: "كلمة المرور غير صحيحة." };
    }

    localStorage.setItem(STORAGE_KEYS.currentUserId, String(userByUsername.id));
    setCurrentUserId(userByUsername.id);
    setScreen("dashboard");
    return { user: userByUsername };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    setCurrentUserId(null);
    setSelectedSubmission(null);
    setScreen("login");
  }

  let content = null;

  if (screen === "forgot") {
    content = (
      <ForgotPasswordPage
        onBack={() => setScreen("login")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
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
        setUsers={setUsers}
        visits={visits}
        setVisits={setVisits}
        submissions={submissions}
        setSubmissions={setSubmissions}
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