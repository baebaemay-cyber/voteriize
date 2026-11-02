# Vote Tracker (MAMA / MMA)

เว็บติดตามยอดโหวต วางบน GitHub Pages ได้เลย ใช้ Firebase เป็นฐานข้อมูลและระบบล็อกอิน (ฟรี)

- **MAMA**: ผู้ชมเห็นเป็น % เท่านั้น ยอดจริงเก็บในส่วนที่อ่านได้เฉพาะแอดมิน
- **MMA**: การ์ดของเรา (RIIZE) มี 2 บาร์ในกรอบเดียว บาร์ที่สองคือวงที่อยู่เหนือขึ้นไป แสดงเป็นอิโมจิ ไม่โชว์ชื่อ บอกแค่ขาดอีกกี่โหวตจะแซง
- ปุ่มแชร์ทวิต + ปุ่มโหวตเลย
- แอดมินล็อกอินที่ปุ่ม `ADMIN` ล่างสุดของหน้า แล้วกรอกยอดเป็นตัวเลขปกติ

## ตั้งค่า Firebase (ทำครั้งเดียว)

1. ไป https://console.firebase.google.com → **Add project**
2. **Build → Firestore Database → Create database** (เลือก production mode)
3. แท็บ **Rules** → วางเนื้อหาจาก `firestore.rules` แล้ว **เปลี่ยนอีเมลเป็นอีเมลแอดมินของคุณ** → Publish
4. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**
5. แท็บ **Users → Add user** ใส่อีเมลและรหัสผ่านแอดมิน (ต้องตรงกับอีเมลใน rules)
6. **Authentication → Settings → Authorized domains → Add domain** ใส่ `ชื่อผู้ใช้.github.io`
7. **Project settings (⚙️) → Your apps → Web (</>)** → Register app แล้วคัดลอกค่า config ไปใส่ใน `firebase-config.js`

## อัปขึ้น GitHub Pages

1. สร้าง repo ใหม่ แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (ใส่ที่ root)
2. **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**
3. รอสักครู่ เว็บจะอยู่ที่ `https://ชื่อผู้ใช้.github.io/ชื่อ-repo/`

## วิธีใช้

- กด `ADMIN` ล่างสุด → ล็อกอิน → เลือก MAMA หรือ MMA → กรอกชื่อ/ยอดโหวต → **บันทึก**
- MMA: ใส่อิโมจิให้แต่ละวง และติ๊ก **ของเรา** ที่แถว RIIZE (ถ้าไม่ติ๊ก ระบบหาแถวที่ชื่อมีคำว่า RIIZE ให้)
- ช่อง "ลิงก์ไปโหวต" และ "แฮชแท็ก" ใช้กับปุ่มโหวตและข้อความทวิต

## หมายเหตุ

- `apiKey` ใน `firebase-config.js` ไม่ใช่ความลับ ความปลอดภัยอยู่ที่ `firestore.rules` (เขียนได้เฉพาะอีเมลแอดมิน, ยอดจริงอ่านได้เฉพาะแอดมิน)
- ผู้ชมอ่านได้เฉพาะคอลเลกชัน `public` ซึ่งมีแค่ % และส่วนต่างโหวตที่คำนวณแล้ว
- แผนฟรี (Spark) ของ Firebase เพียงพอสำหรับเว็บแบบนี้
