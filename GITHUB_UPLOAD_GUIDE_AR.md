# دليل رفع مشروع بوت التليجرام إلى GitHub

## مقدمة
هذا الدليل يشرح كيفية رفع مشروع بوت التليجرام الخاص بك إلى GitHub، وهو منصة استضافة مجانية للبرمجيات تستخدم نظام Git. سنتبع خطوات واضحة لضمان رفع المشروع بنجاح.

## المتطلبات الأساسية

### 1. إنشاء حساب على GitHub
1. اذهب إلى [https://github.com](https://github.com)
2. انقر على "Sign up" وقم بإنشاء حساب جديد
3. اتبع التعليمات لإكمال التسجيل

### 2. تثبيت Git (إذا لم يكن مثبتاً)
لقد تحققنا من أن Git مثبت على جهازك بالفعل، وإصداره هو 2.48.1.windows.1

## خطوات رفع المشروع إلى GitHub

### 1. إنشاء مستودع جديد على GitHub
1. سجل الدخول إلى حسابك على GitHub
2. انقر على "+" في الزاوية العلوية اليمنى واختر "New repository"
3. أدخل اسم المستودع (مثلاً: medical-booking-bot)
4. اختر "Public" أو "Private" حسب تفضيلك
5. **لا تقم بتحديد** "Initialize this repository with a README"
6. اترك خيارات الإضافة الأخرى فارغة
7. انقر على "Create repository"

### 2. إعداد المستودع المحلي على جهازك
افتح "Git Bash" أو "Command Prompt" في مجلد المشروع الخاص بك ونفذ الأوامر التالية:

```bash
# تهيئة المستودع المحلي
git init

# إضافة جميع الملفات
git add .

# إنشاء أول commit
git commit -m "Initial commit: Medical Booking Bot"

# ربط المستودع المحلي بالمستودع على GitHub
git branch -M main

# إضافة عنوان المستودع البعيد (استبدل USERNAME و REPOSITORY_NAME بأسماء حسابك ومستودعك)
git remote add origin https://github.com/USERNAME/REPOSITORY_NAME.git
```

### 3. رفع الكود إلى GitHub
نفذ الأمر التالي لرفع الكود:

```bash
git push -u origin main
```

قد يُطلب منك إدخال اسم المستخدم وكلمة المرور. إذا كنت تستخدم المصادقة الثنائية، ستحتاج إلى إنشاء "Personal Access Token" من إعدادات GitHub.

### 4. إنشاء Personal Access Token (إذا لزم الأمر)
1. سجل الدخول إلى GitHub
2. انتقل إلى "Settings" > "Developer settings" > "Personal access tokens"
3. انقر على "Generate new token"
4. اختر الأذونات المناسبة (repo و workflow على الأقل)
5. انسخ الرمز الم 생성 واستخدمه بدلاً من كلمة المرور

## تنظيم ملفات المشروع

### 1. إنشاء ملف README.md
أنشئ ملف README.md يحتوي على وصف المشروع:

```markdown
# بوت حجز المواعيد الطبية

بوت تليجرام متكامل لإدارة حجز المواعيد الطبية باستخدام Google Sheets كقاعدة بيانات.

## الميزات
- حجز المواعيد عبر بوت تليجرام
- إدارة المراكز الصحية والعيادات
- جدولة المواعيد وعرض الأوقات المتاحة
- تخزين البيانات في Google Sheets
- جمع معلومات المرضى (الاسم والعمر)

## التقنيات المستخدمة
- Node.js
- Telegram Bot API
- Google Sheets API
- Express.js

## الإعداد
1. إنشاء بوت على Telegram باستخدام BotFather
2. إعداد Google Sheets مع API credentials
3. تعيين المتغيرات البيئية
4. تشغيل البوت

## التثبيت
\`\`\`
npm install
npm start
\`\`\`

## التوزيع
هذا المشروع مرخص تحت رخصة MIT.
```

### 2. تحديث ملف .gitignore
تأكد من وجود ملف [.gitignore](file:///c%3A/Users/hussein%20tech/StudioProjects/New%20folder%20%284%29/.gitignore) يحتوي على:

```
node_modules/
.env
*.log
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## إدارة المتغيرات البيئية

### 1. إنشاء ملف .env.example
أنشئ ملف .env.example كمثال للمتغيرات المطلوبة:

```
# Telegram Bot Token - احصل عليه من @BotFather
TELEGRAM_TOKEN=your_telegram_bot_token_here

# Google Sheets Configuration
SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_CREDENTIALS=your_google_credentials_json_here

# Admin Chat ID (اختياري)
ADMIN_CHAT_ID=your_admin_chat_id_here
```

## إعدادات GitHub إضافية

### 1. إضافة وصف ومواضيع للمستودع
1. انتقل إلى صفحة المستودع على GitHub
2. انقر على "Settings"
3. في قسم "General"، أضف وصفاً للمشروع
4. في قسم "Topics"، أضف مواضيع مثل: telegram-bot, google-sheets, nodejs

### 2. تمكين GitHub Pages (اختياري)
1. انتقل إلى "Settings" > "Pages"
2. اختر فرع "main" ومسار "/docs" أو مجلد الجذر
3. انقر على "Save"

## إدارة الإصدارات

### 1. إنشاء إصدار أولي
بعد رفع المشروع، يمكنك إنشاء إصدار أولي:

```bash
# إنشاء وسم للإصدار
git tag -a v1.0.0 -m "الإصدار الأول من بوت الحجز الطبي"

# رفع الوسوم إلى GitHub
git push origin --tags
```

### 2. إنشاء Release على GitHub
1. انتقل إلى صفحة المستودع
2. انقر على "Releases" > "Create a new release"
3. اختر الوسم الذي أنشأته
4. أضف عنوان ووصف للإصدار
5. انقر على "Publish release"

## أفضل الممارسات

### 1. تنظيم Commits
استخدم رسائل commit واضحة ومفيدة:

```bash
git commit -m "feat: إضافة جمع معلومات المريض"
git commit -m "fix: إصلاح مشكلة تنسيق التاريخ"
git commit -m "docs: تحديث ملف README"
```

### 2. استخدام الفروع (Branches)
للميزات الجديدة، استخدم فروع منفصلة:

```bash
# إنشاء فرع جديد
git checkout -b feature/patient-info

# بعد الانتهاء من الميزة
git add .
git commit -m "feat: إضافة جمع معلومات المريض"
git push origin feature/patient-info

# بعد المراجعة، ادمج الفرع مع main
git checkout main
git merge feature/patient-info
git push origin main
```

## استكشاف الأخطاء وإصلاحها

### 1. إذا فشل الأمر git push
- تحقق من عنوان المستودع البعيد:
  ```bash
  git remote -v
  ```
- تأكد من أن اسم المستودع وعنوانه صحيحان

### 2. إذا طلب كلمة مرور باستمرار
- استخدم Personal Access Token بدلاً من كلمة المرور
- أو قم بإعداد SSH keys

### 3. إذا كان هناك ملفات كبيرة لا تُرفع
- استخدم Git LFS للملفات الكبيرة
- أو انقل الملفات الكبيرة إلى خدمات أخرى

## خاتمة
باتباع هذا الدليل، يجب أن يكون مشروعك مرفوعاً إلى GitHub بنجاح. يمكنك الآن مشاركة المشروع مع الآخرين، تتبع التغييرات، وإدارة الإصدارات بسهولة.

## معلومات إضافية

### روابط مفيدة
- [وثائق GitHub](https://docs.github.com/ar)
- [دليل Git](https://git-scm.com/book/ar/v2)
- [بوت Telegram API](https://core.telegram.org/bots/api)
- [Google Sheets API](https://developers.google.com/sheets/api)

### الدعم
إذا واجهت أي مشاكل، يمكنك:
1. مراجعة سجل الأخطاء (logs)
2. التحقق من صحة المتغيرات البيئية
3. التأكد من صلاحيات الوصول إلى Google Sheets
4. مراجعة مستندات GitHub والـ API المستخدمة