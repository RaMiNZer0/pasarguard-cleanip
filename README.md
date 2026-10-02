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

* **⚡ اسکن و اعمال خودکار:** ارزیابی دوره‌ای تاخیر (Latency) و سلامت آی‌پی‌های تمیز کلودفلر از داخل ایران.
* **📱 تفکیک اپراتورهای ایران:** پوشش مجزا برای **همراه اول (MCI)**، **ایرانسل (MTN)** و **مخابرات / وای‌فای (Wifi)**.
* **🖥️ رابط کاربری مستقیم درون داشبورد پاسارگارد:** اضافه شدن تب اختصاصی `🛡️ Clean IP Auto-Pilot` به منوی وب بدون نیاز به ابزار جانبی.
* **🔒 امنیت ۱۰۰٪ برای هسته و پنل:**
  * **بدون تغییر در هسته (Core):** ترافیک Xray و نودهای PasarGuard-Node بدون تغییر باقی می‌مانند.
  * **بدون تداخل با دیتابیس:** تنظیمات در فایلی مستقل نگهداری می‌شوند و هیچ تغییری در جداول SQLite یا PostgreSQL پنل ایجاد نمی‌شود.
  * **استفاده از API رسمی:** به‌روزرسانی هاست‌ها دقیقاً مطابق استانداردهای خود پاسارگارد صورت می‌پذیرد.
* **🔄 خودترمیمی در برابر آپدیت:** مقاومت کامل در برابر `pasarguard update` به لطف سرویس مانیتورینگ خودکار.

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
