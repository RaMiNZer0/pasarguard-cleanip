# 🛡️ PasarGuard Auto Clean IP

<div dir="rtl" align="right">

### سوییچر هوشمند و خودکار Clean IP کلودفلر برای پنل پاسارگارد (PasarGuard)
**تزریق مستقیم به داشبورد تحت وب • سازگاری ۱۰۰٪ با هسته و نودها • بدون دستکاری دیتابیس**

<p align="center">
  <img alt="PasarGuard" src="https://img.shields.io/badge/PasarGuard-Compatible-b8860b?style=for-the-badge&labelColor=3a2d09">
  <img alt="Clean IP" src="https://img.shields.io/badge/Cloudflare-Clean%20IP-059669?style=for-the-badge&labelColor=064e3b">
  <img alt="Language" src="https://img.shields.io/badge/Language-Persian%20%7C%20English-0284c7?style=for-the-badge">
</p>

---

## 🌟 ویژگی‌های کلیدی
 
* **⚡ تست زنده پینگ و گزینش دستی آی‌پی‌ها:** امکان سنجش تاخیر میلی‌ثانیه‌ای تک‌تک آی‌پی‌ها (از سمت سرور یا مستقیماً از مرورگر شما)، فیلتر بر اساس اپراتور، و اعمال فقط آی‌پی‌های تیک‌خورده و دلخواه کاربر.
* **🎲 اسکن رنج‌های رسمی کلودفلر و تزریق دستی:** تولید و نمونه‌برداری هوشمند از سابنت‌های کلودفلر به همراه تست پینگ درجا، در کنار کشوی چسباندن آی‌پی‌های دلخواه با یک کلیک.
* **🗑️ پاکسازی آی‌پی‌های قطعی:** حذف آنی تمام آی‌پی‌های فیلترشده یا قطعی با یک کلیک جهت مرتب‌سازی سریع جدول کاندیداها.
* **🩺 عیب‌یابی ۳ لایه‌ای زیرساخت کلودفلر:** تست خودکار ابر نارنجی DNS، هندشیک امنیتی TLS روی Clean IP، و پاسخگویی هسته مبدا پاسارگارد بدون نیاز به کلاینت.
* **🔒 محافظت هوشمند از SNI و دامنه هاست:** حفظ خودکار دامنه اصلی در فیلد SNI هنگام جایگزینی آدرس‌ها با Clean IP عددی تا ارتباط CDN هرگز قطع نشود.
* **🎨 ایزولاسیون کامل تم‌ها و نوار ابزار چسبان (Sticky):** رفع تداخل منوهای کشویی با تم‌های پنل (جلوگیری از متن سفید روی پس‌زمینه سفید) و ثابت ماندن دکمه‌های کنترل هنگام اسکرول لیست‌های طولانی.
* **📱 تفکیک اپراتورهای ایران:** فیدهای زنده برای **همراه اول (MCI)**، **ایرانسل (MTN)** و **مخابرات / وای‌فای (Wifi)**.
* **🔄 آپدیت آنلاین با یک کلیک:** امکان بررسی نسخه جدید و بروزرسانی خودکار افزونه مستقیماً از داخل پنل وب بدون نیاز به SSH.

---

## 🚀 نصب سریع روی سرور

برای نصب روی سروری که پنل پاسارگارد دارد، دستور زیر را در ترمینال اجرا کنید:

```bash
curl -fsSL https://raw.githubusercontent.com/RaMiNZer0/pasarguard-cleanip/main/install.sh | sudo bash
```

پس از اتمام نصب:
1. وارد پنل وب پاسارگارد شوید.
2. دکمه **`🛡️ Clean IP Auto-Pilot`** در بالای داشبورد نمایان می‌شود.
3. هاست CDN هدف خود را انتخاب کرده و روی **«⚡ اسکن و اعمال آنی»** کلیک کنید!

---

## 🛠️ بروزرسانی و حذف

### بروزرسانی به آخرین نسخه:
```bash
curl -fsSL https://raw.githubusercontent.com/RaMiNZer0/pasarguard-cleanip/main/install.sh | sudo bash
```

### حذف کامل افزونه (Uninstall):
```bash
curl -fsSL https://raw.githubusercontent.com/RaMiNZer0/pasarguard-cleanip/main/uninstall.sh | sudo bash
```

---

## 🏗️ معماری سیستم (Architecture)

```text
┌───────────────────────────────────────────────────────────┐
│                 داشبورد وب پاسارگارد                      │
│        [تب تزریق‌شده: Clean IP Auto-Pilot]                │
└─────────────────────────────┬─────────────────────────────┘
                              │ API Call
┌─────────────────────────────▼─────────────────────────────┐
│          PasarGuard Clean IP Extension Router             │
│                 /api/cleanip/scan-and-apply               │
│                                                           │
│  1. ارزیابی تاخیر و دریافت بهترین Clean IPها             │
│  2. ارسال درخواست امن به Host API پاسارگارد               │
└─────────────────────────────┬─────────────────────────────┘
                              │ PUT /api/host/{id}
┌─────────────────────────────▼─────────────────────────────┐
│              PasarGuard Host Manager (داخلی)              │
│       به‌روزرسانی خودکار آدرس‌های هاست بدون ری‌استارت هسته  │
└───────────────────────────────────────────────────────────┘
```

</div>

---

## English Documentation

**PasarGuard Auto Clean IP** is an automated Cloudflare clean IP orchestrator for PasarGuard panels. It periodically tests and updates destination addresses with the lowest latency clean IPs for Iranian ISPs (MCI, MTN, Mokhaberat).

### Installation:
```bash
curl -fsSL https://raw.githubusercontent.com/RaMiNZer0/pasarguard-cleanip/main/install.sh | sudo bash
```

### Safety Guarantees:
1. **Core Untouched:** Never touches Xray-core configurations or node processes.
2. **Zero DB Mutation:** Leaves PasarGuard's database schema 100% intact (no Alembic migration conflicts).
3. **Official API Usage:** Uses `/api/host/{id}` natively provided by PasarGuard.
