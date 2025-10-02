# كيفية نشر بوت التليجرام على منصة Render

## مقدمة
هذا الدليل يشرح كيفية نشر بوت التليجرام الخاص بك على منصة Render، وهي منصة سحابية تقدم استضافة مجانية للتطبيقات. سنتبع خطوات واضحة لضمان نشر البوت بنجاح.

## المتطلبات الأساسية

### 1. إنشاء حساب على Render
1. اذهب إلى [https://render.com](https://render.com)
2. انقر على "Get Started" وقم بإنشاء حساب جديد
3. يمكنك استخدام حساب Google أو GitHub للتسجيل

### 2. إعداد المتغيرات البيئية
قبل النشر، تحتاج إلى جمع المعلومات التالية:

#### أ) رمز بوت التليجرام (TELEGRAM_TOKEN)
1. افتح تطبيق Telegram
2. ابحث عن [@BotFather](https://t.me/BotFather)
3. أرسل الأمر `/newbot` لإنشاء بوت جديد أو `/mybots` لاستخدام بوت موجود
4. انسخ الرمز المقدم من BotFather - يبدو مثل: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`

#### ب) معرف جدول Google Sheets (SPREADSHEET_ID)
1. افتح جدول Google Sheets الخاص بك
2. انسخ المعرف من عنوان URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

#### ج) بيانات اعتماد Google Sheets (GOOGLE_CREDENTIALS)
1. انتقل إلى [Google Cloud Console](https://console.cloud.google.com/)
2. قم بإنشاء مشروع جديد أو استخدام مشروع موجود
3. فعّل Google Sheets API
4. انتقل إلى "Credentials" > "Create Credentials" > "Service Account"
5. أدخل اسم الحساب وانقر "Create"
6. امنح الأذونات المناسبة
7. انقر على "Create Key" وحدد النوع JSON
8. سيتم تنزيل ملف JSON - سنحتاج إلى محتواه لاحقاً

## خطوات النشر على Render

### 1. إنشاء خدمة Web Service على Render
1. سجل الدخول إلى حسابك على Render
2. انقر على "New" > "Web Service"
3. اختر "Build and deploy from a Git repository" إذا كنت تريد رفع الكود من مستودع Git
4. أو اختر "Deploy from a public repository" إذا كان الكود على GitHub

### 2. إعداد إعدادات النشر
1. **Name**: اختر اسماً لخدمتك (مثلاً: medical-booking-bot)
2. **Region**: اختر المنطقة الأقرب لمستخدميك
3. **Branch**: اختر الفرع الذي تريد نشره (عادة master أو main)
4. **Root Directory**: اتركه فارغاً إذا كان الكود في الجذر
5. **Environment**: اختر "Node"
6. **Build Command**: اتركه كما هو (`npm install`)
7. **Start Command**: اتركه كما هو (`npm start`)

### 3. إعداد المتغيرات البيئية
في قسم "Environment Variables" أضف المتغيرات التالية:

```
TELEGRAM_TOKEN=الرمز الذي حصلت عليه من BotFather
SPREADSHEET_ID=معرف جدول Google Sheets
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**ملاحظة مهمة**: بالنسبة لـ GOOGLE_CREDENTIALS، يجب أن تنسخ محتوى ملف JSON الذي حصلت عليه من Google Cloud وتحوله إلى سلسلة نصية واحدة (string) دون أي فواصل أسطر إضافية.

### 4. إعداد Webhook للبوت
بما أن Render لا يدعم polling، نحتاج إلى إعداد webhook للبوت:

1. بعد نشر البوت بنجاح، انسخ عنوان URL الخاص بالخدمة من Render
2. افتح متصفحك وأدخل هذا الرابط:
   ```
   https://api.telegram.org/bot[TELEGRAM_TOKEN]/setWebhook?url=[RENDER_SERVICE_URL]/webhook
   ```
   مثلاً:
   ```
   https://medical-booking-bot.onrender.com/webhook
   ```

## إعدادات جدول Google Sheets

تأكد من أن جدولك مهيأ بالشكل التالي:

| المركز الصحي | العيادة | التاريخ | الوقت | الحالة | معرف المستخدم | اسم المريض | عمر المريض |
|-------------|---------|---------|-------|--------|---------------|------------|------------|
| مستشفى الملك فهد | قسم القلب | 03/10/2025 | 09:00 | متاح | | | |
| مستشفى الملك فهد | قسم العيون | 03/10/2025 | 10:30 | محجوز | 123456789 | أحمد محمد | 35 |

## استكشاف الأخطاء وإصلاحها

### 1. إذا لم يستجب البوت:
- تحقق من أن TELEGRAM_TOKEN صحيح
- تأكد من إعداد webhook بشكل صحيح
- راجع سجلات Render (Logs) للبحث عن أخطاء

### 2. إذا لم يظهر أي مراكز صحية:
- تحقق من أن SPREADSHEET_ID صحيح
- تأكد من أن جدول Google Sheets مشترك مع حساب الخدمة
- تحقق من تنسيق التاريخ في الجدول (يجب أن يكون DD/MM/YYYY)

### 3. إذا لم يتم حجز الموعد:
- تحقق من صلاحيات حساب الخدمة على جدول Google Sheets
- تأكد من أن الأعمدة مهيأة بشكل صحيح

## معلومات إضافية

### تحديث البوت
لتحديث البوت بعد إجراء تغييرات:
1. ارفع التغييرات إلى مستودع Git
2. Render سيقوم تلقائياً بإعادة النشر
3. أو يمكنك النقر على "Manual Deploy" في لوحة التحكم

### مراقبة الأداء
- استخدم علامة "Logs" في Render لمراقبة أداء البوت
- تحقق من "Metrics" لمراقبة استخدام الموارد

### الأمان
- لا تشارك متغيرات البيئة مع أحد
- قم بتحديث مفاتيح الوصول بانتظام
- استخدم HTTPS دائماً في الاتصالات

## خاتمة
باتباع هذا الدليل، يجب أن يكون بوت التليجرام الخاص بك يعمل بشكل صحيح على منصة Render. إذا واجهت أي مشاكل، راجع سجلات Render وتأكد من صحة جميع المتغيرات البيئية.